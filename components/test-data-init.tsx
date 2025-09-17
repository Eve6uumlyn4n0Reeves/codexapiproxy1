"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TestDataInit() {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const { toast } = useToast()

  const initTestData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/init-test-data", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setInitialized(true)
        toast({
          title: "✅ 测试数据初始化成功",
          description: "您现在可以使用测试账户登录了",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "❌ 初始化失败",
        description: "请检查控制台错误信息",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          测试数据初始化
        </CardTitle>
        <CardDescription>初始化测试用户数据，用于开发和演示</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!initialized ? (
          <Button onClick={initTestData} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                正在初始化...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                初始化测试数据
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="text-center text-green-600 font-medium">✅ 测试数据初始化完成！</div>

            <div className="space-y-2">
              <h4 className="font-medium">测试账户信息：</h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">user@test.com</div>
                    <div className="text-sm text-muted-foreground">密码: 123456</div>
                  </div>
                  <Badge variant="secondary">普通用户</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">admin@test.com</div>
                    <div className="text-sm text-muted-foreground">密码: admin123</div>
                  </div>
                  <Badge variant="outline">管理员</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">superadmin@test.com</div>
                    <div className="text-sm text-muted-foreground">密码: superadmin123</div>
                  </div>
                  <Badge>超级管理员</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
