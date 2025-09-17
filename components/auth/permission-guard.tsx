"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { hasPermission } from "@/lib/auth"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermissions: string[]
  fallbackComponent?: React.ReactNode
}

export function PermissionGuard({ children, requiredPermissions, fallbackComponent }: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      setHasAccess(false)
      return
    }

    const hasAllPermissions = requiredPermissions.every((permission) => hasPermission(user.role, permission))
    setHasAccess(hasAllPermissions)
  }, [user, isLoading, requiredPermissions])

  if (isLoading || hasAccess === null) {
    return null // 加载中
  }

  if (!hasAccess) {
    return (
      fallbackComponent || (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              权限不足
            </CardTitle>
            <CardDescription>您没有访问此功能的权限</CardDescription>
          </CardHeader>
          <CardContent>{/* Additional content can be added here if needed */}</CardContent>
        </Card>
      )
    )
  }

  return <>{children}</>
}
