"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, EyeOff, Plus, Trash2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface ApiKey {
  id: string
  name: string
  key?: string // 只在创建时返回
  is_active: boolean
  created_at: string
  last_used_at?: string
  expires_at?: string
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const response = await fetch("/api/user/api-keys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      } else if (response.status === 401) {
        toast({
          title: "请先登录",
          description: "您需要登录才能查看API密钥",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载API密钥列表",
        variant: "destructive",
      })
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "请输入API密钥名称",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setApiKeys((prev) => [...prev, data.apiKey])
        setNewlyCreatedKey(data.apiKey.key) // 保存新创建的密钥用于显示
        setNewKeyName("")
        setCreateDialogOpen(false)

        toast({
          title: "API密钥创建成功",
          description: "请妥善保存您的API密钥，它只会显示一次",
        })
      } else {
        toast({
          title: "创建失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "创建失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch("/api/user/api-keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyId: id }),
      })

      if (response.ok) {
        setApiKeys((prev) => prev.filter((key) => key.id !== id))
        toast({
          title: "API密钥已删除",
        })
      } else {
        const data = await response.json()
        toast({
          title: "删除失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "已复制到剪贴板",
    })
  }

  const toggleKeyVisibility = (id: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return key
    return key.substring(0, 8) + "..." + key.substring(key.length - 5)
  }

  return (
    <div className="space-y-4">
      {/* 新创建的密钥显示 */}
      {newlyCreatedKey && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800">新创建的API密钥</h4>
              <p className="text-sm text-green-700">请立即复制并保存，此密钥只会显示一次：</p>
              <div className="flex items-center space-x-2">
                <Input value={newlyCreatedKey} readOnly className="font-mono text-sm bg-white" />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(newlyCreatedKey)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setNewlyCreatedKey(null)}>
                  关闭
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">API 密钥管理</h3>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                创建新密钥
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新的API密钥</DialogTitle>
                <DialogDescription>为您的API密钥输入一个描述性名称</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">密钥名称</Label>
                  <Input
                    id="keyName"
                    placeholder="例如：生产环境密钥"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={createApiKey} disabled={loading}>
                    {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                    创建
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          {apiKeys.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">暂无API密钥</p>
                <p className="text-sm text-muted-foreground mt-1">点击上方按钮创建您的第一个API密钥</p>
              </CardContent>
            </Card>
          ) : (
            apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <Badge variant={apiKey.is_active ? "default" : "secondary"} className="text-xs">
                          {apiKey.is_active ? "活跃" : "已禁用"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="font-mono">
                          {apiKey.key ? (showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)) : "ck-****...****"}
                        </span>
                        {apiKey.key && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                              {showKeys[apiKey.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key!)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        创建于 {new Date(apiKey.created_at).toLocaleDateString()}{" "}
                        {apiKey.last_used_at && `• 最后使用 ${new Date(apiKey.last_used_at).toLocaleDateString()}`}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除API密钥</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作将永久删除API密钥 "{apiKey.name}"，无法撤销。使用此密钥的应用将无法继续访问API。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteApiKey(apiKey.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
