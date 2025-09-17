import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "重置令牌是必需的" }, { status: 400 })
    }

    // 验证令牌
    const email = await Database.verifyPasswordResetToken(token)
    if (!email) {
      return NextResponse.json({ error: "无效或已过期的重置令牌" }, { status: 400 })
    }

    return NextResponse.json({
      message: "令牌有效",
      email,
    })
  } catch (error) {
    console.error("[v0] Token verification error:", error)
    return NextResponse.json({ error: "验证失败，请稍后重试" }, { status: 500 })
  }
}
