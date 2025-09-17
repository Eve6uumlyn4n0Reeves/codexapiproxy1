import { generateApiKey, generateApiKeyHash, verifyApiKey } from "./auth"
import bcrypt from "bcryptjs"
import { UserRepository } from "./database/repositories/UserRepository"
import { ApiKeyRepository } from "./database/repositories/ApiKeyRepository"
import { RedemptionCodeRepository } from "./database/repositories/RedemptionCodeRepository"
import { UserPlanRepository } from "./database/repositories/UserPlanRepository"
import { UsageLogRepository } from "./database/repositories/UsageLogRepository"
import { UserRole } from "./database/entities/User"
import { PlanType } from "./database/entities/UserPlan"
import { getDatabase } from "./database/data-source"

export interface UserRecord {
  id: string
  email: string
  role: "user" | "admin" | "super_admin"
  is_verified: boolean
  verification_token?: string
  created_at: string
  updated_at: string
}

export interface ApiKeyRecord {
  id: string
  user_id: string
  key_hash: string
  name: string
  is_active: boolean
  created_at: string
  last_used_at?: string
  expires_at?: string
}

export interface RedemptionCode {
  id: string
  code: string
  plan_type: "daily" | "weekly" | "monthly"
  token_limit: number
  is_used: boolean
  used_by?: string
  used_at?: string
  expires_at: string
  created_at: string
}

export interface UserPlan {
  id: string
  user_id: string
  plan_type: "daily" | "weekly" | "monthly"
  token_limit: number
  tokens_used: number
  starts_at: string
  expires_at: string
  is_active: boolean
  created_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  api_key_id?: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost: number
  request_id?: string
  created_at: string
}

