"use client"

import type { ReactNode } from "react"
import { useUser } from "@/hooks/use-user"
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/auth"

interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
  roles?: string[]
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  roles = [],
}: PermissionGuardProps) {
  const { user } = useUser()

  if (!user) {
    return <>{fallback}</>
  }

  // 检查角色权限
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <>{fallback}</>
  }

  // 检查单个权限
  if (permission && !hasPermission(user.role, permission)) {
    return <>{fallback}</>
  }

  // 检查多个权限
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(user.role, permissions)
      : hasAnyPermission(user.role, permissions)

    if (!hasRequiredPermissions) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
