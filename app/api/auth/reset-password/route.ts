import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { handleApiError, logError, ValidationError } from "@/lib/error-handler"
import { log } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      throw new ValidationError("令牌和密码都是必需的")
    }

    if (password.length < 6) {
      throw new ValidationError("密码至少需要6个字符")
    }

    const authService = new AuthService()
    const success = await authService.resetPassword(token, password)

    if (!success) {
      throw new ValidationError("无效或已过期的重置令牌")
    }

    log.info("密码重置成功", { token })

    return NextResponse.json({
      message: "密码重置成功",
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/auth/reset-password" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
