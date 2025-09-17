"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallbackPath?: string
  loadingComponent?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallbackPath = "/dashboard", loadingComponent }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/")
      return
    }

    if (!allowedRoles.includes(user.role)) {
      setIsAuthorized(false)
      router.push(fallbackPath)
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [user, authLoading, allowedRoles, fallbackPath, router])

  if (isLoading || authLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
