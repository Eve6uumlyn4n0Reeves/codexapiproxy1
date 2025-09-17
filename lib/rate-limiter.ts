import { getDatabase } from "./database/data-source"
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

// 数据库表结构（如果使用 Redis 可以简化）
interface RateLimitRecord {
  user_id: string
  request_count: number
  request_reset_time: Date
  token_count: number
  token_reset_time: Date
  updated_at: Date
}

export class RateLimiter {
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
    const now = new Date()
    const windowMs = limits.window * 1000
    const dayMs = 24 * 60 * 60 * 1000

    try {
      const dataSource = await getDatabase()

      // 查询或创建用户限流记录
      let record = await dataSource.query(`SELECT * FROM rate_limits WHERE user_id = ? LIMIT 1`, [userId])

      if (!record || record.length === 0) {
        // 创建新记录
        await dataSource.query(
          `INSERT INTO rate_limits (user_id, request_count, request_reset_time, token_count, token_reset_time, updated_at) 
           VALUES (?, 0, ?, 0, ?, ?)`,
          [userId, new Date(now.getTime() + windowMs), new Date(now.getTime() + dayMs), now],
        )
        record = [
          {
            user_id: userId,
            request_count: 0,
            request_reset_time: new Date(now.getTime() + windowMs),
            token_count: 0,
            token_reset_time: new Date(now.getTime() + dayMs),
          },
        ]
      }

      const current = record[0]

      // 重置请求计数如果窗口已过期
      if (now > new Date(current.request_reset_time)) {
        current.request_count = 0
        current.request_reset_time = new Date(now.getTime() + windowMs)
      }

      // 重置令牌计数如果天已过期
      if (now > new Date(current.token_reset_time)) {
        current.token_count = 0
        current.token_reset_time = new Date(now.getTime() + dayMs)
      }

      // 检查是否超出限制
      const requestAllowed = current.request_count < limits.requests
      const tokenAllowed = current.token_count + tokensRequested <= limits.tokens

      if (requestAllowed && tokenAllowed) {
        // 更新计数
        await dataSource.query(
          `UPDATE rate_limits SET request_count = ?, token_count = ?, 
           request_reset_time = ?, token_reset_time = ?, updated_at = ? 
           WHERE user_id = ?`,
          [
            current.request_count + 1,
            current.token_count + tokensRequested,
            current.request_reset_time,
            current.token_reset_time,
            now,
            userId,
          ],
        )
      }

      return {
        allowed: requestAllowed && tokenAllowed,
        remaining: Math.max(0, limits.requests - current.request_count),
        resetTime: new Date(current.request_reset_time).getTime(),
        tokenRemaining: Math.max(0, limits.tokens - current.token_count),
        tokenResetTime: new Date(current.token_reset_time).getTime(),
      }
    } catch (error) {
      console.error("[v0] Rate limiter error:", error)
      // 出错时允许请求，但记录错误
      return {
        allowed: true,
        remaining: limits.requests,
        resetTime: now.getTime() + windowMs,
        tokenRemaining: limits.tokens,
        tokenResetTime: now.getTime() + dayMs,
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

    try {
      const dataSource = await getDatabase()
      const record = await dataSource.query(`SELECT * FROM rate_limits WHERE user_id = ? LIMIT 1`, [userId])

      if (!record || record.length === 0) {
        return {
          requestsRemaining: limits.requests,
          tokensRemaining: limits.tokens,
          resetTime: Date.now() + limits.window * 1000,
          tokenResetTime: Date.now() + 24 * 60 * 60 * 1000,
        }
      }

      const current = record[0]
      return {
        requestsRemaining: Math.max(0, limits.requests - current.request_count),
        tokensRemaining: Math.max(0, limits.tokens - current.token_count),
        resetTime: new Date(current.request_reset_time).getTime(),
        tokenResetTime: new Date(current.token_reset_time).getTime(),
      }
    } catch (error) {
      console.error("[v0] Get remaining limits error:", error)
      return {
        requestsRemaining: limits.requests,
        tokensRemaining: limits.tokens,
        resetTime: Date.now() + limits.window * 1000,
        tokenResetTime: Date.now() + 24 * 60 * 60 * 1000,
      }
    }
  }

  // 清理过期记录
  static async cleanupExpiredRecords(): Promise<void> {
    try {
      const dataSource = await getDatabase()
      await dataSource.query(
        `DELETE FROM rate_limits WHERE updated_at < ?`,
        [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)], // 删除7天前的记录
      )
    } catch (error) {
      console.error("[v0] Cleanup expired records error:", error)
    }
  }
}

// 创建限流表的 SQL
export const createRateLimitTable = `
CREATE TABLE IF NOT EXISTS rate_limits (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL UNIQUE,
  request_count INT DEFAULT 0,
  request_reset_time TIMESTAMP NOT NULL,
  token_count INT DEFAULT 0,
  token_reset_time TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rate_limits_user_id (user_id),
  INDEX idx_rate_limits_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`
