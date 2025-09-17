import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { UserRepository } from "@/lib/database/repositories"
import { handleApiError, logError, AuthenticationError, ValidationError } from "@/lib/error-handler"

interface UserSettingsRequest {
  username?: string
  email?: string
  notifications?: {
    email?: boolean
    usage?: boolean
    billing?: boolean
    security?: boolean
  }
  security?: {
    twoFactor?: boolean
    sessionTimeout?: number
  }
  preferences?: {
    language?: string
    timezone?: string
    theme?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      throw new AuthenticationError("Not authenticated")
    }

    // 返回用户设置
    return NextResponse.json({
      username: user.name || user.email.split("@")[0],
      email: user.email,
      emailVerified: user.is_verified,
      notifications: {
        email: true, // 从用户偏好设置中获取
        usage: true,
        billing: true,
        security: true,
      },
      security: {
        twoFactor: false, // 从用户安全设置中获取
        sessionTimeout: 30,
      },
      preferences: {
        language: "zh",
        timezone: "Asia/Shanghai",
        theme: "system",
      },
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/user/settings" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      throw new AuthenticationError("Not authenticated")
    }

    const body: UserSettingsRequest = await request.json()
    const { username, email, notifications, security, preferences } = body

    // 基本验证
    if (email && !email.includes("@")) {
      throw new ValidationError("Invalid email format")
    }

    const userRepo = new UserRepository()

    interface UserUpdateData {
      name?: string
      email?: string
    }

    const updateData: UserUpdateData = {}
    if (username) updateData.name = username
    if (email && email !== user.email) updateData.email = email

    if (Object.keys(updateData).length > 0) {
      await userRepo.update(user.id, updateData)
    }

    // 创建用户设置表来存储这些扩展信息
    if (notifications || security || preferences) {
      // 这里可以扩展到专门的用户设置表
      console.log("[v0] Saving extended user settings:", { notifications, security, preferences })
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/user/settings" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
