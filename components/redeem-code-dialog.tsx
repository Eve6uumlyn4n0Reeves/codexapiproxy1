"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Gift, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface RedeemCodeDialogProps {
  onSuccess?: () => void
}

interface RedeemResponse {
  message: string
  error?: string
}

export function RedeemCodeDialog({ onSuccess }: RedeemCodeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast({
        title: "请输入兑换码",
        description: "兑换码不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/user/redeem-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      })

      const data: RedeemResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "兑换失败")
      }

      toast({
        title: "兑换成功！",
        description: data.message,
      })

      setCode("")
      setIsOpen(false)
      onSuccess?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "兑换码无效或已过期"
      toast({
        title: "兑换失败",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleRedeem()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent">
          <Gift className="w-4 h-4 mr-2" />
          兑换码
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>兑换码</DialogTitle>
          <DialogDescription>输入兑换码来获取或延长您的套餐</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">兑换码</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="输入兑换码，例如：DAILY-ABC12345"
              className="font-mono"
              disabled={loading}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>• 兑换码不区分大小写</p>
            <p>• 如果您已有相同类型的套餐，将会延长有效期</p>
            <p>• 每个兑换码只能使用一次</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleRedeem} disabled={loading || !code.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            兑换
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
