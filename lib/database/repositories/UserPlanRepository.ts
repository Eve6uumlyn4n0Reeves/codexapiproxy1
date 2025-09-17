import { UserPlan } from "../entities/UserPlan"
import { getDatabase } from "../data-source"
import { MoreThan } from "typeorm"

export class UserPlanRepository {
  async findActiveByUserId(userId: string): Promise<UserPlan | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UserPlan)
    return repository.findOne({
      where: {
        user_id: userId,
        is_active: true,
        expires_at: MoreThan(new Date()),
      },
      relations: ["user"],
    })
  }

  async findByUserId(userId: string): Promise<UserPlan[]> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UserPlan)
    return repository.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
    })
  }

  async create(planData: Partial<UserPlan>): Promise<UserPlan> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UserPlan)
    const userPlan = repository.create(planData)
    return repository.save(userPlan)
  }

  async updateTokensUsed(id: string, tokensUsed: number): Promise<UserPlan | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UserPlan)
    await repository.update(id, { tokens_used: tokensUsed })
    return repository.findOne({ where: { id } })
  }

  async incrementTokensUsed(id: string, tokens: number): Promise<UserPlan | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UserPlan)
    await repository.increment({ id }, "tokens_used", tokens)
    return repository.findOne({ where: { id } })
  }

  async deactivateExpiredPlans(): Promise<number> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UserPlan)
    const result = await repository.update({ is_active: true }, { is_active: false })
    return result.affected || 0
  }

  async findExpiringSoon(days = 3): Promise<UserPlan[]> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(UserPlan)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return repository.find({
      where: {
        is_active: true,
        expires_at: MoreThan(futureDate),
      },
      relations: ["user"],
    })
  }
}
