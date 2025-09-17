import { requireRole } from "@/lib/auth"
import { UserManagement } from "@/components/admin/user-management"

export default async function AdminUsersPage() {
  // 只允许管理员和超级管理员访问
  await requireRole(["admin", "super_admin"])

  return <UserManagement />
}
