"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { logError } from "@/lib/error-handler"

interface EnhancedErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorId?: string
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void; errorId?: string }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class EnhancedErrorBoundary extends React.Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): EnhancedErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorId: this.state.errorId,
    })

    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} errorId={this.state.errorId} />
      }

      return (
        <EnhancedErrorFallback error={this.state.error} resetError={this.resetError} errorId={this.state.errorId} />
      )
    }

    return this.props.children
  }
}

function EnhancedErrorFallback({
  error,
  resetError,
  errorId,
}: { error?: Error; resetError: () => void; errorId?: string }) {
  const [showDetails, setShowDetails] = React.useState(false)

  const handleReportError = () => {
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }

    // 复制错误信息到剪贴板
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert("错误信息已复制到剪贴板，您可以将其发送给技术支持")
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">应用程序出现错误</CardTitle>
          <CardDescription>我们遇到了一个意外错误。请尝试刷新页面或联系技术支持。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorId && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertTitle>错误ID</AlertTitle>
              <AlertDescription>
                <code className="text-xs bg-muted px-2 py-1 rounded">{errorId}</code>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-muted-foreground"
              >
                {showDetails ? "隐藏" : "显示"}技术详情
              </Button>
              {showDetails && (
                <Alert variant="destructive">
                  <AlertTitle>错误详情</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong>错误消息:</strong>
                        <p className="text-sm font-mono bg-muted/50 p-2 rounded mt-1">{error.message}</p>
                      </div>
                      {error.stack && (
                        <div>
                          <strong>堆栈跟踪:</strong>
                          <pre className="text-xs font-mono bg-muted/50 p-2 rounded mt-1 overflow-auto max-h-32">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              刷新页面
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </div>

          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={handleReportError} className="text-muted-foreground">
              <Bug className="w-4 h-4 mr-2" />
              复制错误信息
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for functional components with enhanced features
export function useEnhancedErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error, context?: Record<string, any>) => {
    logError(error, context)
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}
