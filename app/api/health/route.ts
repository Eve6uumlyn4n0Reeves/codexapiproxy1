import { NextResponse } from "next/server"
import { AppDataSource } from "@/lib/database/data-source"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // 检查数据库连接
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const dbStatus = AppDataSource.isInitialized ? "connected" : "disconnected"

    const healthStatus = {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "1.0.0",
    }

    logger.info("Health check performed", healthStatus)

    return NextResponse.json(healthStatus)
  } catch (error) {
    logger.error("Health check failed", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
