const mysql = require("mysql2/promise")
require("dotenv").config()

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
  })

  try {
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || "codexapi"}\``)
    console.log("Database created successfully")
  } catch (error) {
    console.error("Error creating database:", error)
  } finally {
    await connection.end()
  }
}

createDatabase()
