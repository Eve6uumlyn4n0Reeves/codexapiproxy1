"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw, Settings, BarChart3, CreditCard, Clock, TrendingUp, Zap } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ApiKeyManager } from "@/components/api-key-manager"
import { UsageStats } from "@/components/usage-stats"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  id: string
  email: string
  username: string
  role: string
  balance: number
  totalRequests: number
  totalTokens: number
  totalCost: number
  usageTime: string
  accountType: string
  dailyLimit: number
  dailyUsed: number
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/dashboard")

      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      setUserData({
        id: "user123",
        email: "user@example.com",
        username: "testuser",
        role: "user",
        balance: 5.0,
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0.0,
        usageTime: "未开始",
        accountType: "免费账户",
        dailyLimit: 10000,
        dailyUsed: 0,
      })

      toast({
        title: "使用模拟数据",
        description: "无法连接到服务器，显示模拟数据",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">无法加载用户数据</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">欢迎回来，{userData.username}</h1>
            <p className="text-muted-foreground mt-1">管理您的 API 使用情况和配置</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {userData.accountType}
          </Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">总额度</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${userData.balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                订阅: ${userData.balance.toFixed(2)} | 按需付费: ${userData.balance.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">已使用令牌</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {userData.totalTokens.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                最近5分钟
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">账户类型</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">免费账户</div>
              <p className="text-xs text-muted-foreground mt-1">没有活跃订阅</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -translate-y-4 translate-x-4"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">使用时长</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{userData.usageTime}</div>
            </CardContent>
          </Card>
        </div>

        {/* API Configuration */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">API 配置</CardTitle>
                <CardDescription className="text-base">管理您的 API 密钥和端点配置</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ApiKeyManager />
          </CardContent>
        </Card>

        {/* Quick Setup */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">快速设置</CardTitle>
                <CardDescription className="text-base">配置您的开发环境以使用 CodexAPI 服务</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">API 配置示例</label>
              <div className="bg-gradient-to-r from-muted to-muted/80 p-4 rounded-xl border border-border/50 font-mono text-sm relative group">
                <code className="text-foreground">
                  export OPENAI_API_BASE="https://api.codexapi.dev/v1"
                  <br />
                  export OPENAI_API_KEY="ck_bae252af6c1746eafb146c42867b4966a492ce4f663a70295f84a80fcda735b"
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      'export OPENAI_API_BASE="https://api.codexapi.dev/v1"\nexport OPENAI_API_KEY="ck_bae252af6c1746eafb146c42867b4966a492ce4f663a70295f84a80fcda735b"',
                    )
                    toast({ title: "已复制到剪贴板" })
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Python 示例代码:</label>
              <div className="bg-gradient-to-r from-muted to-muted/80 p-4 rounded-xl border border-border/50 font-mono text-sm">
                <code className="text-foreground">
                  import openai
                  <br />
                  openai.api_base = "https://api.codexapi.dev/v1"
                  <br />
                  openai.api_key = "your-api-key"
                  <br />
                  <br />
                  response = openai.ChatCompletion.create(
                  <br />
                  &nbsp;&nbsp;model="gpt-5",
                  <br />
                  &nbsp;&nbsp;messages=[{'"role": "user", "content": "Hello!"'}]
                  <br />)
                </code>
              </div>
            </div>

            <Button className="w-full shadow-lg hover:shadow-xl transition-all duration-200">
              <Copy className="w-4 h-4 mr-2" />
              复制配置
            </Button>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <UsageStats />
      </div>
    </DashboardLayout>
  )
}
