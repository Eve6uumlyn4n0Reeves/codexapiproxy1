import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export async function getUserFromHeaders() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const payload = await verifyToken(token)
    return payload
  } catch (error) {
    console.error("[v0] Get user from headers error:", error)
    return null
  }
}

export function getRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}
