import { RedemptionCode } from "../entities/RedemptionCode"
import { getDatabase } from "../data-source"

export class RedemptionCodeRepository {
  async findByCode(code: string): Promise<RedemptionCode | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(RedemptionCode)
    return repository.findOne({
      where: { code },
      relations: ["used_by", "created_by"],
    })
  }

  async findUnusedByCode(code: string): Promise<RedemptionCode | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(RedemptionCode)
    return repository.findOne({
      where: { code, is_used: false },
      relations: ["created_by"],
    })
  }

  async create(codeData: Partial<RedemptionCode>): Promise<RedemptionCode> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(RedemptionCode)
    const redemptionCode = repository.create(codeData)
    return repository.save(redemptionCode)
  }

  async createBatch(codesData: Partial<RedemptionCode>[]): Promise<RedemptionCode[]> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(RedemptionCode)
    const redemptionCodes = repository.create(codesData)
    return repository.save(redemptionCodes)
  }

  async useCode(code: string, userId: string): Promise<RedemptionCode | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(RedemptionCode)

    const redemptionCode = await this.findUnusedByCode(code)
    if (!redemptionCode) return null

    await repository.update(redemptionCode.id, {
      is_used: true,
      used_by_id: userId,
      used_at: new Date(),
    })

    return repository.findOne({
      where: { id: redemptionCode.id },
      relations: ["used_by", "created_by"],
    })
  }

  async findByCreator(creatorId: string, page = 1, limit = 10): Promise<{ codes: RedemptionCode[]; total: number }> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(RedemptionCode)
    const [codes, total] = await repository.findAndCount({
      where: { created_by_id: creatorId },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: "DESC" },
      relations: ["used_by"],
    })
    return { codes, total }
  }

  async findAll(page = 1, limit = 10): Promise<{ codes: RedemptionCode[]; total: number }> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(RedemptionCode)
    const [codes, total] = await repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: "DESC" },
      relations: ["used_by", "created_by"],
    })
    return { codes, total }
  }
}
