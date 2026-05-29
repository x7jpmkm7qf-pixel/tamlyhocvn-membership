/**
 * POST /api/auth/admin/change-password
 * Body: { oldPassword, newPassword }
 *
 * Đổi mật khẩu admin. Hash mới được lưu vào Redis (msl:admin_password_hash) —
 * từ giờ verifyAdminPassword sẽ ưu tiên hash Redis, env var ADMIN_PASSWORD
 * chỉ là fallback.
 *
 * Yêu cầu: phải đang login admin (cookie hợp lệ) + biết oldPassword.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getAdminSession,
  verifyAdminPassword,
  setAdminPasswordHash,
  validatePasswordStrength,
  ADMIN_COOKIE_NAME,
  sessionCookieOptions,
} from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Bạn cần đăng nhập admin' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { oldPassword, newPassword } = body as {
    oldPassword?: string
    newPassword?: string
  }

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: 'Thiếu mật khẩu cũ hoặc mới' }, { status: 400 })
  }

  // Verify old password
  const ok = await verifyAdminPassword(oldPassword)
  if (!ok) {
    return NextResponse.json({ error: 'Mật khẩu cũ không đúng' }, { status: 401 })
  }

  // Validate new password strength
  const strength = validatePasswordStrength(newPassword)
  if (!strength.ok) {
    return NextResponse.json({ error: strength.reason }, { status: 400 })
  }

  // Save new password hash
  const saved = await setAdminPasswordHash(newPassword)
  if (!saved) {
    return NextResponse.json(
      { error: 'Lỗi server — không lưu được mật khẩu mới (kiểm tra Redis)' },
      { status: 500 }
    )
  }

  // Clear admin cookie → force re-login với password mới
  const res = NextResponse.json({ success: true, message: 'Đã đổi mật khẩu — vui lòng đăng nhập lại' })
  res.cookies.set(ADMIN_COOKIE_NAME, '', sessionCookieOptions(0))
  return res
}
