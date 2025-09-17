import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "兑换码不能为空" }, { status: 400 })
    }

    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    // 兑换代码
    const userPlan = await Database.redeemCode(code.trim().toUpperCase(), authResult.user.id)

    if (!userPlan) {
      return NextResponse.json({ error: "兑换码无效、已使用或已过期" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      plan: userPlan,
      message: "兑换成功",
    })
  } catch (error) {
    console.error("兑换码处理错误:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
