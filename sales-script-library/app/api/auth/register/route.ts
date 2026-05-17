import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getMembers, saveMember, Member } from '@/lib/data'
import { hashPassword } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
import { notifyNewRegistration } from '@/lib/telegram'
import { v4 as uuidv4 } from 'uuid'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const { name, email, password, phone, product } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })
  }

  const members = await getMembers()
  if (members.find(m => m.email === email.toLowerCase().trim())) {
    return NextResponse.json({ error: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.' }, { status: 400 })
  }

  const verificationToken = crypto.randomBytes(32).toString('hex')
  const now = new Date()

  // product distinguishes Khẩu Quyết buyers from Membership buyers. Default to 'membership'
  // so legacy /register form (no product field) behaves exactly as before.
  const productKind: 'khauquyet' | 'membership' = product === 'khauquyet' ? 'khauquyet' : 'membership'

  const member: Member = {
    id: `member-${uuidv4()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: await hashPassword(password),
    phone: phone?.trim() || undefined,
    status: 'pending',
    createdAt: now.toISOString(),
    emailVerified: false,
    verificationToken,
    verificationTokenExpiresAt: new Date(now.getTime() + TOKEN_TTL_MS).toISOString(),
    verificationSentAt: now.toISOString(),
    product: productKind,
  }

  await saveMember(member)

  // Gửi email xác minh (không block response)
  sendVerificationEmail({
    to: member.email,
    name: member.name,
    token: verificationToken,
  }).catch(e => console.error('[Register] Send verification email lỗi:', e))

  // Gửi thông báo Telegram cho admin (không block response)
  notifyNewRegistration({
    name: member.name,
    email: member.email,
    phone: member.phone,
  }).catch(e => console.error('[Register] Telegram notify lỗi:', e))

  const { password: _p, verificationToken: _t, ...safe } = member
  return NextResponse.json({ success: true, member: safe }, { status: 201 })
}
