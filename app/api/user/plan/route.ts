import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    // 获取用户活跃套餐
    const plan = await Database.getUserActivePlan(authResult.user.id)

    return NextResponse.json({
      plan,
      success: true,
    })
  } catch (error) {
    console.error("获取用户套餐错误:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
