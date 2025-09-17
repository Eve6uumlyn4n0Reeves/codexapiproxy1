import { ApiKey } from "../entities/ApiKey"
import { getDatabase } from "../data-source"
import { verifyApiKey } from "../../auth"

export class ApiKeyRepository {
  async findByHash(keyHash: string): Promise<ApiKey | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(ApiKey)
    return repository.findOne({
      where: { key_hash: keyHash, is_active: true },
      relations: ["user"],
    })
  }

  async findByKey(apiKey: string): Promise<ApiKey | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(ApiKey)

    // 获取所有活跃的API密钥
    const activeKeys = await repository.find({
      where: { is_active: true },
      relations: ["user"],
    })

    // 验证API密钥
    for (const keyRecord of activeKeys) {
      if (verifyApiKey(apiKey, keyRecord.key_hash)) {
        return keyRecord
      }
    }

    return null
  }

  async findByUserId(userId: string): Promise<ApiKey[]> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(ApiKey)
    return repository.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
    })
  }

  async create(apiKeyData: Partial<ApiKey>): Promise<ApiKey> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(ApiKey)
    const apiKey = repository.create(apiKeyData)
    return repository.save(apiKey)
  }

  async update(id: string, apiKeyData: Partial<ApiKey>): Promise<ApiKey | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(ApiKey)
    await repository.update(id, apiKeyData)
    return repository.findOne({ where: { id } })
  }

  async delete(id: string): Promise<boolean> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(ApiKey)
    const result = await repository.delete(id)
    return result.affected > 0
  }

  async updateLastUsed(id: string): Promise<void> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(ApiKey)
    await repository.update(id, { last_used_at: new Date() })
  }
}
