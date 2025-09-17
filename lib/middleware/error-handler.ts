import { type NextRequest, NextResponse } from "next/server"

export class ApiError extends Error {
  public statusCode: number
  public code?: string
  public details?: any

  constructor(statusCode: number, message: string, code?: string, details?: any) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, "VALIDATION_ERROR", details)
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = "认证失败") {
    super(401, message, "AUTHENTICATION_ERROR")
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = "权限不足") {
    super(403, message, "AUTHORIZATION_ERROR")
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "资源不存在") {
    super(404, message, "NOT_FOUND_ERROR")
  }
}

export class ConflictError extends ApiError {
  constructor(message = "资源冲突") {
    super(409, message, "CONFLICT_ERROR")
  }
}

export class RateLimitError extends ApiError {
  constructor(message = "请求过于频繁") {
    super(429, message, "RATE_LIMIT_ERROR")
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "服务器内部错误") {
    super(500, message, "INTERNAL_SERVER_ERROR")
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId?: string
  }
}

export function createSuccessResponse<T>(data: T, requestId?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  })
}

export function createErrorResponse(error: ApiError | Error, requestId?: string): NextResponse<ApiResponse> {
  const isApiError = error instanceof ApiError
  const statusCode = isApiError ? error.statusCode : 500
  const code = isApiError ? error.code || "UNKNOWN_ERROR" : "INTERNAL_SERVER_ERROR"
  const message = error.message || "未知错误"
  const details = isApiError ? error.details : undefined

  // 记录错误日志
  console.error(`[v0] API Error [${code}]:`, {
    message,
    statusCode,
    details,
    stack: error.stack,
    requestId,
  })

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status: statusCode },
  )
}

export function withErrorHandler<T extends any[]>(handler: (...args: T) => Promise<NextResponse>) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      const requestId = Math.random().toString(36).substring(2, 15)

      if (error instanceof ApiError) {
        return createErrorResponse(error, requestId)
      }

      // 处理其他类型的错误
      if (error instanceof Error) {
        return createErrorResponse(new InternalServerError(error.message), requestId)
      }

      // 处理未知错误
      return createErrorResponse(new InternalServerError("未知错误"), requestId)
    }
  }
}

export function asyncHandler(fn: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await fn(req)
    } catch (error) {
      const requestId = req.headers.get("x-request-id") || Math.random().toString(36).substring(2, 15)

      if (error instanceof ApiError) {
        return createErrorResponse(error, requestId)
      }

      if (error instanceof Error) {
        return createErrorResponse(new InternalServerError(error.message), requestId)
      }

      return createErrorResponse(new InternalServerError("未知错误"), requestId)
    }
  }
}
