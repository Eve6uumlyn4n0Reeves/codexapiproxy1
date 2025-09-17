import { type NextRequest, NextResponse } from "next/server"
import { clearAuthCookie, getCurrentUser } from "@/lib/auth"
import { handleApiError, logError } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    await clearAuthCookie()

    // 清除会话相关的缓存或执行其他清理操作
    // 这里可以添加更多的登出逻辑，比如：
    // - 清除Redis中的会话数据
    // - 记录登出日志
    // - 撤销API密钥等

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/auth/logout" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
