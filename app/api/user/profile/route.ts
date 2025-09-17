import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, logError, AuthenticationError } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      throw new AuthenticationError("Not authenticated")
    }

    return NextResponse.json({
      username: user.name || user.email.split("@")[0],
      email: user.email,
      role: user.role || "user",
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/user/profile" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
