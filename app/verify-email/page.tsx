"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("缺少验证令牌")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.error)
        }
      } catch (error) {
        setStatus("error")
        setMessage("验证失败，请稍后重试")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && <Loader2 className="w-12 h-12 animate-spin text-primary" />}
            {status === "success" && <CheckCircle className="w-12 h-12 text-green-500" />}
            {status === "error" && <XCircle className="w-12 h-12 text-red-500" />}
          </div>
          <CardTitle>
            {status === "loading" && "验证中..."}
            {status === "success" && "验证成功"}
            {status === "error" && "验证失败"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <Button className="w-full" onClick={() => router.push("/")}>
              返回首页登录
            </Button>
          )}
          {status === "error" && (
            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/")}>
              返回首页
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
