import { SystemStats } from "../entities/SystemStats"
import { getDatabase } from "../data-source"

export class SystemStatsRepository {
  async findByDate(date: string): Promise<SystemStats | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(SystemStats)
    return repository.findOne({ where: { date } })
  }

  async createOrUpdate(statsData: Partial<SystemStats>): Promise<SystemStats> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(SystemStats)

    const existing = await this.findByDate(statsData.date!)
    if (existing) {
      await repository.update(existing.id, statsData)
      return repository.findOne({ where: { id: existing.id } })!
    } else {
      const stats = repository.create(statsData)
      return repository.save(stats)
    }
  }

  async findDateRange(startDate: string, endDate: string): Promise<SystemStats[]> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(SystemStats)
    return repository.find({
      where: {
        date: repository.manager.connection.driver
          .createQueryBuilder()
          .select("date")
          .where("date >= :startDate AND date <= :endDate", { startDate, endDate })
          .getQuery() as any,
      },
      order: { date: "ASC" },
    })
  }

  async getLatestStats(limit = 30): Promise<SystemStats[]> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(SystemStats)
    return repository.find({
      take: limit,
      order: { date: "DESC" },
    })
  }
}
