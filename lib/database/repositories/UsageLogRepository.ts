import { UsageLog } from "../entities/UsageLog"
import { getDatabase } from "../data-source"

export class UsageLogRepository {
  async create(logData: Partial<UsageLog>): Promise<UsageLog> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UsageLog)
    const usageLog = repository.create(logData)
    return repository.save(usageLog)
  }

  async findByUserId(userId: string, page = 1, limit = 50): Promise<{ logs: UsageLog[]; total: number }> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UsageLog)
    const [logs, total] = await repository.findAndCount({
      where: { user_id: userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: "DESC" },
      relations: ["api_key"],
    })
    return { logs, total }
  }

  async findAll(page = 1, limit = 50): Promise<{ logs: UsageLog[]; total: number }> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UsageLog)
    const [logs, total] = await repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: "DESC" },
      relations: ["user", "api_key"],
    })
    return { logs, total }
  }

  async getUserUsageStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalTokens: number
    totalCost: number
    totalRequests: number
  }> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UsageLog)

    let query = repository
      .createQueryBuilder("usage_log")
      .select([
        "SUM(usage_log.total_tokens) as totalTokens",
        "SUM(usage_log.cost) as totalCost",
        "COUNT(*) as totalRequests",
      ])
      .where("usage_log.user_id = :userId", { userId })

    if (startDate) {
      query = query.andWhere("usage_log.created_at >= :startDate", { startDate })
    }
    if (endDate) {
      query = query.andWhere("usage_log.created_at <= :endDate", { endDate })
    }

    const result = await query.getRawOne()
    return {
      totalTokens: Number.parseInt(result.totalTokens) || 0,
      totalCost: Number.parseFloat(result.totalCost) || 0,
      totalRequests: Number.parseInt(result.totalRequests) || 0,
    }
  }

  async getSystemUsageStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalTokens: number
    totalCost: number
    totalRequests: number
    uniqueUsers: number
  }> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UsageLog)

    let query = repository
      .createQueryBuilder("usage_log")
      .select([
        "SUM(usage_log.total_tokens) as totalTokens",
        "SUM(usage_log.cost) as totalCost",
        "COUNT(*) as totalRequests",
        "COUNT(DISTINCT usage_log.user_id) as uniqueUsers",
      ])

    if (startDate) {
      query = query.where("usage_log.created_at >= :startDate", { startDate })
    }
    if (endDate) {
      query = query.andWhere("usage_log.created_at <= :endDate", { endDate })
    }

    const result = await query.getRawOne()
    return {
      totalTokens: Number.parseInt(result.totalTokens) || 0,
      totalCost: Number.parseFloat(result.totalCost) || 0,
      totalRequests: Number.parseInt(result.totalRequests) || 0,
      uniqueUsers: Number.parseInt(result.uniqueUsers) || 0,
    }
  }
}
