import { NextResponse } from "next/server"
import { UserRepository } from "@/lib/database/repositories"
import { UserRole } from "@/lib/database/entities/User"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const userRepo = new UserRepository()

    // 创建测试用户数据
    const testUsers = [
      {
        email: "user@test.com",
        password_hash: await bcrypt.hash("123456", 12),
        role: UserRole.USER,
        is_verified: true,
      },
      {
        email: "admin@test.com",
        password_hash: await bcrypt.hash("admin123", 12),
        role: UserRole.ADMIN,
        is_verified: true,
      },
      {
        email: "superadmin@test.com",
        password_hash: await bcrypt.hash("superadmin123", 12),
        role: UserRole.SUPER_ADMIN,
        is_verified: true,
      },
    ]

    const createdUsers = []
    for (const userData of testUsers) {
      // 检查用户是否已存在
      const existingUser = await userRepo.findByEmail(userData.email)
      if (!existingUser) {
        const user = await userRepo.create(userData)
        createdUsers.push(user)
      }
    }

    return NextResponse.json({
      success: true,
      message: "测试数据初始化完成",
      accounts: [
        { email: "user@test.com", password: "123456", role: "普通用户" },
        { email: "admin@test.com", password: "admin123", role: "管理员" },
        { email: "superadmin@test.com", password: "superadmin123", role: "超级管理员" },
      ],
      created: createdUsers.length,
    })
  } catch (error) {
    console.error("[v0] 初始化测试数据失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: "初始化失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}
