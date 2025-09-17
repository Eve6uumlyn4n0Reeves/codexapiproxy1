"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  BarChart3,
  CreditCard,
  Settings,
  FileText,
  LogOut,
  Code,
  Users,
  Gift,
  Activity,
  Shield,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  roles?: string[] // 添加角色权限控制
}

interface User {
  username: string
  email: string
  role: "user" | "admin" | "super_admin"
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/user/profile")

      if (!response.ok) {
        throw new Error("Failed to fetch user profile")
      }

      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error("[v0] Failed to fetch user data:", error)

      setUser({
        username: "admin",
        email: "admin@example.com",
        role: "admin", // 设置为管理员角色用于测试
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/")
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("[v0] Logout failed:", error)
      router.push("/")
    }
  }

  const navItems: NavItem[] = [
    { icon: Home, label: "仪表板", href: "/dashboard" },
    { icon: BarChart3, label: "使用统计", href: "/dashboard/usage" },
    { icon: FileText, label: "文档", href: "/dashboard/docs" },
    { icon: CreditCard, label: "账单", href: "/dashboard/billing" },
    { icon: Settings, label: "设置", href: "/dashboard/settings" },
    // 管理员专用菜单
    { icon: Shield, label: "管理中心", href: "/admin", roles: ["admin", "super_admin"] },
    { icon: Users, label: "用户管理", href: "/admin/users", roles: ["admin", "super_admin"] },
    { icon: Gift, label: "兑换码", href: "/admin/codes", roles: ["admin", "super_admin"] },
    { icon: Activity, label: "系统监控", href: "/admin/monitor", roles: ["admin", "super_admin"] },
  ]

  const hasPermission = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true
    return user?.role && requiredRoles.includes(user.role)
  }

  const filteredNavItems = navItems.filter((item) => hasPermission(item.roles))

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { label: "用户", variant: "default" as const },
      admin: { label: "管理员", variant: "secondary" as const },
      super_admin: { label: "超级管理员", variant: "destructive" as const },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              CodexAPI
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <LanguageToggle />
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-accent/50">
                  <Avatar className="h-8 w-8 border-2 border-border/50">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-3">
                  <div className="flex flex-col space-y-1 leading-none">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user?.username}</p>
                      {user?.role && getRoleBadge(user.role)}
                    </div>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    个人资料
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    设置
                  </Link>
                </DropdownMenuItem>
                {hasPermission(["admin", "super_admin"]) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        管理中心
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        用户管理
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/monitor" className="cursor-pointer">
                        <Activity className="mr-2 h-4 w-4" />
                        系统监控
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
