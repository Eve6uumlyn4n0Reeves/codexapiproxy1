"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Download,
  Calendar,
  Activity,
  Zap,
  Target,
  AlertTriangle,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UsageStats } from "@/components/usage-stats"
import { useToast } from "@/hooks/use-toast"

interface UsageData {
  period: string
  totalRequests: number
  totalTokens: number
  totalCost: number
  avgResponseTime: number
  successRate: number
  topModels: Array<{
    model: string
    requests: number
    tokens: number
    cost: number
  }>
  hourlyUsage: Array<{
    hour: string
    requests: number
    tokens: number
  }>
  dailyUsage: Array<{
    date: string
    requests: number
    tokens: number
    cost: number
  }>
}

interface QuotaInfo {
  dailyLimit: number
  dailyUsed: number
  monthlyLimit: number
  monthlyUsed: number
  resetTime: string
}

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsageData()
  }, [timeRange])

  const fetchUsageData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/user/usage?timeRange=${timeRange}`)

      if (!response.ok) {
        throw new Error("Failed to fetch usage data")
      }

      const data = await response.json()
      setUsageData(data.usage)
      setQuotaInfo(data.quota)
    } catch (error) {
      console.error("[v0] Failed to fetch usage data:", error)

      // 如果API调用失败，使用模拟数据作为后备
      const mockData: UsageData = {
        period: timeRange,
        totalRequests: timeRange === "24h" ? 156 : timeRange === "7d" ? 1234 : 5678,
        totalTokens: timeRange === "24h" ? 12500 : timeRange === "7d" ? 89000 : 345000,
        totalCost: timeRange === "24h" ? 2.45 : timeRange === "7d" ? 18.9 : 78.5,
        avgResponseTime: 850,
        successRate: 99.2,
        topModels: [
          { model: "gpt-5", requests: 89, tokens: 7800, cost: 1.56 },
          { model: "gpt-4", requests: 45, tokens: 3200, cost: 0.64 },
          { model: "gpt-3.5-turbo", requests: 22, tokens: 1500, cost: 0.25 },
        ],
        hourlyUsage: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, "0")}:00`,
          requests: Math.floor(Math.random() * 20) + 5,
          tokens: Math.floor(Math.random() * 2000) + 500,
        })),
        dailyUsage: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          requests: Math.floor(Math.random() * 200) + 100,
          tokens: Math.floor(Math.random() * 15000) + 5000,
          cost: Math.floor(Math.random() * 500) + 200,
        })).reverse(),
      }

      const mockQuota: QuotaInfo = {
        dailyLimit: 10000,
        dailyUsed: 3250,
        monthlyLimit: 300000,
        monthlyUsed: 89000,
        resetTime: "2024-02-15T00:00:00Z",
      }

      setUsageData(mockData)
      setQuotaInfo(mockQuota)

      toast({
        title: "使用模拟数据",
        description: "无法连接到服务器，显示模拟数据",
        variant: "default",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = () => {
    if (!usageData) return

    const csvData = [
      ["日期", "请求数", "Token数", "费用"],
      ...usageData.dailyUsage.map((day) => [
        day.date,
        day.requests.toString(),
        day.tokens.toString(),
        (day.cost / 100).toFixed(2),
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `usage-data-${timeRange}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "导出成功",
      description: "使用数据已导出到CSV文件",
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Activity className="w-8 h-8 animate-pulse text-primary" />
            <p className="text-muted-foreground">加载使用统计中...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6" />
            <h1 className="text-3xl font-bold">使用统计</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">最近24小时</SelectItem>
                <SelectItem value="7d">最近7天</SelectItem>
                <SelectItem value="30d">最近30天</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </Button>
          </div>
        </div>

        {/* Quota Overview */}
        {quotaInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span>日配额使用情况</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">已使用</span>
                    <span className="font-semibold">
                      {quotaInfo.dailyUsed.toLocaleString()} / {quotaInfo.dailyLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(quotaInfo.dailyUsed / quotaInfo.dailyLimit) * 100} className="h-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      剩余: {(quotaInfo.dailyLimit - quotaInfo.dailyUsed).toLocaleString()} tokens
                    </span>
                    <Badge variant={quotaInfo.dailyUsed / quotaInfo.dailyLimit > 0.8 ? "destructive" : "secondary"}>
                      {((quotaInfo.dailyUsed / quotaInfo.dailyLimit) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span>月配额使用情况</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">已使用</span>
                    <span className="font-semibold">
                      {quotaInfo.monthlyUsed.toLocaleString()} / {quotaInfo.monthlyLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(quotaInfo.monthlyUsed / quotaInfo.monthlyLimit) * 100} className="h-2" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      剩余: {(quotaInfo.monthlyLimit - quotaInfo.monthlyUsed).toLocaleString()} tokens
                    </span>
                    <Badge variant="secondary">
                      {((quotaInfo.monthlyUsed / quotaInfo.monthlyLimit) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Key Metrics */}
        {usageData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-4 translate-x-4"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">总请求数</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {usageData.totalRequests.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  较上期增长 12%
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-4 translate-x-4"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">总Token数</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {usageData.totalTokens.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  较上期增长 8%
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-full -translate-y-4 translate-x-4"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">总费用</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  ${usageData.totalCost.toFixed(2)}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                  较上期减少 3%
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -translate-y-4 translate-x-4"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">平均响应时间</CardTitle>
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {usageData.avgResponseTime}ms
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Badge variant="secondary" className="text-xs">
                    成功率 {usageData.successRate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Usage Trends Chart */}
        {usageData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>使用趋势</span>
              </CardTitle>
              <CardDescription>
                {timeRange === "24h" ? "过去24小时" : timeRange === "7d" ? "过去7天" : "过去30天"}的使用情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple bar chart representation */}
                <div className="grid grid-cols-7 gap-2 h-32">
                  {usageData.dailyUsage.map((day, index) => {
                    const maxRequests = Math.max(...usageData.dailyUsage.map((d) => d.requests))
                    const height = (day.requests / maxRequests) * 100
                    return (
                      <div key={index} className="flex flex-col items-center space-y-1">
                        <div className="flex-1 flex items-end">
                          <div
                            className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm min-h-[4px]"
                            style={{ height: `${height}%` }}
                            title={`${day.date}: ${day.requests} 请求`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(day.date).getDate()}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-sm" />
                    <span>API 请求数</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Model Usage Breakdown */}
        {usageData && (
          <Card>
            <CardHeader>
              <CardTitle>模型使用分析</CardTitle>
              <CardDescription>不同模型的使用情况和成本分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageData.topModels.map((model, index) => (
                  <div key={model.model} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono">
                          {model.model}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {model.requests} 请求 • {model.tokens.toLocaleString()} tokens
                        </span>
                      </div>
                      <span className="font-semibold">${model.cost.toFixed(2)}</span>
                    </div>
                    <Progress value={(model.requests / usageData.totalRequests) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hourly Usage Pattern */}
        {usageData && timeRange === "24h" && (
          <Card>
            <CardHeader>
              <CardTitle>24小时使用模式</CardTitle>
              <CardDescription>了解您的API使用高峰时段</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-1 h-20">
                {usageData.hourlyUsage.map((hour, index) => {
                  const maxRequests = Math.max(...usageData.hourlyUsage.map((h) => h.requests))
                  const height = (hour.requests / maxRequests) * 100
                  return (
                    <div key={index} className="flex flex-col items-center space-y-1">
                      <div className="flex-1 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm min-h-[2px]"
                          style={{ height: `${height}%` }}
                          title={`${hour.hour}: ${hour.requests} 请求`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{hour.hour.split(":")[0]}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">使用高峰: 14:00-16:00 和 20:00-22:00</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>成本分析</span>
            </CardTitle>
            <CardDescription>详细的费用构成和优化建议</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">费用构成</h4>
                {usageData?.topModels.map((model) => (
                  <div key={model.model} className="flex justify-between items-center">
                    <span className="text-sm">{model.model}</span>
                    <span className="font-medium">${model.cost.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>总计</span>
                  <span>${usageData?.totalCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">优化建议</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">考虑使用更经济的模型</p>
                      <p className="text-muted-foreground">对于简单任务，gpt-3.5-turbo 可节省 60% 成本</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">优化请求频率</p>
                      <p className="text-muted-foreground">在使用高峰期外进行批量处理可获得更好性能</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Original Usage Stats Component */}
        <UsageStats />
      </div>
    </DashboardLayout>
  )
}
