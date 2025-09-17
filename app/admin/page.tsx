import { requireRole } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  // 只允许管理员和超级管理员访问
  await requireRole(["admin", "super_admin"])

  return <AdminDashboard />
}
