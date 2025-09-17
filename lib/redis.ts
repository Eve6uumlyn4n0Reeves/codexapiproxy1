import Redis from "ioredis"
import { config } from "./config"

let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    if (config.redis.url) {
      redisClient = new Redis(config.redis.url, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })
    } else {
      redisClient = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })
    }

    redisClient.on("error", (error) => {
      console.error("[v0] Redis connection error:", error)
    })

    redisClient.on("connect", () => {
      console.log("[v0] Redis connected successfully")
    })
  }

  return redisClient
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

// Redis 缓存服务类
export class RedisCache {
  private redis: Redis

  constructor() {
    this.redis = getRedisClient()
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      await this.redis.setex(key, ttlSeconds, serialized)
    } catch (error) {
      console.error("[v0] Redis set error:", error)
      throw error
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error("[v0] Redis get error:", error)
      return null
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key)
      return result > 0
    } catch (error) {
      console.error("[v0] Redis del error:", error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error("[v0] Redis exists error:", error)
      return false
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, ttlSeconds)
      return result === 1
    } catch (error) {
      console.error("[v0] Redis expire error:", error)
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key)
    } catch (error) {
      console.error("[v0] Redis ttl error:", error)
      return -1
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern)
    } catch (error) {
      console.error("[v0] Redis keys error:", error)
      return []
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.redis.flushall()
    } catch (error) {
      console.error("[v0] Redis flushall error:", error)
      throw error
    }
  }

  // 原子操作：增加数值
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key)
    } catch (error) {
      console.error("[v0] Redis incr error:", error)
      throw error
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.redis.incrby(key, increment)
    } catch (error) {
      console.error("[v0] Redis incrby error:", error)
      throw error
    }
  }

  // 哈希操作
  async hset<T>(key: string, field: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      await this.redis.hset(key, field, serialized)
    } catch (error) {
      console.error("[v0] Redis hset error:", error)
      throw error
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error("[v0] Redis hget error:", error)
      return null
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.redis.hgetall(key)
      const result: Record<string, T> = {}
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value) as T
        } catch {
          result[field] = value as T
        }
      }
      return result
    } catch (error) {
      console.error("[v0] Redis hgetall error:", error)
      return {}
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.redis.hdel(key, field)
      return result > 0
    } catch (error) {
      console.error("[v0] Redis hdel error:", error)
      return false
    }
  }

  // 列表操作
  async lpush<T>(key: string, ...values: T[]): Promise<number> {
    try {
      const serialized = values.map((v) => JSON.stringify(v))
      return await this.redis.lpush(key, ...serialized)
    } catch (error) {
      console.error("[v0] Redis lpush error:", error)
      throw error
    }
  }

  async rpop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.rpop(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error("[v0] Redis rpop error:", error)
      return null
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key)
    } catch (error) {
      console.error("[v0] Redis llen error:", error)
      return 0
    }
  }

  // 集合操作
  async sadd<T>(key: string, ...members: T[]): Promise<number> {
    try {
      const serialized = members.map((m) => JSON.stringify(m))
      return await this.redis.sadd(key, ...serialized)
    } catch (error) {
      console.error("[v0] Redis sadd error:", error)
      throw error
    }
  }

  async smembers<T>(key: string): Promise<T[]> {
    try {
      const members = await this.redis.smembers(key)
      return members.map((m) => JSON.parse(m) as T)
    } catch (error) {
      console.error("[v0] Redis smembers error:", error)
      return []
    }
  }

  async srem<T>(key: string, member: T): Promise<boolean> {
    try {
      const serialized = JSON.stringify(member)
      const result = await this.redis.srem(key, serialized)
      return result > 0
    } catch (error) {
      console.error("[v0] Redis srem error:", error)
      return false
    }
  }

  // 有序集合操作
  async zadd<T>(key: string, score: number, member: T): Promise<number> {
    try {
      const serialized = JSON.stringify(member)
      return await this.redis.zadd(key, score, serialized)
    } catch (error) {
      console.error("[v0] Redis zadd error:", error)
      throw error
    }
  }

  async zrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const members = await this.redis.zrange(key, start, stop)
      return members.map((m) => JSON.parse(m) as T)
    } catch (error) {
      console.error("[v0] Redis zrange error:", error)
      return []
    }
  }

  async zrem<T>(key: string, member: T): Promise<boolean> {
    try {
      const serialized = JSON.stringify(member)
      const result = await this.redis.zrem(key, serialized)
      return result > 0
    } catch (error) {
      console.error("[v0] Redis zrem error:", error)
      return false
    }
  }

  // 管道操作
  pipeline() {
    return this.redis.pipeline()
  }

  // 事务操作
  multi() {
    return this.redis.multi()
  }

  // 发布订阅
  async publish<T>(channel: string, message: T): Promise<number> {
    try {
      const serialized = JSON.stringify(message)
      return await this.redis.publish(channel, serialized)
    } catch (error) {
      console.error("[v0] Redis publish error:", error)
      throw error
    }
  }

  subscribe<T>(channel: string, callback: (message: T) => void): void {
    const subscriber = this.redis.duplicate()
    subscriber.subscribe(channel)
    subscriber.on("message", (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsed = JSON.parse(message) as T
          callback(parsed)
        } catch (error) {
          console.error("[v0] Redis message parse error:", error)
        }
      }
    })
  }
}

// 全局 Redis 缓存实例
export const redisCache = new RedisCache()

// Redis 缓存装饰器
export function redisCached(ttlSeconds = 300, keyGenerator?: (...args: unknown[]) => string) {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = keyGenerator ? keyGenerator(...args) : `${propertyKey}_${JSON.stringify(args)}`

      try {
        // 尝试从 Redis 缓存获取
        const cached = await redisCache.get(cacheKey)
        if (cached !== null) {
          return cached
        }

        // 执行原方法并缓存结果
        const result = await originalMethod.apply(this, args)
        await redisCache.set(cacheKey, result, ttlSeconds)
        return result
      } catch (error) {
        console.error("[v0] Redis cache decorator error:", error)
        // Redis 出错时直接执行原方法
        return await originalMethod.apply(this, args)
      }
    }

    return descriptor
  }
}
