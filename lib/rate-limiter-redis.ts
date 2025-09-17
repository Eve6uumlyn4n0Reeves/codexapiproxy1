import { redisCache } from "./redis"
import { UserRole } from "./database/entities/User"
import { config } from "./config"

interface RateLimitConfig {
  requests: number
  window: number // in seconds
  tokens: number
}

interface UserLimits {
  [UserRole.USER]: RateLimitConfig
  [UserRole.ADMIN]: RateLimitConfig
  [UserRole.SUPER_ADMIN]: RateLimitConfig
}

const RATE_LIMITS: UserLimits = {
  [UserRole.USER]: { requests: 60, window: 60, tokens: config.limits.defaultDailyTokenLimit },
  [UserRole.ADMIN]: { requests: 120, window: 60, tokens: config.limits.defaultWeeklyTokenLimit },
  [UserRole.SUPER_ADMIN]: { requests: 300, window: 60, tokens: config.limits.defaultMonthlyTokenLimit },
}

// Redis 版本的限流器（更高效）
export class RedisRateLimiter {
  static async checkRateLimit(
    userId: string,
    userRole: UserRole,
    tokensRequested = 0,
  ): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    tokenRemaining: number
    tokenResetTime: number
  }> {
    const limits = RATE_LIMITS[userRole]
    const now = Date.now()
    const windowMs = limits.window * 1000
    const dayMs = 24 * 60 * 60 * 1000

    const requestKey = `rate_limit:requests:${userId}`
    const tokenKey = `rate_limit:tokens:${userId}`

    try {
      // 使用 Redis 管道操作提高性能
      const pipeline = redisCache.pipeline()

      // 获取当前计数
      pipeline.get(requestKey)
      pipeline.get(tokenKey)
      pipeline.ttl(requestKey)
      pipeline.ttl(tokenKey)

      const results = await pipeline.exec()

      if (!results) {
        throw new Error("Pipeline execution failed")
      }

      const [requestCountResult, tokenCountResult, requestTtlResult, tokenTtlResult] = results

      let requestCount = 0
      let tokenCount = 0
      let requestResetTime = now + windowMs
      let tokenResetTime = now + dayMs

      // 解析请求计数
      if (requestCountResult[1]) {
        requestCount = Number.parseInt(requestCountResult[1] as string, 10) || 0
        const requestTtl = requestTtlResult[1] as number
        if (requestTtl > 0) {
          requestResetTime = now + requestTtl * 1000
        }
      }

      // 解析令牌计数
      if (tokenCountResult[1]) {
        tokenCount = Number.parseInt(tokenCountResult[1] as string, 10) || 0
        const tokenTtl = tokenTtlResult[1] as number
        if (tokenTtl > 0) {
          tokenResetTime = now + tokenTtl * 1000
        }
      }

      // 检查是否超出限制
      const requestAllowed = requestCount < limits.requests
      const tokenAllowed = tokenCount + tokensRequested <= limits.tokens

      if (requestAllowed && tokenAllowed) {
        // 更新计数（使用原子操作）
        const updatePipeline = redisCache.pipeline()

        if (requestCount === 0) {
          updatePipeline.setex(requestKey, limits.window, "1")
        } else {
          updatePipeline.incr(requestKey)
        }

        if (tokenCount === 0 && tokensRequested > 0) {
          updatePipeline.setex(tokenKey, 24 * 60 * 60, tokensRequested.toString())
        } else if (tokensRequested > 0) {
          updatePipeline.incrby(tokenKey, tokensRequested)
        }

        await updatePipeline.exec()
      }

      return {
        allowed: requestAllowed && tokenAllowed,
        remaining: Math.max(0, limits.requests - requestCount - (requestAllowed ? 1 : 0)),
        resetTime: requestResetTime,
        tokenRemaining: Math.max(0, limits.tokens - tokenCount - (tokenAllowed ? tokensRequested : 0)),
        tokenResetTime: tokenResetTime,
      }
    } catch (error) {
      console.error("[v0] Redis rate limiter error:", error)
      // Redis 出错时允许请求，但记录错误
      return {
        allowed: true,
        remaining: limits.requests,
        resetTime: now + windowMs,
        tokenRemaining: limits.tokens,
        tokenResetTime: now + dayMs,
      }
    }
  }

  static async getRemainingLimits(
    userId: string,
    userRole: UserRole,
  ): Promise<{
    requestsRemaining: number
    tokensRemaining: number
    resetTime: number
    tokenResetTime: number
  }> {
    const limits = RATE_LIMITS[userRole]
    const now = Date.now()

    const requestKey = `rate_limit:requests:${userId}`
    const tokenKey = `rate_limit:tokens:${userId}`

    try {
      const pipeline = redisCache.pipeline()
      pipeline.get(requestKey)
      pipeline.get(tokenKey)
      pipeline.ttl(requestKey)
      pipeline.ttl(tokenKey)

      const results = await pipeline.exec()

      if (!results) {
        throw new Error("Pipeline execution failed")
      }

      const [requestCountResult, tokenCountResult, requestTtlResult, tokenTtlResult] = results

      const requestCount = requestCountResult[1] ? Number.parseInt(requestCountResult[1] as string, 10) : 0
      const tokenCount = tokenCountResult[1] ? Number.parseInt(tokenCountResult[1] as string, 10) : 0
      const requestTtl = requestTtlResult[1] as number
      const tokenTtl = tokenTtlResult[1] as number

      return {
        requestsRemaining: Math.max(0, limits.requests - requestCount),
        tokensRemaining: Math.max(0, limits.tokens - tokenCount),
        resetTime: requestTtl > 0 ? now + requestTtl * 1000 : now + limits.window * 1000,
        tokenResetTime: tokenTtl > 0 ? now + tokenTtl * 1000 : now + 24 * 60 * 60 * 1000,
      }
    } catch (error) {
      console.error("[v0] Get remaining limits error:", error)
      return {
        requestsRemaining: limits.requests,
        tokensRemaining: limits.tokens,
        resetTime: now + limits.window * 1000,
        tokenResetTime: now + 24 * 60 * 60 * 1000,
      }
    }
  }

  // 清理过期的限流键（Redis 会自动过期，但可以手动清理）
  static async cleanupExpiredKeys(): Promise<void> {
    try {
      const keys = await redisCache.keys("rate_limit:*")
      if (keys.length === 0) return

      const pipeline = redisCache.pipeline()
      for (const key of keys) {
        pipeline.ttl(key)
      }

      const results = await pipeline.exec()
      if (!results) return

      // 删除已过期但未被 Redis 清理的键
      const expiredKeys = keys.filter((_, index) => {
        const ttl = results[index][1] as number
        return ttl === -1 // 没有过期时间设置的键
      })

      if (expiredKeys.length > 0) {
        await redisCache.del(...expiredKeys)
      }
    } catch (error) {
      console.error("[v0] Cleanup expired keys error:", error)
    }
  }

  // 获取用户的限流统计信息
  static async getUserRateLimitStats(userId: string): Promise<{
    requestCount: number
    tokenCount: number
    requestTtl: number
    tokenTtl: number
  }> {
    const requestKey = `rate_limit:requests:${userId}`
    const tokenKey = `rate_limit:tokens:${userId}`

    try {
      const pipeline = redisCache.pipeline()
      pipeline.get(requestKey)
      pipeline.get(tokenKey)
      pipeline.ttl(requestKey)
      pipeline.ttl(tokenKey)

      const results = await pipeline.exec()

      if (!results) {
        throw new Error("Pipeline execution failed")
      }

      const [requestCountResult, tokenCountResult, requestTtlResult, tokenTtlResult] = results

      return {
        requestCount: requestCountResult[1] ? Number.parseInt(requestCountResult[1] as string, 10) : 0,
        tokenCount: tokenCountResult[1] ? Number.parseInt(tokenCountResult[1] as string, 10) : 0,
        requestTtl: requestTtlResult[1] as number,
        tokenTtl: tokenTtlResult[1] as number,
      }
    } catch (error) {
      console.error("[v0] Get user rate limit stats error:", error)
      return {
        requestCount: 0,
        tokenCount: 0,
        requestTtl: -1,
        tokenTtl: -1,
      }
    }
  }
}
