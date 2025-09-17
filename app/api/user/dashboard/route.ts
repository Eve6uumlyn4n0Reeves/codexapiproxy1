import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { UserRepository, UsageLogRepository } from "@/lib/database/repositories"
import { handleApiError, logError, AuthenticationError } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      throw new AuthenticationError("Not authenticated")
    }

    const userRepo = new UserRepository()
    const usageRepo = new UsageLogRepository()

    // 获取用户使用统计
    const usageStats = await usageRepo.getUserStats(user.id)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.name || user.email.split("@")[0],
      role: user.role || "user",
      balance: 5.0, // 从用户账户余额获取
      totalRequests: usageStats.totalRequests || 0,
      totalTokens: usageStats.totalTokens || 0,
      totalCost: usageStats.totalCost || 0.0,
      usageTime: usageStats.firstUsage ? "已开始使用" : "未开始",
      accountType: user.role === "admin" ? "管理员账户" : "免费账户",
      dailyLimit: 10000,
      dailyUsed: usageStats.dailyTokens || 0,
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/user/dashboard" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
