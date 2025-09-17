import { config } from "./config"

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, any>
  userId?: string
  requestId?: string
}

export class Logger {
  private static instance: Logger
  private logLevel: LogLevel

  constructor() {
    this.logLevel = this.getLogLevelFromConfig()
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private getLogLevelFromConfig(): LogLevel {
    switch (config.monitoring.logLevel) {
      case "debug":
        return LogLevel.DEBUG
      case "info":
        return LogLevel.INFO
      case "warn":
        return LogLevel.WARN
      case "error":
        return LogLevel.ERROR
      default:
        return LogLevel.INFO
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const level = LogLevel[entry.level]
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : ""
    const userId = entry.userId ? ` [User: ${entry.userId}]` : ""
    const requestId = entry.requestId ? ` [Request: ${entry.requestId}]` : ""

    return `[${timestamp}] [${level}]${userId}${requestId} ${entry.message}${context}`
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, userId?: string, requestId?: string) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      userId,
      requestId,
    }

    const formattedMessage = this.formatMessage(entry)

    // 输出到控制台
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
    }

    // 在生产环境中可以发送到日志服务
    if (config.env.isProduction) {
      this.sendToLogService(entry)
    }
  }

  debug(message: string, context?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.DEBUG, message, context, userId, requestId)
  }

  info(message: string, context?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.INFO, message, context, userId, requestId)
  }

  warn(message: string, context?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.WARN, message, context, userId, requestId)
  }

  error(message: string, context?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.ERROR, message, context, userId, requestId)
  }

  private async sendToLogService(entry: LogEntry) {
    try {
      // 这里可以集成 Winston、Pino 或云日志服务
      // 示例：发送到自定义日志收集端点
      await fetch("/api/internal/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      console.error("[v0] Failed to send log to service:", error)
    }
  }
}

// 导出单例实例
export const logger = Logger.getInstance()

// 便捷函数
export const log = {
  debug: (message: string, context?: Record<string, any>, userId?: string, requestId?: string) =>
    logger.debug(message, context, userId, requestId),
  info: (message: string, context?: Record<string, any>, userId?: string, requestId?: string) =>
    logger.info(message, context, userId, requestId),
  warn: (message: string, context?: Record<string, any>, userId?: string, requestId?: string) =>
    logger.warn(message, context, userId, requestId),
  error: (message: string, context?: Record<string, any>, userId?: string, requestId?: string) =>
    logger.error(message, context, userId, requestId),
}
