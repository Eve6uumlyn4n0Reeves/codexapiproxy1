import { type NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { UsageTracker } from "@/lib/usage-tracker"
import { ApiKeyRepository } from "@/lib/database/repositories"
import { handleApiError, logError, AuthenticationError, RateLimitError, ValidationError } from "@/lib/error-handler"
import { config } from "@/lib/config"
import { log } from "@/lib/logger"
import crypto from "crypto"

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  max_tokens?: number
  temperature?: number
  stream?: boolean
}

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

  try {
    // 提取API密钥
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Missing or invalid authorization header")
    }

    const apiKey = authHeader.substring(7)

    // 验证API密钥并获取用户
    const apiKeyRepo = new ApiKeyRepository()
    const apiKeyRecord = await apiKeyRepo.findByKey(apiKey)

    if (!apiKeyRecord || !apiKeyRecord.user) {
      throw new AuthenticationError("Invalid API key")
    }

    const user = apiKeyRecord.user
    if (!user.is_verified) {
      throw new AuthenticationError("Email not verified")
    }

    // 更新API密钥最后使用时间
    await apiKeyRepo.updateLastUsed(apiKeyRecord.id)

    // 解析请求体
    const body: ChatCompletionRequest = await request.json()
    const { model, messages, max_tokens, temperature, stream } = body

    // 验证模型
    if (!model || !model.includes("gpt")) {
      throw new ValidationError("Invalid model specified")
    }

    // 估算令牌使用量
    const estimatedTokens = estimateTokens(messages, max_tokens || 1000)

    // 检查速率限制
    const rateLimitResult = await RateLimiter.checkRateLimit(user.id, user.role, estimatedTokens)
    if (!rateLimitResult.allowed) {
      throw new RateLimitError("Rate limit exceeded")
    }

    // 转发请求到OpenAI
    const openaiResponse = await fetch(config.openai.baseUrl + "/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.openai.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        model: mapToAvailableModel(model),
      }),
      signal: AbortSignal.timeout(config.openai.timeout),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()

      // 记录失败的使用
      await UsageTracker.recordUsage({
        userId: user.id,
        apiKeyId: apiKeyRecord.id,
        model,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        requestId,
        success: false,
        errorMessage: errorData.error?.message || "OpenAI API error",
      })

      log.warn("OpenAI API错误", {
        userId: user.id,
        requestId,
        error: errorData.error?.message,
        status: openaiResponse.status,
      })

      return NextResponse.json(errorData, { status: openaiResponse.status })
    }

    const responseData = await openaiResponse.json()

    // 提取使用信息
    const usage = responseData.usage || {
      prompt_tokens: Math.floor(estimatedTokens * 0.6),
      completion_tokens: Math.floor(estimatedTokens * 0.4),
      total_tokens: estimatedTokens,
    }

    // 记录成功的使用
    await UsageTracker.recordUsage({
      userId: user.id,
      apiKeyId: apiKeyRecord.id,
      model,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      cost: UsageTracker.calculateCost(model, usage.prompt_tokens, usage.completion_tokens),
      requestId,
      success: true,
    })

    // 更新用户套餐使用量
    await UsageTracker.updatePlanUsage(user.id, usage.total_tokens)

    // 获取更新后的限制信息
    const updatedLimits = await RateLimiter.getRemainingLimits(user.id, user.role)

    log.info("API请求成功", {
      userId: user.id,
      requestId,
      model,
      totalTokens: usage.total_tokens,
    })

    return NextResponse.json(responseData, {
      headers: {
        "X-RateLimit-Remaining-Requests": updatedLimits.requestsRemaining.toString(),
        "X-RateLimit-Remaining-Tokens": updatedLimits.tokensRemaining.toString(),
        "X-RateLimit-Reset-Requests": updatedLimits.resetTime.toString(),
        "X-RateLimit-Reset-Tokens": updatedLimits.tokenResetTime.toString(),
        "X-Request-ID": requestId,
      },
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/v1/chat/completions", requestId })

    if (appError instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: {
            message: appError.message,
            type: "rate_limit_error",
            code: appError.statusCode,
          },
        },
        { status: appError.statusCode },
      )
    }

    return NextResponse.json(
      {
        error: {
          message: appError.message,
          type: appError instanceof AuthenticationError ? "authentication_error" : "server_error",
          code: appError.statusCode,
        },
      },
      { status: appError.statusCode },
    )
  }
}

function estimateTokens(messages: ChatMessage[], maxTokens: number): number {
  const messageText = messages.map((m) => m.content).join(" ")
  const inputTokens = Math.ceil(messageText.length / 4)
  return inputTokens + maxTokens
}

function mapToAvailableModel(requestedModel: string): string {
  // 将请求的模型映射到实际可用的模型
  if (requestedModel.includes("gpt-5")) {
    return config.openai.defaultModel
  }
  return requestedModel
}

function generateApiKeyHash(apiKey: string): string {
  // 使用与创建时相同的哈希算法
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}
