import { type NextRequest, NextResponse } from "next/server"
import { globalCache } from "@/lib/cache"
import { redisCache } from "@/lib/redis"
import { verifyAuth } from "@/lib/auth"
import { UserRole } from "@/lib/database/entities/User"

// 缓存管理 API
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "stats":
        const stats = globalCache.getStats()
        return NextResponse.json({ stats })

      case "keys":
        const pattern = searchParams.get("pattern") || "*"
        const keys = await redisCache.keys(pattern)
        return NextResponse.json({ keys })

      case "get":
        const key = searchParams.get("key")
        if (!key) {
          return NextResponse.json({ error: "Key parameter required" }, { status: 400 })
        }
        const value = await redisCache.get(key)
        const ttl = await redisCache.ttl(key)
        return NextResponse.json({ key, value, ttl })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Cache API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const key = searchParams.get("key")

    switch (action) {
      case "clear":
        await globalCache.clear()
        return NextResponse.json({ message: "Cache cleared successfully" })

      case "delete":
        if (!key) {
          return NextResponse.json({ error: "Key parameter required" }, { status: 400 })
        }
        const deleted = await globalCache.delete(key)
        return NextResponse.json({ deleted })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Cache DELETE API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, ttl = 300 } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 })
    }

    await globalCache.set(key, value, ttl * 1000) // Convert to milliseconds
    return NextResponse.json({ message: "Cache set successfully" })
  } catch (error) {
    console.error("[v0] Cache POST API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
