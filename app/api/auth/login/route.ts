import { type NextRequest, NextResponse } from "next/server"
import { AuthService, setAuthCookie } from "@/lib/auth"
import { handleApiError, logError } from "@/lib/error-handler"
import { log } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    log.info("登录尝试", { email, passwordLength: password?.length })

    // 验证输入
    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码都是必填项" }, { status: 400 })
    }

    // 使用新的认证服务
    const authService = new AuthService()
    const { user, token } = await authService.login(email, password)

    // 设置认证 Cookie
    await setAuthCookie(token)

    log.info("登录成功", { userId: user.id, email: user.email })

    return NextResponse.json({
      message: "登录成功",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/auth/login" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
