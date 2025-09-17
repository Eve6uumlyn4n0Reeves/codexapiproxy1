"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Download, DollarSign, TrendingUp, Package } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { RedeemCodeDialog } from "@/components/redeem-code-dialog"
import { UserPlanStatus } from "@/components/user-plan-status"

interface BillingData {
  currentPlan: string
  billingCycle: string
  nextBillingDate: string
  currentUsage: number
  planLimit: number
  totalSpent: number
  balance: number
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: "paid" | "pending" | "failed"
  description: string
}

export default function BillingPage() {
  const { toast } = useToast()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [billingData] = useState<BillingData>({
    currentPlan: "免费账户",
    billingCycle: "月付",
    nextBillingDate: "2024-02-15",
    currentUsage: 0,
    planLimit: 10000,
    totalSpent: 0,
    balance: 5.0,
  })

  const [invoices] = useState<Invoice[]>([
    {
      id: "INV-001",
      date: "2024-01-15",
      amount: 0,
      status: "paid",
      description: "免费账户 - 无费用",
    },
  ])

  const plans = [
    {
      name: "基础版",
      price: 9.9,
      period: "天",
      tokens: 10000,
      features: ["每日 10,000 tokens", "标准 RPM 限制", "基础技术支持"],
      current: true,
    },
    {
      name: "专业版",
      price: 59.9,
      period: "周",
      tokens: 50000,
      features: ["每日 50,000 tokens", "高级 RPM 限制", "优先技术支持", "使用统计分析"],
      popular: true,
    },
    {
      name: "企业版",
      price: 199.9,
      period: "月",
      tokens: 200000,
      features: ["每日 200,000 tokens", "最高 RPM 限制", "专属技术支持", "高级分析报告"],
    },
  ]

  const handleUpgrade = (planName: string) => {
    toast({
      title: "套餐获取方式",
      description: "请使用兑换码获取套餐，暂不支持在线支付",
    })
  }

  const handleRedemptionSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    toast({
      title: "套餐更新成功",
      description: "您的套餐信息已更新，请查看当前状态",
    })
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    // Placeholder for download invoice logic
    console.log(`Downloading invoice ${invoiceId}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <CreditCard className="w-6 h-6" />
          <h1 className="text-3xl font-bold">账单管理</h1>
        </div>

        {/* Updated Redemption Code and Plan Status Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>兑换码</CardTitle>
              <CardDescription>使用兑换码获取或延长您的套餐</CardDescription>
            </CardHeader>
            <CardContent>
              <RedeemCodeDialog onSuccess={handleRedemptionSuccess} />
            </CardContent>
          </Card>
          <UserPlanStatus refreshTrigger={refreshTrigger} />
        </div>

        {/* Current Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">当前套餐</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billingData.currentPlan}</div>
              <p className="text-xs text-muted-foreground">{billingData.billingCycle}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">账户余额</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${billingData.balance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">可用余额</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月消费</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${billingData.totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">总消费金额</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>下次账单</CardTitle>
              <CardDescription>账单日期</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billingData.nextBillingDate}</div>
              <p className="text-xs text-muted-foreground">账单日期</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        <Card>
          <CardHeader>
            <CardTitle>使用情况</CardTitle>
            <CardDescription>
              本月已使用 {billingData.currentUsage.toLocaleString()} / {billingData.planLimit.toLocaleString()} tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(billingData.currentUsage / billingData.planLimit) * 100} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              剩余 {(billingData.planLimit - billingData.currentUsage).toLocaleString()} tokens
            </p>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>套餐选择</CardTitle>
            <CardDescription>使用兑换码获取以下套餐</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative border rounded-lg p-6 ${plan.popular ? "border-primary" : "border-border"}`}
                >
                  {plan.popular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">推荐</Badge>}
                  {plan.current && (
                    <Badge variant="secondary" className="absolute -top-2 left-1/2 -translate-x-1/2">
                      当前套餐
                    </Badge>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="text-3xl font-bold mt-2">
                      ¥{plan.price}
                      <span className="text-sm font-normal">/{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">每日 {plan.tokens.toLocaleString()} tokens</p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.current ? "secondary" : "outline"}
                    disabled={plan.current}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.current ? "当前套餐" : "使用兑换码获取"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>账单历史</CardTitle>
            <CardDescription>查看您的账单记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{invoice.id}</span>
                      <Badge
                        variant={
                          invoice.status === "paid"
                            ? "default"
                            : invoice.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {invoice.status === "paid" ? "已支付" : invoice.status === "pending" ? "待支付" : "支付失败"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">${invoice.amount.toFixed(2)}</span>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
