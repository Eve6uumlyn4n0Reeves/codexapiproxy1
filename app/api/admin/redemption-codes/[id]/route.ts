import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, hasPermission } from "@/lib/auth"
import { Database } from "@/lib/database"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    if (!hasPermission(authResult.user.role, "admin:redemption_codes:delete")) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const success = await Database.deleteRedemptionCode(params.id)

    if (!success) {
      return NextResponse.json({ error: "删除兑换码失败" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除兑换码失败:", error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
