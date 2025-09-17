import { type NextRequest, NextResponse } from "next/server"
import { RedemptionCodeRepository, UserPlanRepository } from "@/lib/database/repositories"
import { handleApiError, logError, ValidationError, ConflictError } from "@/lib/error-handler"
import { getUserFromHeaders } from "@/lib/utils/request-helpers"
import { PlanType } from "@/lib/database/entities/RedemptionCode"
import { log } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromHeaders()
    if (!user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      throw new ValidationError("兑换码不能为空")
    }

    const redemptionRepo = new RedemptionCodeRepository()
    const userPlanRepo = new UserPlanRepository()

    // 查找兑换码
    const redemptionCode = await redemptionRepo.findUnusedByCode(code.trim().toUpperCase())
    if (!redemptionCode) {
      throw new ValidationError("兑换码不存在或已失效")
    }

    // 检查兑换码是否过期
    if (redemptionCode.expires_at && new Date(redemptionCode.expires_at) < new Date()) {
      throw new ValidationError("兑换码已过期")
    }

    // 检查用户是否已有相同类型的活跃套餐
    const existingPlan = await userPlanRepo.findActiveByUserId(user.id)

    let planExpiresAt: Date

    if (existingPlan && existingPlan.plan_type === redemptionCode.plan_type) {
      // 如果有现有套餐，延长时间
      planExpiresAt = new Date(existingPlan.expires_at)
    } else {
      // 如果没有现有套餐，从现在开始计算
      planExpiresAt = new Date()
    }

    // 根据套餐类型计算过期时间
    switch (redemptionCode.plan_type) {
      case PlanType.DAILY:
        planExpiresAt.setDate(planExpiresAt.getDate() + 1)
        break
      case PlanType.WEEKLY:
        planExpiresAt.setDate(planExpiresAt.getDate() + 7)
        break
      case PlanType.MONTHLY:
        planExpiresAt.setMonth(planExpiresAt.getMonth() + 1)
        break
    }

    // 使用兑换码
    const usedCode = await redemptionRepo.useCode(code.trim().toUpperCase(), user.id)
    if (!usedCode) {
      throw new ConflictError("兑换码使用失败，可能已被其他人使用")
    }

    let resultPlan
    if (existingPlan && existingPlan.plan_type === redemptionCode.plan_type) {
      // 更新现有套餐
      resultPlan = await userPlanRepo.updateTokensUsed(existingPlan.id, existingPlan.tokens_used)

      log.info("套餐延长成功", {
        userId: user.id,
        planId: existingPlan.id,
        codeId: usedCode.id,
        newExpiresAt: planExpiresAt,
      })

      return NextResponse.json({
        success: true,
        message: "兑换成功！套餐已延长",
        plan: {
          type: redemptionCode.plan_type,
          token_limit: existingPlan.token_limit + redemptionCode.token_limit,
          expires_at: planExpiresAt.toISOString(),
          extended: true,
        },
      })
    } else {
      // 创建新套餐
      resultPlan = await userPlanRepo.create({
        user_id: user.id,
        plan_type: redemptionCode.plan_type,
        token_limit: redemptionCode.token_limit,
        tokens_used: 0,
        starts_at: new Date(),
        expires_at: planExpiresAt,
        is_active: true,
      })

      log.info("新套餐创建成功", {
        userId: user.id,
        planId: resultPlan.id,
        codeId: usedCode.id,
      })

      return NextResponse.json({
        success: true,
        message: "兑换成功！套餐已激活",
        plan: {
          type: redemptionCode.plan_type,
          token_limit: redemptionCode.token_limit,
          expires_at: planExpiresAt.toISOString(),
          extended: false,
        },
      })
    }
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/user/redeem-code" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
