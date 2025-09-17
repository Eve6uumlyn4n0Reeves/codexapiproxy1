// 缓存管理系统
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>()
  private cleanupInterval: NodeJS.Timeout

  constructor(cleanupIntervalMs = 60000) {
    // 定期清理过期缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)
  }

  set<T>(key: string, data: T, ttlMs = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Redis 缓存支持
import { redisCache } from "./redis"
import { config } from "./config"

// 统一缓存接口
export interface CacheInterface {
  set<T>(key: string, data: T, ttlMs?: number): Promise<void> | void
  get<T>(key: string): Promise<T | null> | T | null
  has(key: string): Promise<boolean> | boolean
  delete(key: string): Promise<boolean> | boolean
  clear(): Promise<void> | void
}

// 混合缓存策略：优先使用 Redis，降级到内存缓存
export class HybridCache implements CacheInterface {
  private memoryCache: MemoryCache
  private useRedis: boolean

  constructor() {
    this.memoryCache = new MemoryCache()
    this.useRedis = !!config.redis.url || !!config.redis.host
  }

  async set<T>(key: string, data: T, ttlMs = 300000): Promise<void> {
    if (this.useRedis) {
      try {
        await redisCache.set(key, data, Math.floor(ttlMs / 1000))
        return
      } catch (error) {
        console.error("[v0] Redis set failed, falling back to memory cache:", error)
      }
    }

    // 降级到内存缓存
    this.memoryCache.set(key, data, ttlMs)
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.useRedis) {
      try {
        const result = await redisCache.get<T>(key)
        if (result !== null) return result
      } catch (error) {
        console.error("[v0] Redis get failed, falling back to memory cache:", error)
      }
    }

    // 降级到内存缓存
    return this.memoryCache.get<T>(key)
  }

  async has(key: string): Promise<boolean> {
    if (this.useRedis) {
      try {
        return await redisCache.exists(key)
      } catch (error) {
        console.error("[v0] Redis exists failed, falling back to memory cache:", error)
      }
    }

    return this.memoryCache.has(key)
  }

  async delete(key: string): Promise<boolean> {
    let deleted = false

    if (this.useRedis) {
      try {
        deleted = await redisCache.del(key)
      } catch (error) {
        console.error("[v0] Redis delete failed:", error)
      }
    }

    // 同时删除内存缓存
    const memoryDeleted = this.memoryCache.delete(key)
    return deleted || memoryDeleted
  }

  async clear(): Promise<void> {
    if (this.useRedis) {
      try {
        await redisCache.flushAll()
      } catch (error) {
        console.error("[v0] Redis clear failed:", error)
      }
    }

    this.memoryCache.clear()
  }

  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      redis: this.useRedis,
    }
  }
}

// 全局缓存实例
export const globalCache = new HybridCache()

// 缓存装饰器
export function cached(ttlMs = 300000, keyGenerator?: (...args: any[]) => string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator ? keyGenerator(...args) : `${propertyKey}_${JSON.stringify(args)}`

      // 尝试从缓存获取
      const cached = await globalCache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // 执行原方法并缓存结果
      const result = await originalMethod.apply(this, args)
      await globalCache.set(cacheKey, result, ttlMs)
      return result
    }

    return descriptor
  }
}
