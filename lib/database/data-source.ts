import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entities/User"
import { ApiKey } from "./entities/ApiKey"
import { RedemptionCode } from "./entities/RedemptionCode"
import { UserPlan } from "./entities/UserPlan"
import { UsageLog } from "./entities/UsageLog"
import { SystemStats } from "./entities/SystemStats"

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "codexapi",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, ApiKey, RedemptionCode, UserPlan, UsageLog, SystemStats],
  migrations: ["lib/database/migrations/*.ts"],
  subscribers: ["lib/database/subscribers/*.ts"],
  charset: "utf8mb4",
  timezone: "+00:00",
  extra: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
  },
  connectTimeout: 60000,
  acquireTimeout: 60000,
  maxQueryExecutionTime: 30000,
})

let isInitialized = false
let initializationPromise: Promise<DataSource> | null = null

export async function initializeDatabase(): Promise<DataSource> {
  if (isInitialized) {
    return AppDataSource
  }

  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = (async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
      }
      isInitialized = true
      console.log("[v0] Database connection initialized successfully")
      return AppDataSource
    } catch (error) {
      console.error("[v0] Error during database initialization:", error)
      initializationPromise = null // 重置以允许重试
      throw error
    }
  })()

  return initializationPromise
}

export async function getDatabase(): Promise<DataSource> {
  if (!isInitialized) {
    await initializeDatabase()
  }
  return AppDataSource
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const dataSource = await getDatabase()
    await dataSource.query("SELECT 1")
    return true
  } catch (error) {
    console.error("[v0] Database health check failed:", error)
    return false
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      isInitialized = false
      initializationPromise = null
      console.log("[v0] Database connection closed successfully")
    }
  } catch (error) {
    console.error("[v0] Error closing database connection:", error)
  }
}
