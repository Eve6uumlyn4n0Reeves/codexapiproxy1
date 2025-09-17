import type { NextRequest } from "next/server"
import { verifyAuth, requireSuperAdmin } from "@/lib/auth"
import { alertManager } from "@/lib/monitoring/alert-manager"
import { withErrorHandler, createSuccessResponse, ValidationError } from "@/lib/middleware/error-handler"
import { validateBody, schemas } from "@/lib/middleware/validation"
import { z } from "zod" // Declare the z variable

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await verifyAuth(request)
  if (!user) {
    throw new ValidationError("未授权访问")
  }

  await requireSuperAdmin()

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "active" // active, history, rules

  let data
  switch (type) {
    case "active":
      data = alertManager.getActiveAlerts()
      break
    case "history":
      const limit = Number.parseInt(searchParams.get("limit") || "50")
      data = alertManager.getAlertHistory(limit)
      break
    case "rules":
      data = alertManager.getAlertRules()
      break
    default:
      throw new ValidationError("无效的查询类型")
  }

  return createSuccessResponse(data)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await verifyAuth(request)
  if (!user) {
    throw new ValidationError("未授权访问")
  }

  await requireSuperAdmin()

  const body = await request.json()

  // 验证告警规则数据
  const alertRuleSchema = schemas.createRedemptionCode.extend({
    name: z.string().min(1, "规则名称不能为空"),
    description: z.string().min(1, "规则描述不能为空"),
    condition: z.object({
      metric: z.string().min(1, "监控指标不能为空"),
      operator: z.enum(["gt", "lt", "eq", "gte", "lte"]),
      threshold: z.number(),
      timeWindow: z.number().optional(),
    }),
    severity: z.enum(["low", "medium", "high", "critical"]),
    enabled: z.boolean().default(true),
    cooldownMinutes: z.number().min(1, "冷却时间至少1分钟"),
    recipients: z.array(z.string().email("邮箱格式不正确")).min(1, "至少需要一个接收者"),
  })

  const validatedData = await validateBody(alertRuleSchema)(body)

  const alertRule = {
    id: `custom_${Date.now()}`,
    ...validatedData,
  }

  alertManager.addAlertRule(alertRule)

  return createSuccessResponse({ message: "告警规则创建成功", ruleId: alertRule.id })
})
