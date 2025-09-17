import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { ApiKey } from "./ApiKey"
import { UserPlan } from "./UserPlan"
import { UsageLog } from "./UsageLog"
import { RedemptionCode } from "./RedemptionCode"

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  password_hash: string

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole

  @Column({ default: false })
  is_verified: boolean

  @Column({ nullable: true })
  verification_token: string

  @Column({ nullable: true })
  reset_token: string

  @Column({ nullable: true })
  reset_token_expires: Date

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(
    () => ApiKey,
    (apiKey) => apiKey.user,
  )
  api_keys: ApiKey[]

  @OneToMany(
    () => UserPlan,
    (userPlan) => userPlan.user,
  )
  user_plans: UserPlan[]

  @OneToMany(
    () => UsageLog,
    (usageLog) => usageLog.user,
  )
  usage_logs: UsageLog[]

  @OneToMany(
    () => RedemptionCode,
    (redemptionCode) => redemptionCode.used_by,
  )
  used_redemption_codes: RedemptionCode[]

  @OneToMany(
    () => RedemptionCode,
    (redemptionCode) => redemptionCode.created_by,
  )
  created_redemption_codes: RedemptionCode[]
}
