import { config } from "./config"
import { logger } from "./logger"

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, unknown>
  public readonly timestamp: Date

  constructor(message: string, statusCode = 500, isOperational = true, context?: Record<string, unknown>) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context
    this.timestamp = new Date()

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, true, context)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "认证失败", context?: Record<string, unknown>) {
    super(message, 401, true, context)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "权限不足", context?: Record<string, unknown>) {
    super(message, 403, true, context)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "资源未找到", context?: Record<string, unknown>) {
    super(message, 404, true, context)
  }
}

export class ConflictError extends AppError {
  constructor(message = "资源冲突", context?: Record<string, unknown>) {
    super(message, 409, true, context)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "请求过于频繁", context?: Record<string, unknown>) {
    super(message, 429, true, context)
  }
}

export class InternalServerError extends AppError {
  constructor(message = "服务器内部错误", context?: Record<string, unknown>) {
    super(message, 500, false, context)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "服务暂时不可用", context?: Record<string, unknown>) {
    super(message, 503, true, context)
  }
}

export class DatabaseError extends AppError {
  constructor(message = "数据库操作失败", context?: Record<string, unknown>) {
    super(message, 500, false, context)
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "外部服务错误", context?: Record<string, unknown>) {
    super(message, 502, true, context)
  }
}

// 错误处理工具函数
export function handleApiError(error: unknown): AppError {
  console.error("[v0] API Error:", error)

  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // MySQL/TypeORM 错误处理
    if (error.message.includes("ER_DUP_ENTRY")) {
      return new ConflictError("数据已存在")
    }

    if (error.message.includes("ER_NO_REFERENCED_ROW")) {
      return new ValidationError("引用的数据不存在")
    }

    if (error.message.includes("ER_ACCESS_DENIED_ERROR")) {
      return new AuthenticationError("数据库访问被拒绝")
    }

    if (error.message.includes("ECONNREFUSED")) {
      return new ServiceUnavailableError("数据库连接失败")
    }

    // JWT 错误处理
    if (error.message.includes("jwt expired")) {
      return new AuthenticationError("登录已过期，请重新登录")
    }

    if (error.message.includes("jwt malformed")) {
      return new AuthenticationError("无效的认证令牌")
    }

    if (error.message.includes("invalid signature")) {
      return new AuthenticationError("认证令牌签名无效")
    }

    // OpenAI API 错误处理
    if (error.message.includes("insufficient_quota")) {
      return new ServiceUnavailableError("API 配额不足")
    }

    if (error.message.includes("rate_limit_exceeded")) {
      return new RateLimitError("API 请求频率超限")
    }

    if (error.message.includes("invalid_api_key")) {
      return new AuthenticationError("API 密钥无效")
    }

    // 通用错误处理
    if (error.message.includes("ENOTFOUND") || error.message.includes("ECONNRESET")) {
      return new ExternalServiceError("网络连接失败")
    }

    return new AppError(error.message, 500, true)
  }

  return new InternalServerError("未知错误")
}

// 客户端错误处理
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "发生了未知错误"
}

// 错误日志记录
export function logError(error: unknown, context?: Record<string, unknown>) {
  const errorInfo = {
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    level: error instanceof AppError && error.isOperational ? "warn" : "error",
  }

  // 根据配置的日志级别决定是否记录
  const shouldLog =
    config.monitoring.logLevel === "debug" ||
    (config.monitoring.logLevel === "info" && errorInfo.level === "error") ||
    (config.monitoring.logLevel === "warn" && ["error", "warn"].includes(errorInfo.level))

  if (shouldLog) {
    logger.error("Error logged", errorInfo)
  }

  // 在生产环境中发送到错误监控服务
  if (config.env.isProduction && config.monitoring.enableErrorTracking) {
    sendToErrorService(errorInfo)
  }
}

// 发送错误到监控服务
async function sendToErrorService(errorInfo: Record<string, unknown>) {
  try {
    // 这里可以集成 Sentry、LogRocket 等错误监控服务
    // 示例：发送到自定义错误收集端点
    if (config.monitoring.enableErrorTracking) {
      await fetch("/api/internal/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorInfo),
      })
    }
  } catch (sendError) {
    logger.error("Failed to send error to monitoring service", { error: sendError })
  }
}

// API 响应错误格式化
export function formatErrorResponse(error: AppError) {
  return {
    error: {
      message: error.message,
      code: error.statusCode,
      timestamp: error.timestamp.toISOString(),
      ...(config.env.isDevelopment && {
        stack: error.stack,
        context: error.context,
      }),
    },
  }
}

// 全局错误处理中间件
export function createErrorHandler() {
  return (
    error: unknown,
    req: { method: string; url: string; headers: Record<string, string> },
    res: { status: (code: number) => { json: (data: unknown) => void } },
    next: () => void,
  ) => {
    const appError = handleApiError(error)
    logError(appError, {
      method: req.method,
      url: req.url,
      userId: req.headers["x-user-id"],
    })

    res.status(appError.statusCode).json(formatErrorResponse(appError))
  }
}
