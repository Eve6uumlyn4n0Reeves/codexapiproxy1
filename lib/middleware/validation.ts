import { z } from "zod"
import { ValidationError } from "./error-handler"

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (body: any): Promise<T> => {
    try {
      return schema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError("请求数据验证失败", {
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
          })),
        })
      }
      throw error
    }
  }
}

export const schemas = {
  // 用户注册验证
  register: z.object({
    email: z.string().email("邮箱格式不正确"),
    password: z.string().min(6, "密码至少6位").max(50, "密码最多50位"),
  }),

  // 用户登录验证
  login: z.object({
    email: z.string().email("邮箱格式不正确"),
    password: z.string().min(1, "密码不能为空"),
  }),

  // 密码重置验证
  resetPassword: z.object({
    token: z.string().min(1, "重置令牌不能为空"),
    password: z.string().min(6, "密码至少6位").max(50, "密码最多50位"),
  }),

  // API密钥创建验证
  createApiKey: z.object({
    name: z.string().min(1, "API密钥名称不能为空").max(100, "API密钥名称最多100字符"),
  }),

  // 兑换码使用验证
  redeemCode: z.object({
    code: z.string().min(1, "兑换码不能为空"),
  }),

  // 兑换码创建验证（管理员）
  createRedemptionCode: z.object({
    plan_type: z.enum(["daily", "weekly", "monthly"], {
      errorMap: () => ({ message: "套餐类型必须是 daily、weekly 或 monthly" }),
    }),
    token_limit: z.number().min(1, "Token限制必须大于0").max(1000000, "Token限制不能超过1000000"),
    expires_at: z.string().datetime("过期时间格式不正确").optional(),
    batch_count: z.number().min(1, "批量生成数量至少为1").max(100, "批量生成数量最多100个").optional(),
  }),

  // 用户更新验证
  updateUser: z.object({
    email: z.string().email("邮箱格式不正确").optional(),
    role: z
      .enum(["user", "admin", "super_admin"], {
        errorMap: () => ({ message: "用户角色必须是 user、admin 或 super_admin" }),
      })
      .optional(),
    is_verified: z.boolean().optional(),
  }),

  // 分页查询验证
  pagination: z.object({
    page: z.number().min(1, "页码必须大于0").optional().default(1),
    limit: z.number().min(1, "每页数量必须大于0").max(100, "每页数量不能超过100").optional().default(20),
    sort: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (searchParams: URLSearchParams): T => {
    try {
      const params: any = {}
      for (const [key, value] of searchParams.entries()) {
        // 尝试解析数字
        if (!isNaN(Number(value))) {
          params[key] = Number(value)
        } else if (value === "true" || value === "false") {
          // 解析布尔值
          params[key] = value === "true"
        } else {
          params[key] = value
        }
      }
      return schema.parse(params)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError("查询参数验证失败", {
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
          })),
        })
      }
      throw error
    }
  }
}
