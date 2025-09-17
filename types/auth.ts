import { UserRole } from "@/lib/database/entities/User"
import type { Permission } from "@/lib/database/entities/User"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  is_verified: boolean
  created_at: Date
  updated_at: Date
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword?: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
}

export interface EmailVerificationRequest {
  token: string
}

export interface RolePermissions {
  [UserRole.USER]: Permission[]
  [UserRole.ADMIN]: Permission[]
  [UserRole.SUPER_ADMIN]: Permission[]
}

// Declare UserRole if it's not imported correctly
// enum UserRole {
//   USER = "user",
//   ADMIN = "admin",
//   SUPER_ADMIN = "super_admin"
// }
