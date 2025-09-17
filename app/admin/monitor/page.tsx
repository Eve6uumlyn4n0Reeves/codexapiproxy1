import { requireRole } from "@/lib/auth"
import { SystemMonitoring } from "@/components/admin/system-monitoring"

export default async function AdminMonitorPage() {
  // 只允许管理员和超级管理员访问
  await requireRole(["admin", "super_admin"])

  return <SystemMonitoring />
}
