import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("system_stats")
export class SystemStats {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "date", unique: true })
  date: string

  @Column({ default: 0 })
  total_users: number

  @Column({ default: 0 })
  active_users: number

  @Column({ default: 0 })
  total_requests: number

  @Column({ default: 0 })
  total_tokens: number

  @Column("decimal", { precision: 12, scale: 6, default: 0 })
  total_cost: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
