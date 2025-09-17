import { Database } from "../lib/database"
import bcrypt from "bcryptjs"

// 初始化测试用户数据
async function initTestData() {
  console.log("正在初始化测试用户数据...")

  try {
    // 创建普通用户
    const testUserPassword = await bcrypt.hash("123456", 12)
    const testUser = await Database.createUser({
      email: "user@test.com",
      username: "testuser",
      passwordHash: testUserPassword,
      role: "user",
      emailVerified: true,
    })

    // 为测试用户创建API密钥
    await Database.createApiKey(testUser.id, "默认API密钥")

    // 创建管理员用户
    const adminPassword = await bcrypt.hash("admin123", 12)
    const adminUser = await Database.createUser({
      email: "admin@test.com",
      username: "admin",
      passwordHash: adminPassword,
      role: "admin",
      emailVerified: true,
    })

    // 创建超级管理员用户
    const superAdminPassword = await bcrypt.hash("superadmin123", 12)
    const superAdminUser = await Database.createUser({
      email: "superadmin@test.com",
      username: "superadmin",
      passwordHash: superAdminPassword,
      role: "super_admin",
      emailVerified: true,
    })

    console.log("✅ 测试用户数据初始化完成!")
    console.log("\n📋 测试账户信息:")
    console.log("普通用户: user@test.com / 123456")
    console.log("管理员: admin@test.com / admin123")
    console.log("超级管理员: superadmin@test.com / superadmin123")
  } catch (error) {
    console.error("❌ 初始化测试数据失败:", error)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initTestData()
}

export { initTestData }
