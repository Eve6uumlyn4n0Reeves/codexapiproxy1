# CodeX API Proxy

一个用于个人使用的 AI API 代理与控制台（Next.js + TypeScript）。提供 OpenAI 兼容接口转发、用户系统、API Key 管理、用量统计、套餐/兑换码、速率限制以及基础监控与管理后台。

## 功能简介
- OpenAI 兼容 API：`/v1/chat/completions`、`/v1/models`
- 用户系统：注册、登录、邮箱验证、找回/重置密码
- API Key 管理：创建/禁用/删除，最后使用时间
- 用量统计：请求次数、Token 用量与费用记录（`usage_logs`）
- 套餐与兑换码：按日/周/月限制额度，兑换码激活套餐
- 速率限制：按角色与时间窗的请求次数 + Token 配额
- 管理后台：用户管理、兑换码管理、系统监控
- 中间件与安全：JWT Cookie 登录、路由访问控制、基础安全响应头

## 技术栈
- 前端/服务端：`Next.js 14 (App Router)`、`React 18`、`TypeScript`
- UI：`Tailwind CSS` + `shadcn/ui` + `Radix UI`
- 数据层：`TypeORM` + `MySQL`（开发环境可自动建表）
- 缓存/限流（可选）：`Redis`
- 邮件：`Resend`（用于发送验证/欢迎/重置邮件）
- 日志与监控：简单日志器与指标采集

## 目录结构（摘录）
- `app/`：Next.js 页面与路由（含 API 路由）
  - `api/v1/*`：对外 OpenAI 兼容接口
  - `api/auth/*`：认证相关接口
  - `dashboard/*`、`admin/*`：用户与管理员界面
- `lib/`：核心逻辑
  - `config.ts`：配置与环境变量
  - `auth.ts`：认证、JWT、权限
  - `database/*`：TypeORM 实体与仓库、数据源
  - `rate-limiter.ts`：基于数据库的限流
  - `usage-tracker.ts`：用量记录
  - `middleware/*`：中间件
- `components/`：UI 组件
- `scripts/`：数据库脚本、初始化与健康检查

## 环境变量
至少需要以下变量（本地开发示例 `.env.local`）：

```
# 基础
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 数据库（MySQL）
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=codexapi

# 认证/安全
JWT_SECRET=please-change-me
JWT_EXPIRES_IN=7d

# OpenAI 代理
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1

# 邮件（可选，用于邮箱验证/欢迎/重置）
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM="CodexAPI <noreply@codexapi.com>"
EMAIL_REPLY_TO=support@codexapi.com

# Redis（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
```

启动时服务器端会校验关键变量：`DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, JWT_SECRET, OPENAI_API_KEY`。

## 本地运行
1. 安装依赖（推荐 Node 18+）：
   - `npm install`
2. 准备数据库：
   - 方式A（开发快速体验）：保持 `NODE_ENV=development`，TypeORM 会为实体自动建表；
   - 方式B（手动建表）：导入 `scripts/create-mysql-tables.sql` 到目标数据库；另外创建限流表：
     ```sql
     -- rate_limits 表（如未创建）
     CREATE TABLE IF NOT EXISTS rate_limits (
       id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
       user_id VARCHAR(36) NOT NULL UNIQUE,
       request_count INT DEFAULT 0,
       request_reset_time TIMESTAMP NOT NULL,
       token_count INT DEFAULT 0,
       token_reset_time TIMESTAMP NOT NULL,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       INDEX idx_rate_limits_user_id (user_id),
       INDEX idx_rate_limits_updated (updated_at)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
     ```
3. 开发模式：`npm run dev`（默认 http://localhost:3000）
4. 生产构建：`npm run build`，启动：`npm start`

可选：初始化测试数据（创建测试用户与 API Key）
- `node scripts/create-database.js`（按 .env 创建数据库）
- `ts-node scripts/init-test-data.ts`

## Docker 启动
- 一键起服务、MySQL、Redis：`docker-compose up -d`
- App 默认监听 `3000` 端口，MySQL 暴露 `3306`，Redis 暴露 `6379`

## 对外 API（速览）
- `POST /api/v1/chat/completions`
  - 头：`Authorization: Bearer <你的API Key>`
  - 体（示例）：
    ```json
    {
      "model": "gpt-5",
      "messages": [{"role": "user", "content": "Hello"}],
      "max_tokens": 100
    }
    ```
- `GET /api/v1/models`
  - 头：`Authorization: Bearer <你的API Key>`

API Key 在用户仪表盘创建与管理，限流与 Token 配额按用户角色与套餐生效。

## 注意事项
- 本项目为个人项目，旨在自用与学习，未做繁琐治理；根据需要自行裁剪。
- 开发环境 `synchronize=true` 会自动建表，但生产环境请使用脚本建表并管理迁移。
- 邮件功能依赖 Resend，可按需关闭或替换。
- `/v1/models` 返回的是本项目内置映射；实际转发到 `OPENAI_BASE_URL` 时，会将内部模型名映射到可用模型。

