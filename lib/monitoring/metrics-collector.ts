import { getDatabase } from "../database/data-source"
import { healthChecker } from "../health-check"
import { logger } from "../logger"
import { alertManager } from "./alert-manager"

export interface SystemMetrics {
  timestamp: Date
  api: {
    error_rate: number
    avg_response_time: number
    requests_per_minute: number
    active_connections: number
  }
  database: {
    health: number // 1 = healthy, 0 = unhealthy
    response_time: number
    active_connections: number
    query_count: number
  }
  system: {
    memory_usage: number // percentage
    cpu_usage: number // percentage
    disk_usage: number // percentage
    uptime: number // seconds
  }
  openai: {
    health: number // 1 = healthy, 0 = unhealthy
    response_time: number
    requests_count: number
    error_count: number
  }
  users: {
    total_count: number
    active_count: number
    new_registrations: number
  }
}

export class MetricsCollector {
  private static instance: MetricsCollector
  private metricsHistory: SystemMetrics[] = []
  private maxHistorySize = 1000
  private isCollecting = false

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }

  async startCollection(intervalMinutes = 1): Promise<void> {
    if (this.isCollecting) return

    this.isCollecting = true
    logger.info("Metrics collection started", { intervalMinutes })

    // 立即收集一次
    await this.collectMetrics()

    // 设置定时收集
    setInterval(
      async () => {
        try {
          await this.collectMetrics()
        } catch (error) {
          logger.error("Metrics collection failed", { error })
        }
      },
      intervalMinutes * 60 * 1000,
    )
  }

  async collectMetrics(): Promise<SystemMetrics> {
    try {
      const timestamp = new Date()

      // 并行收集各种指标
      const [healthStatus, apiMetrics, databaseMetrics, systemMetrics, openaiMetrics, userMetrics] =
        await Promise.allSettled([
          healthChecker.checkHealth(),
          this.collectApiMetrics(),
          this.collectDatabaseMetrics(),
          this.collectSystemMetrics(),
          this.collectOpenAIMetrics(),
          this.collectUserMetrics(),
        ])

      const metrics: SystemMetrics = {
        timestamp,
        api: this.getSettledValue(apiMetrics, {
          error_rate: 0,
          avg_response_time: 0,
          requests_per_minute: 0,
          active_connections: 0,
        }),
        database: this.getSettledValue(databaseMetrics, {
          health: 0,
          response_time: 0,
          active_connections: 0,
          query_count: 0,
        }),
        system: this.getSettledValue(systemMetrics, {
          memory_usage: 0,
          cpu_usage: 0,
          disk_usage: 0,
          uptime: 0,
        }),
        openai: this.getSettledValue(openaiMetrics, {
          health: 0,
          response_time: 0,
          requests_count: 0,
          error_count: 0,
        }),
        users: this.getSettledValue(userMetrics, {
          total_count: 0,
          active_count: 0,
          new_registrations: 0,
        }),
      }

      // 添加到历史记录
      this.addToHistory(metrics)

      // 检查告警
      await this.checkAlerts(metrics)

      logger.debug("Metrics collected", {
        timestamp: metrics.timestamp,
        api_error_rate: metrics.api.error_rate,
        db_health: metrics.database.health,
        memory_usage: metrics.system.memory_usage,
      })

      return metrics
    } catch (error) {
      logger.error("Failed to collect metrics", { error })
      throw error
    }
  }

  private getSettledValue<T>(result: PromiseSettledResult<T>, defaultValue: T): T {
    return result.status === "fulfilled" ? result.value : defaultValue
  }

  private async collectApiMetrics() {
    // 这里应该从实际的API监控数据中获取
    // 暂时返回模拟数据，实际实现需要集成真实的监控数据
    return {
      error_rate: Math.random() * 10, // 0-10%
      avg_response_time: 200 + Math.random() * 800, // 200-1000ms
      requests_per_minute: Math.floor(Math.random() * 100),
      active_connections: Math.floor(Math.random() * 50),
    }
  }

  private async collectDatabaseMetrics() {
    try {
      const start = Date.now()
      const dataSource = await getDatabase()
      await dataSource.query("SELECT 1")
      const responseTime = Date.now() - start

      return {
        health: dataSource.isInitialized ? 1 : 0,
        response_time: responseTime,
        active_connections: 0, // 需要从数据库获取实际连接数
        query_count: 0, // 需要从监控中获取查询计数
      }
    } catch (error) {
      return {
        health: 0,
        response_time: 0,
        active_connections: 0,
        query_count: 0,
      }
    }
  }

  private async collectSystemMetrics() {
    const memoryUsage = process.memoryUsage()
    const totalMemory = memoryUsage.heapTotal
    const usedMemory = memoryUsage.heapUsed
    const memoryUsagePercent = (usedMemory / totalMemory) * 100

    return {
      memory_usage: memoryUsagePercent,
      cpu_usage: 0, // 需要使用 os 模块获取 CPU 使用率
      disk_usage: 0, // 需要使用 fs 模块获取磁盘使用率
      uptime: process.uptime(),
    }
  }

  private async collectOpenAIMetrics() {
    try {
      const start = Date.now()
      const response = await fetch(`${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/models`, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000),
      })
      const responseTime = Date.now() - start

      return {
        health: response.ok ? 1 : 0,
        response_time: responseTime,
        requests_count: 0, // 需要从使用日志中获取
        error_count: 0, // 需要从错误日志中获取
      }
    } catch (error) {
      return {
        health: 0,
        response_time: 0,
        requests_count: 0,
        error_count: 0,
      }
    }
  }

  private async collectUserMetrics() {
    try {
      const dataSource = await getDatabase()

      // 获取用户统计
      const totalUsers = await dataSource.query("SELECT COUNT(*) as count FROM users")
      const activeUsers = await dataSource.query(`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM usage_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `)
      const newUsers = await dataSource.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `)

      return {
        total_count: totalUsers[0]?.count || 0,
        active_count: activeUsers[0]?.count || 0,
        new_registrations: newUsers[0]?.count || 0,
      }
    } catch (error) {
      return {
        total_count: 0,
        active_count: 0,
        new_registrations: 0,
      }
    }
  }

  private addToHistory(metrics: SystemMetrics): void {
    this.metricsHistory.push(metrics)

    // 保持历史记录大小限制
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize)
    }
  }

  private async checkAlerts(metrics: SystemMetrics): Promise<void> {
    const flatMetrics: Record<string, number> = {
      "api.error_rate": metrics.api.error_rate,
      "api.avg_response_time": metrics.api.avg_response_time,
      "database.health": metrics.database.health,
      "system.memory_usage": metrics.system.memory_usage,
      "openai.health": metrics.openai.health,
      "users.total_count": metrics.users.total_count,
    }

    await alertManager.checkAlerts(flatMetrics)
  }

  // 获取最新指标
  getLatestMetrics(): SystemMetrics | null {
    return this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1] : null
  }

  // 获取指标历史
  getMetricsHistory(limit = 100): SystemMetrics[] {
    return this.metricsHistory.slice(-limit)
  }

  // 获取指标趋势
  getMetricsTrend(metric: string, minutes = 60): number[] {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000)
    return this.metricsHistory
      .filter((m) => m.timestamp >= cutoffTime)
      .map((m) => this.getNestedValue(m, metric))
      .filter((v) => v !== undefined)
  }

  private getNestedValue(obj: any, path: string): number | undefined {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  stopCollection(): void {
    this.isCollecting = false
    logger.info("Metrics collection stopped")
  }
}

export const metricsCollector = MetricsCollector.getInstance()
