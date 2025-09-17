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
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  roles?: string[]
  badge?: string
}

interface User {
  username: string
  email: string
  role: "user" | "admin" | "super_admin"
}

export function EnhancedDashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState(3)
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
        role: "admin",
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
    { icon: BarChart3, label: "使用统计", href: "/dashboard/usage", badge: "新" },
    { icon: FileText, label: "文档", href: "/dashboard/docs" },
    { icon: CreditCard, label: "账单", href: "/dashboard/billing" },
    { icon: Settings, label: "设置", href: "/dashboard/settings" },
    { icon: Shield, label: "管理中心", href: "/admin", roles: ["admin", "super_admin"] },
    { icon: Users, label: "用户管理", href: "/admin/users", roles: ["admin", "super_admin"] },
    { icon: Gift, label: "兑换码", href: "/admin/codes", roles: ["admin", "super_admin"] },
    { icon: Activity, label: "系统监控", href: "/admin/monitor", roles: ["admin", "super_admin"], badge: "实时" },
  ]

  const hasPermission = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true
    return user?.role && requiredRoles.includes(user.role)
  }

  const filteredNavItems = navItems.filter((item) => hasPermission(item.roles))

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { label: "用户", variant: "default" as const, color: "bg-blue-500" },
      admin: { label: "管理员", variant: "secondary" as const, color: "bg-purple-500" },
      super_admin: { label: "超级管理员", variant: "destructive" as const, color: "bg-red-500" },
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary/40 rounded-full animate-spin mx-auto"
              style={{ animationDelay: "0.15s" }}
            ></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">加载中...</p>
            <p className="text-sm text-muted-foreground">正在初始化您的工作空间</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Code className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    CodexAPI
                  </span>
                  <p className="text-xs text-muted-foreground -mt-1">AI API 中转服务</p>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索功能、文档..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 focus:bg-background transition-colors duration-200"
                />
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {filteredNavItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 group"
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </Button>

              <LanguageToggle />
              <ThemeToggle />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50 group">
                    <Avatar className="h-9 w-9 border-2 border-border/50 group-hover:border-primary/50 transition-colors duration-200">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-4">
                    <Avatar className="h-12 w-12 border-2 border-border/50">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-lg">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user?.username}</p>
                        {user?.role && getRoleBadge(user.role)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Users className="mr-3 h-4 w-4" />
                      个人资料
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-3 h-4 w-4" />
                      设置
                    </Link>
                  </DropdownMenuItem>
                  {hasPermission(["admin", "super_admin"]) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="mr-3 h-4 w-4" />
                          管理中心
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/monitor" className="cursor-pointer">
                          <Activity className="mr-3 h-4 w-4" />
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
                    <LogOut className="mr-3 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border shadow-xl">
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">CodexAPI</span>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5 ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="animate-in fade-in-0 duration-500">{children}</div>
      </main>
    </div>
  )
}
