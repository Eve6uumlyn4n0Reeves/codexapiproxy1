import { requireRole } from "@/lib/auth"
import { RedemptionCodeManagement } from "@/components/admin/redemption-code-management"

export default async function AdminCodesPage() {
  // 只允许管理员和超级管理员访问
  await requireRole(["admin", "super_admin"])

  return <RedemptionCodeManagement />
}
