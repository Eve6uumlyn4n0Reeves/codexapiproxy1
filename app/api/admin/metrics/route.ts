import type { NextRequest } from "next/server"
import { verifyAuth, requireSuperAdmin } from "@/lib/auth"
import { metricsCollector } from "@/lib/monitoring/metrics-collector"
import { withErrorHandler, createSuccessResponse, ValidationError } from "@/lib/middleware/error-handler"

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await verifyAuth(request)
  if (!user) {
    throw new ValidationError("未授权访问")
  }

  await requireSuperAdmin()

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "latest" // latest, history, trend

  let data
  switch (type) {
    case "latest":
      data = metricsCollector.getLatestMetrics()
      break
    case "history":
      const limit = Number.parseInt(searchParams.get("limit") || "100")
      data = metricsCollector.getMetricsHistory(limit)
      break
    case "trend":
      const metric = searchParams.get("metric")
      const minutes = Number.parseInt(searchParams.get("minutes") || "60")
      if (!metric) {
        throw new ValidationError("需要指定监控指标")
      }
      data = metricsCollector.getMetricsTrend(metric, minutes)
      break
    default:
      throw new ValidationError("无效的查询类型")
  }

  return createSuccessResponse(data)
})
