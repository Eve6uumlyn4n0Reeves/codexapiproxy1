import { UsageLogRepository } from "./database/repositories"
import { logger } from "./logger"

interface UsageRecord {
  userId: string
  apiKeyId?: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  requestId?: string
  endpoint?: string
  success: boolean
  errorMessage?: string
}

export class UsageTracker {
  private static usageLogRepository = new UsageLogRepository()

  static async recordUsage(record: UsageRecord): Promise<void> {
    try {
      const cost = this.calculateCost(record.model, record.promptTokens, record.completionTokens)

      await this.usageLogRepository.create({
        user_id: record.userId,
        api_key_id: record.apiKeyId,
        model: record.model,
        prompt_tokens: record.promptTokens,
        completion_tokens: record.completionTokens,
        total_tokens: record.totalTokens,
        cost: cost,
        request_id: record.requestId || this.generateRequestId(),
      })

      logger.info("Usage recorded", {
        userId: record.userId,
        totalTokens: record.totalTokens,
        cost: cost.toFixed(6),
      })
    } catch (error) {
      logger.error("Failed to record usage", { error })
      throw error
    }
  }

  static async getUserUsage(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalRequests: number
    totalTokens: number
    totalCost: number
  }> {
    try {
      return await this.usageLogRepository.getUserUsageStats(userId, startDate, endDate)
    } catch (error) {
      logger.error("Failed to get user usage", { error, userId })
      return { totalRequests: 0, totalTokens: 0, totalCost: 0 }
    }
  }

  static async getUserDailyUsage(userId: string): Promise<{
    totalRequests: number
    totalTokens: number
    totalCost: number
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.getUserUsage(userId, today, tomorrow)
  }

  static async getUsageHistory(userId: string, page = 1, limit = 50) {
    try {
      return await this.usageLogRepository.findByUserId(userId, page, limit)
    } catch (error) {
      logger.error("Failed to get usage history", { error, userId })
      return { logs: [], total: 0 }
    }
  }

  static async getSystemUsageStats(startDate?: Date, endDate?: Date) {
    try {
      return await this.usageLogRepository.getSystemUsageStats(startDate, endDate)
    } catch (error) {
      logger.error("Failed to get system usage stats", { error })
      return { totalTokens: 0, totalCost: 0, totalRequests: 0, uniqueUsers: 0 }
    }
  }

  static calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    // 基于实际 OpenAI 定价的成本计算
    const PRICING = {
      "gpt-4o": {
        input: 0.0025 / 1000, // $2.50 per 1M input tokens
        output: 0.01 / 1000, // $10.00 per 1M output tokens
      },
      "gpt-4o-mini": {
        input: 0.00015 / 1000, // $0.15 per 1M input tokens
        output: 0.0006 / 1000, // $0.60 per 1M output tokens
      },
      "gpt-4": {
        input: 0.03 / 1000, // $30.00 per 1M input tokens
        output: 0.06 / 1000, // $60.00 per 1M output tokens
      },
      "gpt-3.5-turbo": {
        input: 0.0005 / 1000, // $0.50 per 1M input tokens
        output: 0.0015 / 1000, // $1.50 per 1M output tokens
      },
    }

    const pricing = PRICING[model as keyof typeof PRICING] || PRICING["gpt-4o-mini"]
    return promptTokens * pricing.input + completionTokens * pricing.output
  }

  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  // 获取用户当前套餐的使用情况
  static async getUserPlanUsage(userId: string): Promise<{
    planType: string | null
    tokenLimit: number
    tokensUsed: number
    tokensRemaining: number
    expiresAt: Date | null
  }> {
    try {
      const { UserPlanRepository } = await import("./database/repositories")
      const userPlanRepo = new UserPlanRepository()
      const activePlan = await userPlanRepo.findActiveByUserId(userId)

      if (!activePlan) {
        return {
          planType: null,
          tokenLimit: 0,
          tokensUsed: 0,
          tokensRemaining: 0,
          expiresAt: null,
        }
      }

      return {
        planType: activePlan.plan_type,
        tokenLimit: activePlan.token_limit,
        tokensUsed: activePlan.tokens_used,
        tokensRemaining: Math.max(0, activePlan.token_limit - activePlan.tokens_used),
        expiresAt: activePlan.expires_at,
      }
    } catch (error) {
      logger.error("Failed to get user plan usage", { error, userId })
      return {
        planType: null,
        tokenLimit: 0,
        tokensUsed: 0,
        tokensRemaining: 0,
        expiresAt: null,
      }
    }
  }

  // 更新用户套餐的使用量
  static async updatePlanUsage(userId: string, tokensUsed: number): Promise<void> {
    try {
      const { UserPlanRepository } = await import("./database/repositories")
      const userPlanRepo = new UserPlanRepository()
      const activePlan = await userPlanRepo.findActiveByUserId(userId)

      if (activePlan) {
        await userPlanRepo.incrementTokensUsed(activePlan.id, tokensUsed)
      }
    } catch (error) {
      logger.error("Failed to update plan usage", { error, userId, tokensUsed })
    }
  }
}
