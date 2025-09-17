import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { handleApiError, logError, ValidationError } from "@/lib/error-handler"
import { log } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      throw new ValidationError("验证令牌是必需的")
    }

    const authService = new AuthService()
    const success = await authService.verifyEmail(token)

    if (!success) {
      throw new ValidationError("无效或已过期的验证令牌")
    }

    log.info("邮箱验证成功", { token })

    return NextResponse.json({
      message: "邮箱验证成功！您现在可以登录了。",
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/auth/verify-email" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
