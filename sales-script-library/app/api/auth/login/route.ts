import { NextRequest, NextResponse } from 'next/server'
import { getMember, saveMember } from '@/lib/data'
import { setMemberCookie, MEMBER_COOKIE_NAME, verifyPassword, isHashedPassword, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 })
  }

  const member = await getMember(email.toLowerCase().trim())
  if (!member || !(await verifyPassword(password, member.password))) {
    return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
  }

  // Migrate legacy plaintext password → bcrypt on successful login
  if (!isHashedPassword(member.password)) {
    try {
      const hashed = await hashPassword(password)
      await saveMember({ ...member, password: hashed })
    } catch (e) {
      console.error('[login] password migration failed:', e)
    }
  }

  if (member.status === 'pending') {
    return NextResponse.json({ error: 'Tài khoản đang chờ xác nhận thanh toán. Admin sẽ kích hoạt trong 24h sau khi nhận được chuyển khoản.', pending: true }, { status: 403 })
  }

  const session = { id: member.id, name: member.name, email: member.email }
  const encoded = setMemberCookie(session)

  const res = NextResponse.json({ success: true, member: session })
  res.cookies.set(MEMBER_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
