import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { User } from "./User"
import { UsageLog } from "./UsageLog"

@Entity("api_keys")
export class ApiKey {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  user_id: string

  @Column({ unique: true })
  key_hash: string

  @Column()
  name: string

  @Column({ default: true })
  is_active: boolean

  @CreateDateColumn()
  created_at: Date

  @Column({ nullable: true })
  last_used_at: Date

  @Column({ nullable: true })
  expires_at: Date

  @ManyToOne(
    () => User,
    (user) => user.api_keys,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "user_id" })
  user: User

  @OneToMany(
    () => UsageLog,
    (usageLog) => usageLog.api_key,
  )
  usage_logs: UsageLog[]
}
