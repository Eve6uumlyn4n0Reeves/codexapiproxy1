"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Clock, DollarSign } from "lucide-react"
import { UsageChart } from "@/components/usage-chart"

interface UsageData {
  usage: {
    totalRequests: number
    totalTokens: number
    totalCost: number
    dailyTokens: number
  }
  limits: {
    requestsRemaining: number
    tokensRemaining: number
    resetTime: number
    tokenResetTime: number
  }
  plan: {
    type: string | null
    tokenLimit: number
    tokensUsed: number
    tokensRemaining: number
    expiresAt: Date | null
  }
  history: Array<{
    model: string
    total_tokens: number
    cost: number
    created_at: string
    success: boolean
  }>
}

export function UsageStats() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      const response = await fetch("/api/user/usage")
      if (response.ok) {
        const usageData = await response.json()
        setData(usageData)
      } else if (response.status === 401) {
        // 用户未登录，显示空状态
        setData(null)
      }
    } catch (error) {
      console.error("获取使用统计失败:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">请先登录以查看使用统计</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 处理历史数据用于图表
  const processHistoryForChart = (history: UsageData["history"]) => {
    const last24Hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date()
      hour.setHours(hour.getHours() - (23 - i), 0, 0, 0)
      return {
        name: `${hour.getHours()}:00`,
        value: 0,
        tokens: 0,
        cost: 0,
      }
    })

    history.forEach((record) => {
      const recordDate = new Date(record.created_at)
      const hourIndex = recordDate.getHours()
      const chartIndex = last24Hours.findIndex((item) => Number.parseInt(item.name.split(":")[0]) === hourIndex)

      if (chartIndex !== -1) {
        last24Hours[chartIndex].value += 1
        last24Hours[chartIndex].tokens += record.total_tokens
        last24Hours[chartIndex].cost += record.cost
      }
    })

    return last24Hours
  }

  const chartData = processHistoryForChart(data.history)

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总请求数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.usage.totalRequests.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总Token数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.usage.totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总费用</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.usage.totalCost.toFixed(6)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日使用</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.usage.dailyTokens.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsageChart
          title="24小时趋势"
          description="过去24小时的API使用情况"
          data={chartData}
          type="line"
          dataKey="value"
        />

        <UsageChart
          title="Token使用趋势"
          description="过去24小时的Token使用情况"
          data={chartData}
          type="bar"
          dataKey="tokens"
        />
      </div>

      {/* Usage Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>请求限制</CardTitle>
            <CardDescription>剩余请求数: {data.limits.requestsRemaining}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={Math.max(0, 100 - (data.limits.requestsRemaining / 60) * 100)} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              重置时间: {new Date(data.limits.resetTime).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        {data.plan.type && (
          <Card>
            <CardHeader>
              <CardTitle>套餐使用情况</CardTitle>
              <CardDescription>
                {data.plan.type} - 已使用 {data.plan.tokensUsed.toLocaleString()} /{" "}
                {data.plan.tokenLimit.toLocaleString()} tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(data.plan.tokensUsed / data.plan.tokenLimit) * 100} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                剩余 {data.plan.tokensRemaining.toLocaleString()} tokens
                {data.plan.expiresAt && ` • 过期时间: ${new Date(data.plan.expiresAt).toLocaleDateString()}`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Usage History */}
      {data.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>最近使用记录</CardTitle>
            <CardDescription>最近的API调用记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.history.slice(0, 10).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{record.model}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        record.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.success ? "成功" : "失败"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {record.total_tokens} tokens • ${record.cost.toFixed(6)} •{" "}
                    {new Date(record.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
