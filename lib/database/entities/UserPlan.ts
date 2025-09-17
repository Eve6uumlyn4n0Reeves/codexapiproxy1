import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"
import { PlanType } from "./RedemptionCode"

export { PlanType } from "./RedemptionCode"

@Entity("user_plans")
export class UserPlan {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  user_id: string

  @Column({
    type: "enum",
    enum: PlanType,
  })
  plan_type: PlanType

  @Column()
  token_limit: number

  @Column({ default: 0 })
  tokens_used: number

  @Column()
  starts_at: Date

  @Column()
  expires_at: Date

  @Column({ default: true })
  is_active: boolean

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(
    () => User,
    (user) => user.user_plans,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "user_id" })
  user: User
}
