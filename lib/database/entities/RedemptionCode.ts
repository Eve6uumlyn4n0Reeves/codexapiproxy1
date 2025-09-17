import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"

export enum PlanType {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

@Entity("redemption_codes")
export class RedemptionCode {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({
    type: "enum",
    enum: PlanType,
  })
  plan_type: PlanType

  @Column()
  token_limit: number

  @Column({ default: false })
  is_used: boolean

  @Column({ nullable: true })
  used_by_id: string

  @Column({ nullable: true })
  used_at: Date

  @Column({ nullable: true })
  expires_at: Date

  @CreateDateColumn()
  created_at: Date

  @Column({ nullable: true })
  created_by_id: string

  @Column({ nullable: true })
  description: string

  @ManyToOne(
    () => User,
    (user) => user.used_redemption_codes,
    { onDelete: "SET NULL" },
  )
  @JoinColumn({ name: "used_by_id" })
  used_by: User

  @ManyToOne(
    () => User,
    (user) => user.created_redemption_codes,
    { onDelete: "SET NULL" },
  )
  @JoinColumn({ name: "created_by_id" })
  created_by: User
}
