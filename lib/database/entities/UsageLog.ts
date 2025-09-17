import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"
import { ApiKey } from "./ApiKey"

@Entity("usage_logs")
export class UsageLog {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  user_id: string

  @Column({ nullable: true })
  api_key_id: string

  @Column()
  model: string

  @Column()
  prompt_tokens: number

  @Column()
  completion_tokens: number

  @Column()
  total_tokens: number

  @Column("decimal", { precision: 10, scale: 6 })
  cost: number

  @Column({ nullable: true })
  request_id: string

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(
    () => User,
    (user) => user.usage_logs,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @ManyToOne(
    () => ApiKey,
    (apiKey) => apiKey.usage_logs,
    { onDelete: "SET NULL" },
  )
  @JoinColumn({ name: "api_key_id" })
  api_key: ApiKey
}
