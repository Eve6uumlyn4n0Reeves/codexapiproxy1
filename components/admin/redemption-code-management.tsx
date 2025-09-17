"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Gift,
  Plus,
  Search,
  Copy,
  Trash2,
  Download,
  Upload,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface RedemptionCode {
  id: string
  code: string
  plan_type: "daily" | "weekly" | "monthly"
  token_limit: number
  is_used: boolean
  used_by?: string
  used_by_user?: { email: string }
  used_at?: string
  expires_at: string
  created_at: string
  created_by?: string
  created_by_user?: { email: string }
  description?: string
}

interface FormData {
  plan_type: "daily" | "weekly" | "monthly"
  token_limit: number
  expires_days: number
  prefix: string
  description: string
}

interface BatchFormData extends FormData {
  count: number
}

export function RedemptionCodeManagement() {
  const [codes, setCodes] = useState<RedemptionCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [planFilter, setPlanFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBatchCreateDialogOpen, setIsBatchCreateDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [singleForm, setSingleForm] = useState<FormData>({
    plan_type: "daily" as const,
    token_limit: 1000,
    expires_days: 30,
    prefix: "",
    description: "",
  })

  const [batchForm, setBatchForm] = useState<BatchFormData>({
    count: 10,
    plan_type: "daily" as const,
    token_limit: 1000,
    expires_days: 30,
    prefix: "",
    description: "",
  })

  const fetchCodes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (planFilter !== "all") params.append("plan_type", planFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/admin/redemption-codes?${params}`)
      if (!response.ok) {
        throw new Error("获取兑换码失败")
      }

      const data = await response.json()
      setCodes(data.codes || [])
    } catch (error) {
      console.error("获取兑换码失败:", error)
      toast({
        title: "获取失败",
        description: "获取兑换码列表失败",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
  }, [statusFilter, planFilter, searchTerm])

  const handleCreateSingleCode = async () => {
    try {
      setActionLoading(true)
      const response = await fetch("/api/admin/redemption-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "single",
          ...singleForm,
        }),
      })

      if (!response.ok) {
        throw new Error("创建兑换码失败")
      }

      const data = await response.json()
      setIsCreateDialogOpen(false)
      setSingleForm({
        plan_type: "daily",
        token_limit: 1000,
        expires_days: 30,
        prefix: "",
        description: "",
      })

      toast({
        title: "创建成功",
        description: `兑换码 ${data.code.code} 已创建`,
      })

      fetchCodes()
    } catch (error) {
      console.error("创建兑换码失败:", error)
      toast({
        title: "创建失败",
        description: "创建兑换码时发生错误",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleBatchCreate = async () => {
    try {
      setActionLoading(true)
      const response = await fetch("/api/admin/redemption-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "batch",
          ...batchForm,
        }),
      })

      if (!response.ok) {
        throw new Error("批量创建兑换码失败")
      }

      const data = await response.json()
      setIsBatchCreateDialogOpen(false)
      setBatchForm({
        count: 10,
        plan_type: "daily",
        token_limit: 1000,
        expires_days: 30,
        prefix: "",
        description: "",
      })

      toast({
        title: "批量创建成功",
        description: `已创建 ${data.count} 个兑换码`,
      })

      fetchCodes()
    } catch (error) {
      console.error("批量创建兑换码失败:", error)
      toast({
        title: "批量创建失败",
        description: "批量创建兑换码时发生错误",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/redemption-codes/${codeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("删除兑换码失败")
      }

      toast({
        title: "删除成功",
        description: "兑换码已从系统中删除",
      })

      fetchCodes()
    } catch (error) {
      console.error("删除兑换码失败:", error)
      toast({
        title: "删除失败",
        description: "删除兑换码时发生错误",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "复制成功",
      description: "兑换码已复制到剪贴板",
    })
  }

  const handleExportCodes = () => {
    const csvContent = [
      ["兑换码", "套餐类型", "Token限制", "状态", "使用者", "创建时间", "过期时间", "描述"].join(","),
      ...codes.map((code) =>
        [
          code.code,
          code.plan_type,
          code.token_limit,
          code.is_used ? "已使用" : "未使用",
          code.used_by_user?.email || "",
          new Date(code.created_at).toLocaleDateString(),
          new Date(code.expires_at).toLocaleDateString(),
          code.description || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `redemption-codes-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const getPlanBadge = (planType: string) => {
    const variants = {
      daily: "default",
      weekly: "secondary",
      monthly: "destructive",
    } as const

    const labels = {
      daily: "日套餐",
      weekly: "周套餐",
      monthly: "月套餐",
    }

    return (
      <Badge variant={variants[planType as keyof typeof variants]}>{labels[planType as keyof typeof labels]}</Badge>
    )
  }

  const getStatusBadge = (isUsed: boolean) => {
    return isUsed ? (
      <Badge variant="secondary" className="text-green-600">
        <CheckCircle className="w-3 h-3 mr-1" />
        已使用
      </Badge>
    ) : (
      <Badge variant="outline">
        <XCircle className="w-3 h-3 mr-1" />
        未使用
      </Badge>
    )
  }

  const stats = {
    total: codes.length,
    used: codes.filter((c) => c.is_used).length,
    unused: codes.filter((c) => !c.is_used).length,
    expired: codes.filter((c) => new Date(c.expires_at) < new Date()).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">兑换码管理</h1>
          <p className="text-muted-foreground">创建和管理系统兑换码</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportCodes}>
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Dialog open={isBatchCreateDialogOpen} onOpenChange={setIsBatchCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                批量创建
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>批量创建兑换码</DialogTitle>
                <DialogDescription>一次性创建多个兑换码</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="count">创建数量</Label>
                    <Input
                      id="count"
                      type="number"
                      value={batchForm.count}
                      onChange={(e) => setBatchForm({ ...batchForm, count: Number.parseInt(e.target.value) || 1 })}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expires_days">有效期(天)</Label>
                    <Input
                      id="expires_days"
                      type="number"
                      value={batchForm.expires_days}
                      onChange={(e) =>
                        setBatchForm({ ...batchForm, expires_days: Number.parseInt(e.target.value) || 30 })
                      }
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="batch_plan_type">套餐类型</Label>
                  <Select
                    value={batchForm.plan_type}
                    onValueChange={(value: "daily" | "weekly" | "monthly") =>
                      setBatchForm({ ...batchForm, plan_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">日套餐</SelectItem>
                      <SelectItem value="weekly">周套餐</SelectItem>
                      <SelectItem value="monthly">月套餐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="batch_token_limit">Token限制</Label>
                  <Input
                    id="batch_token_limit"
                    type="number"
                    value={batchForm.token_limit}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, token_limit: Number.parseInt(e.target.value) || 1000 })
                    }
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="batch_prefix">前缀(可选)</Label>
                  <Input
                    id="batch_prefix"
                    value={batchForm.prefix}
                    onChange={(e) => setBatchForm({ ...batchForm, prefix: e.target.value })}
                    placeholder="例如: PROMO"
                  />
                </div>
                <div>
                  <Label htmlFor="batch_description">描述(可选)</Label>
                  <Textarea
                    id="batch_description"
                    value={batchForm.description}
                    onChange={(e) => setBatchForm({ ...batchForm, description: e.target.value })}
                    placeholder="兑换码用途描述"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBatchCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleBatchCreate} disabled={actionLoading}>
                  {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  创建 {batchForm.count} 个兑换码
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                创建兑换码
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新兑换码</DialogTitle>
                <DialogDescription>创建单个兑换码</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plan_type">套餐类型</Label>
                  <Select
                    value={singleForm.plan_type}
                    onValueChange={(value: "daily" | "weekly" | "monthly") =>
                      setSingleForm({ ...singleForm, plan_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">日套餐</SelectItem>
                      <SelectItem value="weekly">周套餐</SelectItem>
                      <SelectItem value="monthly">月套餐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="token_limit">Token限制</Label>
                  <Input
                    id="token_limit"
                    type="number"
                    value={singleForm.token_limit}
                    onChange={(e) =>
                      setSingleForm({ ...singleForm, token_limit: Number.parseInt(e.target.value) || 1000 })
                    }
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="expires_days">有效期(天)</Label>
                  <Input
                    id="expires_days"
                    type="number"
                    value={singleForm.expires_days}
                    onChange={(e) =>
                      setSingleForm({ ...singleForm, expires_days: Number.parseInt(e.target.value) || 30 })
                    }
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="prefix">前缀(可选)</Label>
                  <Input
                    id="prefix"
                    value={singleForm.prefix}
                    onChange={(e) => setSingleForm({ ...singleForm, prefix: e.target.value })}
                    placeholder="例如: PROMO"
                  />
                </div>
                <div>
                  <Label htmlFor="description">描述(可选)</Label>
                  <Textarea
                    id="description"
                    value={singleForm.description}
                    onChange={(e) => setSingleForm({ ...singleForm, description: e.target.value })}
                    placeholder="兑换码用途描述"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateSingleCode} disabled={actionLoading}>
                  {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  创建兑换码
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总兑换码</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已使用</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.used}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未使用</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.unused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已过期</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索和过滤</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索兑换码或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="used">已使用</SelectItem>
                <SelectItem value="unused">未使用</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="套餐筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有套餐</SelectItem>
                <SelectItem value="daily">日套餐</SelectItem>
                <SelectItem value="weekly">周套餐</SelectItem>
                <SelectItem value="monthly">月套餐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 兑换码列表 */}
      <Card>
        <CardHeader>
          <CardTitle>兑换码列表</CardTitle>
          <CardDescription>共 {codes.length} 个兑换码</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>兑换码</TableHead>
                <TableHead>套餐类型</TableHead>
                <TableHead>Token限制</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>使用者</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>过期时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{code.code}</code>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyCode(code.code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    {code.description && <div className="text-xs text-muted-foreground mt-1">{code.description}</div>}
                  </TableCell>
                  <TableCell>{getPlanBadge(code.plan_type)}</TableCell>
                  <TableCell>{code.token_limit.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(code.is_used)}</TableCell>
                  <TableCell>
                    {code.used_by_user?.email ? (
                      <div>
                        <div className="font-medium">{code.used_by_user.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {code.used_at && new Date(code.used_at).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(code.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={new Date(code.expires_at) < new Date() ? "text-red-600" : ""}>
                      {new Date(code.expires_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除兑换码</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作将永久删除兑换码 {code.code}，无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCode(code.id)}
                            className="bg-destructive text-destructive-foreground"
                            disabled={actionLoading}
                          >
                            {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
