// 应用配置管理
export const config = {
  // 应用基本信息
  app: {
    name: "CodeX API Proxy",
    version: "1.0.0",
    description: "AI API代理服务平台",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // 环境配置
  env: {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
  },

  // MySQL 数据库配置
  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "codexapi",
    charset: "utf8mb4",
    timezone: "+00:00",
  },

  // JWT 认证配置
  auth: {
    jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    cookieName: "auth-token",
    cookieMaxAge: 60 * 60 * 24 * 7, // 7 days
  },

  // OpenAI API 配置
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    timeout: 60000, // 60 seconds
  },

  // API配置
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    timeout: 30000,
    retries: 3,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 每个窗口最多100个请求
    },
  },

  // 安全配置
  security: {
    bcryptRounds: 12,
    passwordResetExpiry: 60 * 60 * 1000, // 1小时
    verificationTokenExpiry: 24 * 60 * 60 * 1000, // 24小时
    apiKeyPrefix: "ck-",
    apiKeyLength: 48,
  },

  // 功能开关
  features: {
    registration: true,
    emailVerification: true,
    passwordReset: true,
    apiKeyManagement: true,
    usageTracking: true,
    redemptionCodes: true,
    rateLimiting: true,
  },

  // 限制配置
  limits: {
    maxApiKeysPerUser: 10,
    maxRequestsPerMinute: 60,
    maxTokensPerRequest: 4000,
    defaultDailyTokenLimit: 10000,
    defaultWeeklyTokenLimit: 50000,
    defaultMonthlyTokenLimit: 200000,
  },

  // 邮件配置
  email: {
    from: process.env.EMAIL_FROM || "noreply@codexapi.com",
    replyTo: process.env.EMAIL_REPLY_TO || "support@codexapi.com",
    resendApiKey: process.env.RESEND_API_KEY,
  },

  // 监控配置
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableUsageAnalytics: true,
    logLevel: process.env.LOG_LEVEL || "info",
  },

  // Redis 配置（可选，用于缓存和限流）
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || "localhost",
    port: Number.parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
}

// 配置验证
export function validateConfig() {
  const requiredEnvVars = ["DB_HOST", "DB_USERNAME", "DB_PASSWORD", "DB_NAME", "JWT_SECRET", "OPENAI_API_KEY"]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
  }

  console.log("[v0] Configuration validated successfully")
}

// 在应用启动时验证配置
if (typeof window === "undefined") {
  validateConfig()
}
