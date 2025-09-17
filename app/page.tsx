"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Shield, ArrowRight, Code, BarChart3, Sparkles } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { TestDataInit } from "@/components/test-data-init"

export default function HomePage() {
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CodexAPI
              </span>
              <span className="text-xs text-muted-foreground font-medium">AI API 中转服务</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={() => setAuthModal("login")}
              className="hover:bg-accent/50 transition-all duration-200"
            >
              登录
            </Button>
            <Button
              onClick={() => setAuthModal("register")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              免费注册
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto text-center max-w-5xl relative">
          <Badge
            variant="secondary"
            className="mb-8 px-6 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200/50 dark:border-blue-800/50"
          >
            <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              GPT-5 API 中转服务
            </span>
          </Badge>

          <h1 className="text-6xl md:text-7xl font-bold mb-8 text-balance leading-tight">
            专业的{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-gradient">
              GPT-5 API
            </span>{" "}
            中转平台
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground/80 mb-12 text-pretty max-w-3xl mx-auto leading-relaxed font-medium">
            稳定、安全、高效的 OpenAI GPT-5 API 代理服务
            <br />
            <span className="text-lg text-muted-foreground/60">支持多种套餐选择，按需付费，开箱即用</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => setAuthModal("register")}
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0"
            >
              立即开始 <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 border-border/50 hover:border-border hover:shadow-lg"
            >
              查看文档
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>99.9% 可用性</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>企业级安全</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>毫秒级响应</span>
            </div>
          </div>
        </div>
      </section>

      {/* Test Data Initialization Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-muted/30 to-muted/10 border-y border-border/40">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 px-3 py-1">
              <Code className="w-3 h-3 mr-2" />
              开发测试
            </Badge>
            <h3 className="text-3xl font-bold mb-3">快速体验</h3>
            <p className="text-muted-foreground text-lg">初始化测试账户数据，立即体验完整功能</p>
          </div>
          <TestDataInit />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">为什么选择 CodexAPI？</h2>
            <p className="text-xl text-muted-foreground">专业级的API服务，为开发者量身定制</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">安全可靠</CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground/80">
                  企业级安全防护，数据加密传输，API密钥安全管理，确保您的数据安全无忧
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">高速稳定</CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground/80">
                  全球CDN加速，99.9%可用性保证，毫秒级响应时间，让您的应用飞速运行
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">实时监控</CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground/80">
                  详细的使用统计，实时监控面板，透明的计费系统，让您随时掌控使用情况
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">选择适合您的套餐</h2>
            <p className="text-xl text-muted-foreground">灵活的定价方案，满足不同需求</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <Badge className="w-fit mb-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                  日卡
                </Badge>
                <CardTitle className="text-2xl mb-2">基础版</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    ¥9.9
                  </span>
                  <span className="text-lg font-normal text-muted-foreground">/天</span>
                </div>
                <CardDescription className="text-base">适合轻度使用和测试</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">每日 10,000 tokens</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">标准 RPM 限制</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">基础技术支持</span>
                  </li>
                </ul>
                <Button
                  className="w-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  onClick={() => setAuthModal("register")}
                >
                  选择套餐
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-blue-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-background to-blue-50/50 dark:to-blue-950/50">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 shadow-lg border-2 border-background">
                  <Sparkles className="w-3 h-3 mr-1" />
                  推荐
                </Badge>
              </div>
              <CardHeader className="pb-6 pt-8">
                <Badge className="w-fit mb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
                  周卡
                </Badge>
                <CardTitle className="text-2xl mb-2">专业版</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    ¥59.9
                  </span>
                  <span className="text-lg font-normal text-muted-foreground">/周</span>
                </div>
                <CardDescription className="text-base">最受欢迎的选择</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">每日 50,000 tokens</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">高级 RPM 限制</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">优先技术支持</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">使用统计分析</span>
                  </li>
                </ul>
                <Button
                  className="w-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={() => setAuthModal("register")}
                >
                  选择套餐
                </Button>
              </CardContent>
            </Card>

            <Card className="relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <Badge className="w-fit mb-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
                  月卡
                </Badge>
                <CardTitle className="text-2xl mb-2">企业版</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                    ¥199.9
                  </span>
                  <span className="text-lg font-normal text-muted-foreground">/月</span>
                </div>
                <CardDescription className="text-base">大量使用首选</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">每日 200,000 tokens</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">最高 RPM 限制</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">专属技术支持</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm">高级分析报告</span>
                  </li>
                </ul>
                <Button
                  className="w-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  onClick={() => setAuthModal("register")}
                >
                  选择套餐
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground text-lg">所有套餐均支持补充包购买，按实际使用的 Token 数量计费</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-16 px-4 bg-gradient-to-t from-muted/30 to-background">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              CodexAPI
            </span>
          </div>
          <p className="text-muted-foreground text-lg mb-4">专业的 GPT-5 API 中转服务</p>
          <p className="text-sm text-muted-foreground">© 2024 CodexAPI. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitchMode={(mode) => setAuthModal(mode)} />
      )}
    </div>
  )
}
