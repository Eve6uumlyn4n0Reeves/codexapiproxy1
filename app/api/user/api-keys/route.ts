import { type NextRequest, NextResponse } from "next/server"
import { generateApiKey, generateApiKeyHash } from "@/lib/auth"
import { ApiKeyRepository } from "@/lib/database/repositories"
import { handleApiError, logError, ValidationError } from "@/lib/error-handler"
import { getUserFromHeaders } from "@/lib/utils/request-helpers"
import { log } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromHeaders()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKeyRepo = new ApiKeyRepository()
    const apiKeys = await apiKeyRepo.findByUserId(user.id)

    // 不返回实际的密钥哈希，只返回元数据
    const safeApiKeys = apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      is_active: key.is_active,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      expires_at: key.expires_at,
    }))

    return NextResponse.json({ apiKeys: safeApiKeys })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/user/api-keys", method: "GET" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromHeaders()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()
    if (!name || !name.trim()) {
      throw new ValidationError("API key name is required")
    }

    // 检查用户API密钥数量限制
    const apiKeyRepo = new ApiKeyRepository()
    const existingKeys = await apiKeyRepo.findByUserId(user.id)

    if (existingKeys.length >= 10) {
      // 从配置中获取限制
      throw new ValidationError("已达到API密钥数量上限")
    }

    // 生成新的API密钥
    const apiKey = generateApiKey()
    const keyHash = generateApiKeyHash(apiKey)

    const newApiKey = await apiKeyRepo.create({
      user_id: user.id,
      key_hash: keyHash,
      name: name.trim(),
      is_active: true,
    })

    log.info("API密钥创建成功", { userId: user.id, keyId: newApiKey.id, name: name.trim() })

    return NextResponse.json({
      apiKey: {
        id: newApiKey.id,
        name: newApiKey.name,
        key: apiKey, // 只在创建时返回一次
        is_active: newApiKey.is_active,
        created_at: newApiKey.created_at,
      },
    })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/user/api-keys", method: "POST" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromHeaders()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { keyId } = await request.json()
    if (!keyId) {
      throw new ValidationError("API key ID is required")
    }

    const apiKeyRepo = new ApiKeyRepository()
    const success = await apiKeyRepo.delete(keyId)

    if (!success) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    log.info("API密钥删除成功", { userId: user.id, keyId })

    return NextResponse.json({ success: true })
  } catch (error) {
    const appError = handleApiError(error)
    logError(appError, { endpoint: "/api/user/api-keys", method: "DELETE" })

    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
