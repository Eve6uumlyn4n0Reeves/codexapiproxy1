import { Badge } from "./badge"
import { UserRole } from "@/lib/database/entities/User"

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return {
          label: "超级管理员",
          variant: "destructive" as const,
          className: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
        }
      case UserRole.ADMIN:
        return {
          label: "管理员",
          variant: "default" as const,
          className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
        }
      case UserRole.USER:
        return {
          label: "普通用户",
          variant: "secondary" as const,
          className: "bg-gradient-to-r from-gray-400 to-gray-500 text-white",
        }
      default:
        return {
          label: "未知",
          variant: "outline" as const,
          className: "",
        }
    }
  }

  const config = getRoleConfig(role)

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  )
}
