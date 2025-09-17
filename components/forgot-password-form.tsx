"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        toast({
          title: "重置邮件已发送",
          description: "请检查您的邮箱并点击重置链接",
        })
      } else {
        toast({
          title: "发送失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "发送失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">邮件已发送</CardTitle>
          <CardDescription className="text-center">我们已向 {email} 发送了密码重置邮件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            请检查您的邮箱（包括垃圾邮件文件夹）并点击重置链接。
          </p>
          <Button variant="outline" onClick={onBack} className="w-full bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回登录
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>忘记密码</CardTitle>
        <CardDescription>输入您的邮箱地址，我们将发送重置链接</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Button type="submit" disabled={isLoading || !email.trim()} className="w-full">
              {isLoading ? "发送中..." : "发送重置邮件"}
            </Button>
            <Button type="button" variant="outline" onClick={onBack} className="w-full bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回登录
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
