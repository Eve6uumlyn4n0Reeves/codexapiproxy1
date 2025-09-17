import { getDatabase } from "./database/data-source"
import { config } from "./config"
import { getRedisClient } from "./redis"

export interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "degraded"
  timestamp: Date
  checks: {
    database: HealthStatus
    openai: HealthStatus
    redis?: HealthStatus
    memory: HealthStatus
    disk: HealthStatus
  }
  uptime: number
  version: string
}

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded"
  responseTime?: number
  error?: string
  details?: Record<string, any>
}

export class HealthChecker {
  private startTime = Date.now()

  async checkHealth(): Promise<HealthCheckResult> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkOpenAI(),
      this.checkRedis(),
      this.checkMemory(),
      this.checkDisk(),
    ])

    const [database, openai, redis, memory, disk] = checks.map((result) =>
      result.status === "fulfilled" ? result.value : { status: "unhealthy" as const, error: "Check failed" },
    )

    // 确定整体状态
    const allChecks = [database, openai, memory, disk, ...(redis ? [redis] : [])]
    const unhealthyCount = allChecks.filter((check) => check.status === "unhealthy").length
    const degradedCount = allChecks.filter((check) => check.status === "degraded").length

    let overallStatus: "healthy" | "unhealthy" | "degraded" = "healthy"
    if (unhealthyCount > 0) {
      overallStatus = "unhealthy"
    } else if (degradedCount > 0) {
      overallStatus = "degraded"
    }

    return {
      status: overallStatus,
      timestamp: new Date(),
      checks: {
        database,
        openai,
        ...(redis && { redis }),
        memory,
        disk,
      },
      uptime: Date.now() - this.startTime,
      version: config.app.version,
    }
  }

  private async checkDatabase(): Promise<HealthStatus> {
    const start = Date.now()
    try {
      const dataSource = await getDatabase()
      await dataSource.query("SELECT 1")
      const responseTime = Date.now() - start

      return {
        status: responseTime < 1000 ? "healthy" : "degraded",
        responseTime,
        details: {
          connected: dataSource.isInitialized,
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async checkOpenAI(): Promise<HealthStatus> {
    const start = Date.now()
    try {
      const response = await fetch(`${config.openai.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${config.openai.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      })

      const responseTime = Date.now() - start

      if (response.ok) {
        return {
          status: responseTime < 2000 ? "healthy" : "degraded",
          responseTime,
        }
      } else {
        return {
          status: "unhealthy",
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }
    } catch (error) {
      return {
        status: "unhealthy",
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async checkRedis(): Promise<HealthStatus | null> {
    if (!config.redis.url && !config.redis.host) return null

    const start = Date.now()
    try {
      const redis = getRedisClient()
      await redis.ping()

      const responseTime = Date.now() - start
      return {
        status: responseTime < 500 ? "healthy" : "degraded",
        responseTime,
        details: {
          connected: true,
          host: config.redis.host,
          port: config.redis.port,
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async checkMemory(): Promise<HealthStatus> {
    try {
      const memoryUsage = process.memoryUsage()
      const totalMemory = memoryUsage.heapTotal
      const usedMemory = memoryUsage.heapUsed
      const memoryUsagePercent = (usedMemory / totalMemory) * 100

      let status: "healthy" | "degraded" | "unhealthy" = "healthy"
      if (memoryUsagePercent > 90) {
        status = "unhealthy"
      } else if (memoryUsagePercent > 75) {
        status = "degraded"
      }

      return {
        status,
        details: {
          heapUsed: Math.round(usedMemory / 1024 / 1024), // MB
          heapTotal: Math.round(totalMemory / 1024 / 1024), // MB
          usagePercent: Math.round(memoryUsagePercent),
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async checkDisk(): Promise<HealthStatus> {
    try {
      // 简单的磁盘检查（在实际应用中可能需要更复杂的实现）
      const stats = await import("fs").then((fs) => fs.promises.stat("."))

      return {
        status: "healthy",
        details: {
          accessible: true,
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export const healthChecker = new HealthChecker()