export class Database {
  static async findUserByEmail(email: string): Promise<UserRecord | null> {
    try {
      await getDatabase()
      const userRepository = new UserRepository()
      const user = await userRepository.findByEmail(email)

      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        role: user.role as "user" | "admin" | "super_admin",
        is_verified: user.is_verified,
        verification_token: user.verification_token || undefined,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      }
    } catch (error) {
      console.error("[v0] Find user by email error:", error)
      return null
    }
  }

  static async findUserById(id: string): Promise<UserRecord | null> {
    try {
      await getDatabase()
      const userRepository = new UserRepository()
      const user = await userRepository.findById(id)

      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        role: user.role as "user" | "admin" | "super_admin",
        is_verified: user.is_verified,
        verification_token: user.verification_token || undefined,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      }
    } catch (error) {
      console.error("[v0] Find user by id error:", error)
      return null
    }
  }

  static async findUserByApiKey(apiKey: string): Promise<UserRecord | null> {
    try {
      await getDatabase()
      const apiKeyRepository = new ApiKeyRepository()
      const userRepository = new UserRepository()

      // 查找所有活跃的API密钥
      const apiKeys = await apiKeyRepository.findActiveKeys()

      // 验证API密钥
      for (const keyRecord of apiKeys) {
        if (verifyApiKey(apiKey, keyRecord.key_hash)) {
          // 更新最后使用时间
          await apiKeyRepository.updateLastUsed(keyRecord.id)

          // 获取用户信息
          const user = await userRepository.findById(keyRecord.user_id)
          if (!user) continue

          return {
            id: user.id,
            email: user.email,
            role: user.role as "user" | "admin" | "super_admin",
            is_verified: user.is_verified,
            verification_token: user.verification_token || undefined,
            created_at: user.created_at.toISOString(),
            updated_at: user.updated_at.toISOString(),
          }
        }
      }

      return null
    } catch (error) {
      console.error("[v0] Find user by API key error:", error)
      return null
    }
  }

  static async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    try {
      await getDatabase()
      const userRepository = new UserRepository()

      const updateData: any = {}
      if (updates.email) updateData.email = updates.email
      if (updates.role) updateData.role = updates.role as UserRole
      if (updates.is_verified !== undefined) updateData.is_verified = updates.is_verified
      if (updates.verification_token) updateData.verification_token = updates.verification_token

      const user = await userRepository.update(id, updateData)
      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        role: user.role as "user" | "admin" | "super_admin",
        is_verified: user.is_verified,
        verification_token: user.verification_token || undefined,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      }
    } catch (error) {
      console.error("[v0] Update user error:", error)
      return null
    }
  }

  static async createApiKey(userId: string, name: string): Promise<{ apiKey: string; record: ApiKeyRecord } | null> {
    try {
      await getDatabase()
      const apiKeyRepository = new ApiKeyRepository()
      const apiKey = generateApiKey()
      const keyHash = generateApiKeyHash(apiKey)

      const record = await apiKeyRepository.create({
        user_id: userId,
        key_hash: keyHash,
        name,
        is_active: true,
      })

      if (!record) return null

      return {
        apiKey,
        record: {
          id: record.id,
          user_id: record.user_id,
          key_hash: record.key_hash,
          name: record.name,
          is_active: record.is_active,
          created_at: record.created_at.toISOString(),
          last_used_at: record.last_used_at?.toISOString(),
          expires_at: record.expires_at?.toISOString(),
        },
      }
    } catch (error) {
      console.error("[v0] Create API key error:", error)
      return null
    }
  }

  static async getUserApiKeys(userId: string): Promise<ApiKeyRecord[]> {
    try {
      await getDatabase()
      const apiKeyRepository = new ApiKeyRepository()
      const keys = await apiKeyRepository.findByUserId(userId)

      return keys.map((key) => ({
        id: key.id,
        user_id: key.user_id,
        key_hash: key.key_hash,
        name: key.name,
        is_active: key.is_active,
        created_at: key.created_at.toISOString(),
        last_used_at: key.last_used_at?.toISOString(),
        expires_at: key.expires_at?.toISOString(),
      }))
    } catch (error) {
      console.error("[v0] Get user API keys error:", error)
      return []
    }
  }

  static async deleteApiKey(keyId: string, userId: string): Promise<boolean> {
    try {
      await getDatabase()
      const apiKeyRepository = new ApiKeyRepository()
      return await apiKeyRepository.deactivate(keyId, userId)
    } catch (error) {
      console.error("[v0] Delete API key error:", error)
      return false
    }
  }

  static async redeemCode(code: string, userId: string): Promise<UserPlan | null> {
    try {
      await getDatabase()
      const redemptionCodeRepository = new RedemptionCodeRepository()
      const userPlanRepository = new UserPlanRepository()

      // 查找兑换码
      const redemptionCode = await redemptionCodeRepository.findByCode(code)
      if (!redemptionCode || redemptionCode.is_used) return null

      // 检查是否过期
      if (redemptionCode.expires_at && new Date(redemptionCode.expires_at) < new Date()) {
        return null
      }

      // 计算过期时间
      let expiresAt: Date
      switch (redemptionCode.plan_type) {
        case PlanType.DAILY:
          expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
          break
        case PlanType.WEEKLY:
          expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          break
        case PlanType.MONTHLY:
          expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          break
      }

      // 标记兑换码为已使用
      await redemptionCodeRepository.markAsUsed(redemptionCode.id, userId)

      // 创建用户套餐
      const userPlan = await userPlanRepository.create({
        user_id: userId,
        plan_type: redemptionCode.plan_type,
        token_limit: redemptionCode.token_limit,
        tokens_used: 0,
        starts_at: new Date(),
        expires_at: expiresAt,
        is_active: true,
      })

      if (!userPlan) return null

      return {
        id: userPlan.id,
        user_id: userPlan.user_id,
        plan_type: userPlan.plan_type as "daily" | "weekly" | "monthly",
        token_limit: userPlan.token_limit,
        tokens_used: userPlan.tokens_used,
        starts_at: userPlan.starts_at.toISOString(),
        expires_at: userPlan.expires_at.toISOString(),
        is_active: userPlan.is_active,
        created_at: userPlan.created_at.toISOString(),
      }
    } catch (error) {
      console.error("[v0] Redeem code error:", error)
      return null
    }
  }

  static async getUserActivePlan(userId: string): Promise<UserPlan | null> {
    try {
      await getDatabase()
      const userPlanRepository = new UserPlanRepository()
      const plan = await userPlanRepository.findActivePlan(userId)

      if (!plan) return null

      return {
        id: plan.id,
        user_id: plan.user_id,
        plan_type: plan.plan_type as "daily" | "weekly" | "monthly",
        token_limit: plan.token_limit,
        tokens_used: plan.tokens_used,
        starts_at: plan.starts_at.toISOString(),
        expires_at: plan.expires_at.toISOString(),
        is_active: plan.is_active,
        created_at: plan.created_at.toISOString(),
      }
    } catch (error) {
      console.error("[v0] Get user active plan error:", error)
      return null
    }
  }

  static async logUsage(
    userId: string,
    apiKeyId: string | null,
    model: string,
    promptTokens: number,
    completionTokens: number,
    cost: number,
    requestId?: string,
  ): Promise<boolean> {
    try {
      await getDatabase()
      const usageLogRepository = new UsageLogRepository()
      const userPlanRepository = new UserPlanRepository()
      const totalTokens = promptTokens + completionTokens

      // 记录使用日志
      await usageLogRepository.create({
        user_id: userId,
        api_key_id: apiKeyId,
        model,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        cost,
        request_id: requestId,
      })

      // 更新用户套餐使用量
      const activePlan = await this.getUserActivePlan(userId)
      if (activePlan) {
        await userPlanRepository.updateTokensUsed(activePlan.id, activePlan.tokens_used + totalTokens)
      }

      return true
    } catch (error) {
      console.error("[v0] Log usage error:", error)
      return false
    }
  }

  static async getUserStats(userId: string) {
    try {
      await getDatabase()
      const usageLogRepository = new UsageLogRepository()

      // 获取活跃套餐
      const activePlan = await this.getUserActivePlan(userId)

      // 获取使用统计
      const usageStats = await usageLogRepository.findByUserId(userId)
      const totalTokens = usageStats.reduce((sum, log) => sum + log.total_tokens, 0)
      const totalCost = usageStats.reduce((sum, log) => sum + log.cost, 0)

      // 获取今日使用量
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayUsage = await usageLogRepository.findByUserIdAndDate(userId, today)
      const dailyUsed = todayUsage.reduce((sum, log) => sum + log.total_tokens, 0)

      return {
        totalRequests: usageStats.length,
        totalTokens,
        totalCost,
        dailyUsed,
        dailyLimit: activePlan?.token_limit || 0,
        activePlan,
      }
    } catch (error) {
      console.error("[v0] Get user stats error:", error)
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        dailyUsed: 0,
        dailyLimit: 0,
        activePlan: null,
      }
    }
  }

  static async getAllUsers(): Promise<UserRecord[]> {
    try {
      await getDatabase()
      const userRepository = new UserRepository()
      const result = await userRepository.findAll()

      return result.users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role as "user" | "admin" | "super_admin",
        is_verified: user.is_verified,
        verification_token: user.verification_token || undefined,
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      }))
    } catch (error) {
      console.error("[v0] Get all users error:", error)
      return []
    }
  }

  static async checkUserPlanLimits(userId: string, tokensToUse: number): Promise<boolean> {
    try {
      const activePlan = await this.getUserActivePlan(userId)
      if (!activePlan) return false

      return activePlan.tokens_used + tokensToUse <= activePlan.token_limit
    } catch (error) {
      console.error("[v0] Check user plan limits error:", error)
      return false
    }
  }

  static async storePasswordResetToken(email: string, token: string): Promise<void> {
    try {
      await getDatabase()
      const userRepository = new UserRepository()
      const user = await userRepository.findByEmail(email)

      if (user) {
        const expires = new Date()
        expires.setHours(expires.getHours() + 1) // 1小时过期

        await userRepository.update(user.id, {
          reset_token: token,
          reset_token_expires: expires,
        })
      }
    } catch (error) {
      console.error("[v0] Store password reset token error:", error)
    }
  }

  static async verifyPasswordResetToken(token: string): Promise<string | null> {
    try {
      await getDatabase()
      const userRepository = new UserRepository()
      const users = await userRepository.findAll()

      const user = users.users.find(
        (u) => u.reset_token === token && u.reset_token_expires && u.reset_token_expires > new Date(),
      )

      if (!user) return null

      // 清除重置令牌
      await userRepository.update(user.id, {
        reset_token: null,
        reset_token_expires: null,
      })

      return user.email
    } catch (error) {
      console.error("[v0] Verify password reset token error:", error)
      return null
    }
  }

  static async initTestData(): Promise<void> {
    try {
      await getDatabase()
      const userRepository = new UserRepository()

      const testUsers = [
        {
          email: "user@test.com",
          password_hash: await bcrypt.hash("123456", 12),
          role: UserRole.USER,
          is_verified: true,
        },
        {
          email: "admin@test.com",
          password_hash: await bcrypt.hash("admin123", 12),
          role: UserRole.ADMIN,
          is_verified: true,
        },
        {
          email: "superadmin@test.com",
          password_hash: await bcrypt.hash("superadmin123", 12),
          role: UserRole.SUPER_ADMIN,
          is_verified: true,
        },
      ]

      for (const userData of testUsers) {
        const existingUser = await userRepository.findByEmail(userData.email)
        if (!existingUser) {
          await userRepository.create(userData)
        }
      }
    } catch (error) {
      console.error("[v0] Init test data error:", error)
    }
  }

  static getTestCredentials() {
    return [
      { email: "user@test.com", password: "123456", role: "普通用户" },
      { email: "admin@test.com", password: "admin123", role: "管理员" },
      { email: "superadmin@test.com", password: "superadmin123", role: "超级管理员" },
    ]
  }
}
