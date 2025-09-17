import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, hasPermission } from "@/lib/auth"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    if (!hasPermission(authResult.user.role, "super_admin:system_stats:read")) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d" // 7d, 30d, 90d

    const stats = await Database.getSystemStats(period)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("获取系统统计失败:", error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
