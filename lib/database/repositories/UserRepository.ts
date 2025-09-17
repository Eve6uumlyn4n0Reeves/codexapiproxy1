import type { Repository } from "typeorm"
import { User, type UserRole } from "../entities/User"
import { getDatabase } from "../data-source"

export class UserRepository {
  private repository: Repository<User>

  constructor() {
    this.init()
  }

  private async init() {
    const dataSource = await getDatabase()
    this.repository = dataSource.getRepository(User)
  }

  async findById(id: string): Promise<User | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(User)
    return repository.findOne({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(User)
    return repository.findOne({ where: { email } })
  }

  async create(userData: Partial<User>): Promise<User> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(User)
    const user = repository.create(userData)
    return repository.save(user)
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(User)
    await repository.update(id, userData)
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(User)
    const result = await repository.delete(id)
    return result.affected > 0
  }

  async findAll(page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(User)
    const [users, total] = await repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: "DESC" },
    })
    return { users, total }
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(User)
    return repository.find({ where: { role } })
  }

  async verifyUser(id: string): Promise<boolean> {
    const dataSource = await getDatabase()
    const repository = dataSource.getRepository(User)
    const result = await repository.update(id, {
      is_verified: true,
      verification_token: null,
    })
    return result.affected > 0
  }
}
