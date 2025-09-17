const { AppDataSource } = require("../lib/database/data-source")
const path = require("path")
const fs = require("fs")

async function runMigrations() {
  try {
    console.log("正在初始化数据库连接...")

    // 初始化数据库连接
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    console.log("数据库连接成功!")

    // 运行所有待执行的迁移
    console.log("正在运行数据库迁移...")
    const migrations = await AppDataSource.runMigrations()

    if (migrations.length === 0) {
      console.log("✅ 没有待执行的迁移")
    } else {
      console.log(`✅ 成功执行了 ${migrations.length} 个迁移:`)
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`)
      })
    }

    console.log("数据库迁移完成!")
  } catch (error) {
    console.error("❌ 数据库迁移失败:", error)
    process.exit(1)
  } finally {
    // 关闭数据库连接
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigrations()
}

module.exports = { runMigrations }
