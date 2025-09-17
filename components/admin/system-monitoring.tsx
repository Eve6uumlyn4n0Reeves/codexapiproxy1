"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  RefreshCw,
  Database,
  Server,
  Gift,
  Loader2,
} from "lucide-react"

interface SystemStats {
  period: string
  users: {
    total: number
    new: number
    active: number
    verified: number
  }
  api: {
    totalRequests: number
    totalTokens: number
    totalCost: number
    errorRate: number
    avgResponseTime: number
  }
  redemption: {
    totalCodes: number
    usedCodes: number
    unusedCodes: number
    expiredCodes: number
  }
  revenue: {
    total: number
    monthly: number
    growth: number
  }
  health: {
    database: string
    api: string
    storage: string
    connections?: number
    maxConnections?: number
  }
}

export function SystemMonitoring() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("7d")
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/system-stats?period=${period}`)
      if (!response.ok) {
        throw new Error("获取统计数据失败")
      }
      const data = await response.json()
      setStats(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("获取统计数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [period])

  // 自动刷新
  useEffect(() => {
    const interval = setInterval(fetchStats, 60000) // 每分钟刷新
    return () => clearInterval(interval)
  }, [period])

  const getHealthBadge = (status: string) => {
    const variants = {
      healthy: "default",
      warning: "secondary",
      critical: "destructive",
    } as const

    const icons = {
      healthy: CheckCircle,
      warning: AlertTriangle,
      critical: AlertTriangle,
    }

    const Icon = icons[status as keyof typeof icons] || CheckCircle

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status === "healthy" ? "正常" : status === "warning" ? "警告" : "严重"}
      </Badge>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount)
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <p className="text-lg font-medium">无法加载统计数据</p>
          <Button onClick={fetchStats} className="mt-4">
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统监控</h1>
          <p className="text-muted-foreground">实时监控系统性能和业务数据</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7天</SelectItem>
              <SelectItem value="30d">30天</SelectItem>
              <SelectItem value="90d">90天</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">最后更新: {lastUpdate.toLocaleTimeString()}</div>
          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 系统健康状态 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">数据库状态</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getHealthBadge(stats.health.database)}
              {stats.health.connections && stats.health.maxConnections && (
                <div className="text-sm text-muted-foreground">
                  {stats.health.connections}/{stats.health.maxConnections} 连接
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API状态</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getHealthBadge(stats.health.api)}
              <div className="text-sm text-muted-foreground">错误率: {stats.api.errorRate.toFixed(2)}%</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">存储状态</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getHealthBadge(stats.health.storage)}
              <div className="text-sm text-muted-foreground">响应时间: {stats.api.avgResponseTime.toFixed(0)}ms</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 核心指标 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.users.total)}</div>
            <p className="text-xs text-muted-foreground">
              新增 {stats.users.new} 人 ({period})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.users.active)}</div>
            <p className="text-xs text-muted-foreground">
              活跃率: {((stats.users.active / stats.users.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API请求</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.api.totalRequests)}</div>
            <p className="text-xs text-muted-foreground">Token: {formatNumber(stats.api.totalTokens)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总成本</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.api.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              平均每请求: {formatCurrency(stats.api.totalCost / Math.max(stats.api.totalRequests, 1))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细监控 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="users">用户分析</TabsTrigger>
          <TabsTrigger value="api">API分析</TabsTrigger>
          <TabsTrigger value="redemption">兑换码分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>用户增长趋势</CardTitle>
                <CardDescription>
                  过去{period === "7d" ? "7天" : period === "30d" ? "30天" : "90天"}的用户增长
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  图表数据加载中...
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API使用趋势</CardTitle>
                <CardDescription>请求量和Token使用情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  图表数据加载中...
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>用户验证率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {((stats.users.verified / stats.users.total) * 100).toFixed(1)}%
                </div>
                <Progress value={(stats.users.verified / stats.users.total) * 100} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.users.verified} / {stats.users.total} 用户已验证
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API成功率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{(100 - stats.api.errorRate).toFixed(1)}%</div>
                <Progress value={100 - stats.api.errorRate} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">错误率: {stats.api.errorRate.toFixed(2)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>兑换码使用率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.redemption.totalCodes > 0
                    ? ((stats.redemption.usedCodes / stats.redemption.totalCodes) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <Progress
                  value={
                    stats.redemption.totalCodes > 0
                      ? (stats.redemption.usedCodes / stats.redemption.totalCodes) * 100
                      : 0
                  }
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.redemption.usedCodes} / {stats.redemption.totalCodes} 已使用
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总用户</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">新用户</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.users.new}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.users.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">已验证用户</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.users.verified}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总请求数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(stats.api.totalRequests)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总Token数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.api.totalTokens)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总成本</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.api.totalCost)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.api.avgResponseTime.toFixed(0)}ms</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="redemption" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总兑换码</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.redemption.totalCodes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">已使用</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.redemption.usedCodes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">未使用</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.redemption.unusedCodes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">已过期</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.redemption.expiredCodes}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
