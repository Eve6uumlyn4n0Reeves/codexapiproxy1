import type { User, UserRole } from "@/lib/database/entities/User"
import type { ApiKey } from "@/lib/database/entities/ApiKey"
import type { RedemptionCode, PlanType } from "@/lib/database/entities/RedemptionCode"
import type { UserPlan } from "@/lib/database/entities/UserPlan"
import type { Usage } from "@/lib/database/entities/Usage"

// 导出实体类型
export type { User, ApiKey, RedemptionCode, UserPlan, Usage }
export type { UserRole, PlanType }

// 数据库操作相关类型
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 创建和更新类型
export interface CreateUserData {
  email: string
  password_hash: string
  role?: UserRole
  is_verified?: boolean
  verification_token?: string
}

export interface UpdateUserData {
  email?: string
  password_hash?: string
  role?: UserRole
  is_verified?: boolean
  verification_token?: string | null
  reset_token?: string | null
  reset_token_expires?: Date | null
}

export interface CreateApiKeyData {
  user_id: string
  name: string
  key_hash: string
  is_active?: boolean
}

export interface UpdateApiKeyData {
  name?: string
  is_active?: boolean
  last_used_at?: Date
}

export interface CreateRedemptionCodeData {
  code: string
  plan_type: PlanType
  quota: number
  expires_at?: Date
  is_active?: boolean
  created_by: string
}

export interface UpdateRedemptionCodeData {
  is_active?: boolean
  used_by?: string
  used_at?: Date
}

export interface CreateUserPlanData {
  user_id: string
  plan_type: PlanType
  quota: number
  used_quota?: number
  expires_at?: Date
  is_active?: boolean
}

export interface UpdateUserPlanData {
  quota?: number
  used_quota?: number
  expires_at?: Date
  is_active?: boolean
}

export interface CreateUsageData {
  user_id: string
  api_key_id?: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost: number
}

// 查询过滤器类型
export interface UserFilters {
  email?: string
  role?: UserRole
  is_verified?: boolean
  created_after?: Date
  created_before?: Date
}

export interface ApiKeyFilters {
  user_id?: string
  is_active?: boolean
  created_after?: Date
  created_before?: Date
}

export interface RedemptionCodeFilters {
  plan_type?: PlanType
  is_active?: boolean
  is_used?: boolean
  created_by?: string
  expires_after?: Date
  expires_before?: Date
}

export interface UsageFilters {
  user_id?: string
  api_key_id?: string
  model?: string
  date_from?: Date
  date_to?: Date
}

// 统计数据类型
export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalApiKeys: number
  activeApiKeys: number
  totalUsage: {
    tokens: number
    cost: number
    requests: number
  }
  dailyUsage: Array<{
    date: string
    tokens: number
    cost: number
    requests: number
  }>
}

export interface UserStats {
  totalTokens: number
  totalCost: number
  totalRequests: number
  remainingQuota: number
  dailyUsage: Array<{
    date: string
    tokens: number
    cost: number
    requests: number
  }>
}
