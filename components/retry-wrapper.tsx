"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface RetryWrapperProps {
  children: React.ReactNode
  onRetry: () => Promise<void>
  error?: Error | null
  loading?: boolean
  maxRetries?: number
  retryDelay?: number
}

export function RetryWrapper({
  children,
  onRetry,
  error,
  loading = false,
  maxRetries = 3,
  retryDelay = 1000,
}: RetryWrapperProps) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) return

    setIsRetrying(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
      await onRetry()
      setRetryCount(0)
    } catch (error) {
      setRetryCount((prev) => prev + 1)
    } finally {
      setIsRetrying(false)
    }
  }, [onRetry, retryCount, maxRetries, retryDelay])

  if (loading || isRetrying) {
    return <LoadingSpinner text={isRetrying ? "重试中..." : "加载中..."} />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>加载失败</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{error.message}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              重试次数: {retryCount}/{maxRetries}
            </span>
            <Button variant="outline" size="sm" onClick={handleRetry} disabled={retryCount >= maxRetries || isRetrying}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryCount >= maxRetries ? "已达最大重试次数" : "重试"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}
