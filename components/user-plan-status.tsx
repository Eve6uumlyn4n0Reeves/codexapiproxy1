"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Zap } from "lucide-react"
import type { UserPlan } from "@/lib/database"

interface UserPlanStatusProps {
  refreshTrigger?: number
}

export function UserPlanStatus({ refreshTrigger }: UserPlanStatusProps) {
  const [plan, setPlan] = useState<UserPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlanStatus()
  }, [refreshTrigger])

  const fetchPlanStatus = async () => {
    try {
      const response = await fetch("/api/user/plan")
      if (response.ok) {
        const data = await response.json()
        setPlan(data.plan)
      }
    } catch (error) {
      console.error("获取套餐状态失败:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>套餐状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>套餐状态</CardTitle>
          <CardDescription>暂无活跃套餐</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">请使用兑换码激活套餐</p>
        </CardContent>
      </Card>
    )
  }

  const planTypeMap = {
    daily: { label: "日卡", color: "bg-orange-600" },
    weekly: { label: "周卡", color: "bg-blue-600" },
    monthly: { label: "月卡", color: "bg-purple-600" },
  }

  const planInfo = planTypeMap[plan.plan_type]
  const usagePercentage = (plan.tokens_used / plan.token_limit) * 100
  const remainingTokens = plan.token_limit - plan.tokens_used
  const expiresAt = new Date(plan.expires_at)
  const now = new Date()
  const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime())
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          当前套餐
        </CardTitle>
        <CardDescription>
          <Badge className={`${planInfo.color} text-white`}>{planInfo.label}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Token 使用量</span>
            <span>
              {plan.tokens_used.toLocaleString()} / {plan.token_limit.toLocaleString()}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">剩余 {remainingTokens.toLocaleString()} tokens</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">开始时间</p>
              <p className="text-muted-foreground">{new Date(plan.starts_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">剩余时间</p>
              <p className="text-muted-foreground">{daysRemaining > 0 ? `${daysRemaining} 天` : "已过期"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
