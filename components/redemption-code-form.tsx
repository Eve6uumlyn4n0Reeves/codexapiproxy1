"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RedemptionCodeFormProps {
  onSuccess?: () => void
}

export function RedemptionCodeForm({ onSuccess }: RedemptionCodeFormProps) {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/redeem-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "兑换成功！",
          description: `已成功兑换 ${data.plan.plan_type === "daily" ? "日卡" : data.plan.plan_type === "weekly" ? "周卡" : "月卡"} 套餐，获得 ${data.plan.token_limit.toLocaleString()} tokens`,
        })
        setCode("")
        onSuccess?.()
      } else {
        toast({
          title: "兑换失败",
          description: data.error || "兑换码无效或已过期",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "兑换失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          兑换码
        </CardTitle>
        <CardDescription>输入兑换码获取套餐权益</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">兑换码</Label>
            <Input
              id="code"
              type="text"
              placeholder="请输入兑换码"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={isLoading}
              className="font-mono"
            />
          </div>
          <Button type="submit" disabled={isLoading || !code.trim()} className="w-full">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            兑换
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">可用套餐类型：</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              日卡 - 10,000 tokens
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              周卡 - 100,000 tokens
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              月卡 - 500,000 tokens
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
