"use client"
import { useAuth } from "@/hooks/use-auth"
import { hasPermission } from "@/lib/auth"

interface UserRole {
  role: string | null
  isLoading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  hasPermission: (permission: string) => boolean
}

export function useUserRole(): UserRole {
  const { user, isLoading } = useAuth()
  const role = user?.role || null

  return {
    role,
    isLoading,
    isAdmin: role ? ["admin", "super_admin"].includes(role) : false,
    isSuperAdmin: role === "super_admin",
    hasPermission: (permission: string) => (role ? hasPermission(role, permission) : false),
  }
}
