import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "../auth"

// 受保护的路由
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/api/v1"]

// 管理员路由
const ADMIN_ROUTES = ["/admin"]

// 公开路由（不需要认证）
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否是公开路由
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // 检查是否是受保护的路由
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // 获取认证令牌
  const token = request.cookies.get("auth-token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 验证令牌
  const payload = verifyToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("auth-token")
    return response
  }

  // 检查管理员路由权限
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  if (isAdminRoute && !["admin", "super_admin"].includes(payload.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // 为请求添加用户信息头部
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", payload.userId)
  requestHeaders.set("x-user-email", payload.email)
  requestHeaders.set("x-user-role", payload.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
