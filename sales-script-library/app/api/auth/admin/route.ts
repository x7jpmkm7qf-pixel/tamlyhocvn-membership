import { NextRequest, NextResponse } from 'next/server'
import { getAdminPassword, ADMIN_COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password) {
    return NextResponse.json({ error: 'Vui lòng nhập mật khẩu' }, { status: 400 })
  }

  if (password !== getAdminPassword()) {
    return NextResponse.json({ error: 'Mật khẩu không đúng' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE_NAME, 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return res
}
