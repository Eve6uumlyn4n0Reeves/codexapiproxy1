import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { handleApiError, logError, ValidationError } from "@/lib/error-handler"
import { log } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      throw new ValidationError("邮箱地址是必需的")
    }

    const authService = new AuthService()
    const resetToken = await authService.requestPasswordReset(email.trim())

    // 无论用户是否存在都返回成功，避免邮箱枚举攻击
    log.info("密码重置请求", { email: email.trim(), tokenGenerated: !!resetToken })

    return NextResponse.json({
      message: "如果该邮箱已注册，您将收到密码重置邮件",
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/auth/forgot-password" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
