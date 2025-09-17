import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { handleApiError, logError, ValidationError } from "@/lib/error-handler"
import { log } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    log.info("注册尝试", { email })

    // 验证输入
    if (!email || !password) {
      throw new ValidationError("邮箱和密码都是必填项")
    }

    if (password.length < 6) {
      throw new ValidationError("密码至少需要6个字符")
    }

    // 使用新的认证服务
    const authService = new AuthService()
    const { user } = await authService.register(email, password)

    log.info("注册成功", { userId: user.id, email: user.email })

    return NextResponse.json({
      message: "注册成功！请检查您的邮箱以验证账户。",
      userId: user.id,
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/auth/register" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
