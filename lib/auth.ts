import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import crypto from "crypto"
import { UserRepository } from "./database/repositories/UserRepository"
import { UserRole } from "./database/entities/User"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  is_verified: boolean
  created_at: Date
  updated_at: Date
}

export const PERMISSIONS = {
  // 用户权限
  USER_READ_OWN: "user:read:own",
  USER_UPDATE_OWN: "user:update:own",

  // API密钥权限
  API_KEY_CREATE: "api_key:create",
  API_KEY_READ_OWN: "api_key:read:own",
  API_KEY_UPDATE_OWN: "api_key:update:own",
  API_KEY_DELETE_OWN: "api_key:delete:own",

  // 兑换码权限
  REDEMPTION_CODE_USE: "redemption_code:use",
  REDEMPTION_CODE_CREATE: "redemption_code:create",
  REDEMPTION_CODE_READ_ALL: "redemption_code:read:all",
  REDEMPTION_CODE_DELETE: "redemption_code:delete",

  // 管理员权限
  ADMIN_USER_READ_ALL: "admin:user:read:all",
  ADMIN_USER_UPDATE_ALL: "admin:user:update:all",
  ADMIN_USAGE_READ_ALL: "admin:usage:read:all",

  // 超级管理员权限
  SUPER_ADMIN_SYSTEM_STATS: "super_admin:system:stats",
  SUPER_ADMIN_ALL: "super_admin:all",
} as const

export const ROLE_PERMISSIONS = {
  [UserRole.USER]: [
    PERMISSIONS.USER_READ_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.API_KEY_CREATE,
    PERMISSIONS.API_KEY_READ_OWN,
    PERMISSIONS.API_KEY_UPDATE_OWN,
    PERMISSIONS.API_KEY_DELETE_OWN,
    PERMISSIONS.REDEMPTION_CODE_USE,
  ],
  [UserRole.ADMIN]: [
    PERMISSIONS.USER_READ_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.API_KEY_CREATE,
    PERMISSIONS.API_KEY_READ_OWN,
    PERMISSIONS.API_KEY_UPDATE_OWN,
    PERMISSIONS.API_KEY_DELETE_OWN,
    PERMISSIONS.REDEMPTION_CODE_USE,
    PERMISSIONS.REDEMPTION_CODE_CREATE,
    PERMISSIONS.REDEMPTION_CODE_READ_ALL,
    PERMISSIONS.REDEMPTION_CODE_DELETE,
    PERMISSIONS.ADMIN_USER_READ_ALL,
    PERMISSIONS.ADMIN_USER_UPDATE_ALL,
    PERMISSIONS.ADMIN_USAGE_READ_ALL,
  ],
  [UserRole.SUPER_ADMIN]: [
    // 超级管理员拥有所有权限
    ...Object.values(PERMISSIONS),
  ],
} as const

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"
const COOKIE_NAME = "auth-token"

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

// JWT 工具函数
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Cookie 管理
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export const clearAuthCookie = removeAuthCookie

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value || null
}

// 权限检查函数
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  return rolePermissions?.includes(permission as any) || false
}

export function requirePermission(user: AuthUser, permission: string): void {
  if (!hasPermission(user.role, permission)) {
    throw new Error(`权限不足: 需要 ${permission} 权限`)
  }
}

// 用户认证函数
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const token = await getAuthToken()
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const userRepository = new UserRepository()
    const user = await userRepository.findById(payload.userId)
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  } catch (error) {
    console.error("获取当前用户失败:", error)
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/")
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard")
  }
  return user
}

export async function requirePermissions(requiredPermissions: string[]): Promise<AuthUser> {
  const user = await requireAuth()

  for (const permission of requiredPermissions) {
    if (!hasPermission(user.role, permission)) {
      redirect("/dashboard")
    }
  }

  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  return await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  return await requireRole([UserRole.SUPER_ADMIN])
}

// 用户角色检查函数
export function isAdmin(user: AuthUser): boolean {
  return [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)
}

export function isSuperAdmin(user: AuthUser): boolean {
  return user.role === UserRole.SUPER_ADMIN
}

export function canAccessAdminPanel(user: AuthUser): boolean {
  return isAdmin(user)
}

export function canAccessSystemMonitoring(user: AuthUser): boolean {
  return isSuperAdmin(user)
}

export function canManageRedemptionCodes(user: AuthUser): boolean {
  return isAdmin(user)
}

export function canViewAllUsers(user: AuthUser): boolean {
  return isAdmin(user)
}

// 密码处理函数
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

// API Key 生成函数
export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = "ck-"
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateApiKeyHash(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}

export function verifyApiKey(apiKey: string, hash: string): boolean {
  const computedHash = crypto.createHash("sha256").update(apiKey).digest("hex")
  return computedHash === hash
}

// 验证令牌生成
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 认证服务类
export class AuthService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async register(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    // 检查用户是否已存在
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new Error("用户已存在")
    }

    // 创建新用户
    const hashedPassword = hashPassword(password)
    const verificationToken = generateVerificationToken()

    const user = await this.userRepository.create({
      email,
      password_hash: hashedPassword,
      role: UserRole.USER,
      is_verified: false,
      verification_token: verificationToken,
    })

    // 生成 JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    }
  }

  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    // 查找用户
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new Error("用户不存在")
    }

    // 验证密码
    if (!verifyPassword(password, user.password_hash)) {
      throw new Error("密码错误")
    }

    // 生成 JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    const userRepository = new UserRepository()
    const users = await userRepository.findAll()
    const user = users.users.find((u) => u.verification_token === token)

    if (!user) {
      return false
    }

    await userRepository.verifyUser(user.id)
    return true
  }

  async requestPasswordReset(email: string): Promise<string | null> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      return null
    }

    const resetToken = generateResetToken()
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour

    await this.userRepository.update(user.id, {
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires,
    })

    return resetToken
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const userRepository = new UserRepository()
    const users = await userRepository.findAll()
    const user = users.users.find(
      (u) => u.reset_token === token && u.reset_token_expires && u.reset_token_expires > new Date(),
    )

    if (!user) {
      return false
    }

    const hashedPassword = hashPassword(newPassword)
    await userRepository.update(user.id, {
      password_hash: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    })

    return true
  }
}

// API 路由认证函数
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    // 从 Authorization header 获取 token
    const authHeader = request.headers.get("authorization")
    let token: string | null = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    } else {
      // 从 cookie 获取 token
      const cookieToken = request.cookies.get(COOKIE_NAME)?.value
      if (cookieToken) {
        token = cookieToken
      }
    }

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const userRepository = new UserRepository()
    const user = await userRepository.findById(payload.userId)
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  } catch (error) {
    console.error("[v0] Verify auth error:", error)
    return null
  }
}

// 更细粒度的权限检查函数
export function canCreateRedemptionCode(user: AuthUser): boolean {
  return hasPermission(user.role, PERMISSIONS.REDEMPTION_CODE_CREATE)
}

export function canViewSystemStats(user: AuthUser): boolean {
  return hasPermission(user.role, PERMISSIONS.SUPER_ADMIN_SYSTEM_STATS)
}

export function canManageAllUsers(user: AuthUser): boolean {
  return hasPermission(user.role, PERMISSIONS.ADMIN_USER_READ_ALL)
}

export function canViewAllUsage(user: AuthUser): boolean {
  return hasPermission(user.role, PERMISSIONS.ADMIN_USAGE_READ_ALL)
}

// 权限级别比较函数
export function hasHigherOrEqualRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.USER]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.SUPER_ADMIN]: 3,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// 批量权限检查
export function hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission))
}
