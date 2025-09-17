"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Bell, Shield, Trash2, Save } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

interface UserSettings {
  username: string
  email: string
  emailVerified: boolean
  notifications: {
    email: boolean
    usage: boolean
    billing: boolean
    security: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: number
  }
  preferences: {
    language: string
    timezone: string
    theme: string
  }
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>({
    username: "testuser",
    email: "user@example.com",
    emailVerified: true,
    notifications: {
      email: true,
      usage: true,
      billing: true,
      security: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
    },
    preferences: {
      language: "zh",
      timezone: "Asia/Shanghai",
      theme: "system",
    },
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchUserSettings()
  }, [])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch("/api/user/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch user settings:", error)
      toast({
        title: "获取设置失败",
        description: "无法加载用户设置，使用默认值",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "设置已保存",
        description: "您的设置已成功更新",
      })
    } catch (error) {
      console.error("[v0] Failed to save settings:", error)
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    toast({
      title: "删除账户",
      description: "此功能暂未开放，请联系客服",
      variant: "destructive",
    })
  }

  const updateNotificationSetting = (key: keyof UserSettings["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  const updateSecuritySetting = (key: keyof UserSettings["security"], value: boolean | number) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value,
      },
    }))
  }

  const updatePreferenceSetting = (key: keyof UserSettings["preferences"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6" />
            <h1 className="text-3xl font-bold">账户设置</h1>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "保存中..." : "保存设置"}
          </Button>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>个人信息</span>
            </CardTitle>
            <CardDescription>管理您的个人资料信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  value={settings.username}
                  onChange={(e) => setSettings((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱地址</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  {settings.emailVerified ? (
                    <Badge variant="default">已验证</Badge>
                  ) : (
                    <Badge variant="secondary">未验证</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>通知设置</span>
            </CardTitle>
            <CardDescription>管理您希望接收的通知类型</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>邮件通知</Label>
                  <p className="text-sm text-muted-foreground">接收重要的邮件通知</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateNotificationSetting("email", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>使用量提醒</Label>
                  <p className="text-sm text-muted-foreground">当使用量接近限制时通知</p>
                </div>
                <Switch
                  checked={settings.notifications.usage}
                  onCheckedChange={(checked) => updateNotificationSetting("usage", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>账单提醒</Label>
                  <p className="text-sm text-muted-foreground">账单和付款相关通知</p>
                </div>
                <Switch
                  checked={settings.notifications.billing}
                  onCheckedChange={(checked) => updateNotificationSetting("billing", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>安全提醒</Label>
                  <p className="text-sm text-muted-foreground">账户安全相关通知</p>
                </div>
                <Switch
                  checked={settings.notifications.security}
                  onCheckedChange={(checked) => updateNotificationSetting("security", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>安全设置</span>
            </CardTitle>
            <CardDescription>管理您的账户安全选项</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>双因素认证</Label>
                  <p className="text-sm text-muted-foreground">为您的账户添加额外的安全层</p>
                </div>
                <Switch
                  checked={settings.security.twoFactor}
                  onCheckedChange={(checked) => updateSecuritySetting("twoFactor", checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">会话超时 (分钟)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSecuritySetting("sessionTimeout", Number.parseInt(e.target.value) || 30)}
                  className="w-32"
                />
                <p className="text-sm text-muted-foreground">设置自动登出的时间间隔</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>偏好设置</CardTitle>
            <CardDescription>自定义您的使用体验</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">语言</Label>
                <select
                  id="language"
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.preferences.language}
                  onChange={(e) => updatePreferenceSetting("language", e.target.value)}
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">时区</Label>
                <select
                  id="timezone"
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.preferences.timezone}
                  onChange={(e) => updatePreferenceSetting("timezone", e.target.value)}
                >
                  <option value="Asia/Shanghai">Asia/Shanghai</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">主题</Label>
                <select
                  id="theme"
                  className="w-full p-2 border rounded-md bg-background"
                  value={settings.preferences.theme}
                  onChange={(e) => updatePreferenceSetting("theme", e.target.value)}
                >
                  <option value="system">跟随系统</option>
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>更新您的登录密码</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">当前密码</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input id="newPassword" type="password" />
              </div>
            </div>
            <Button variant="outline">更新密码</Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">危险操作</CardTitle>
            <CardDescription>这些操作不可逆转，请谨慎操作</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                <div>
                  <h4 className="font-medium text-destructive">删除账户</h4>
                  <p className="text-sm text-muted-foreground">永久删除您的账户和所有相关数据</p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除账户
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
