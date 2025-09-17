import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, hasPermission } from "@/lib/auth"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    if (!hasPermission(authResult.user.role, "admin:redemption_codes:read")) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")
    const planType = searchParams.get("plan_type")
    const search = searchParams.get("search")

    const result = await Database.getRedemptionCodes({
      page,
      limit,
      status,
      planType,
      search,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("获取兑换码失败:", error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    if (!hasPermission(authResult.user.role, "admin:redemption_codes:create")) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const body = await request.json()
    const { type, ...params } = body

    if (type === "single") {
      const code = await Database.createRedemptionCode({
        ...params,
        createdBy: authResult.user.id,
      })
      return NextResponse.json({ code })
    } else if (type === "batch") {
      const codes = await Database.createRedemptionCodesBatch({
        ...params,
        createdBy: authResult.user.id,
      })
      return NextResponse.json({ codes, count: codes.length })
    }

    return NextResponse.json({ error: "无效的创建类型" }, { status: 400 })
  } catch (error) {
    console.error("创建兑换码失败:", error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
