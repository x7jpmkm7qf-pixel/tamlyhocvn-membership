/**
 * POST /api/khau-quyet/checkout
 * Body: { name, email }
 *
 * Friction-free Khẩu Quyết checkout:
 * - Checks if email exists (returns emailExists: true if so)
 * - Creates member with server-side auto-generated password
 * - Creates pending khau-quyet enrollment
 * - Auto-logs in (sets session cookie)
 * - Sends welcome email with credentials
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getMember, saveMember, Member } from '@/lib/data'
import { hashPassword, setMemberCookie, MEMBER_COOKIE_NAME } from '@/lib/auth'
import { sendKhauQuyetWelcome } from '@/lib/email'
import { notifyNewRegistration } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function checkRateLimit(ip: string): Promise<boolean> {
  if (!REDIS_URL || !REDIS_TOKEN) return true
  const key = `msl:ratelimit:kq-checkout:${ip}`
  try {
    const res = await fetch(REDIS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['INCR', key]),
      cache: 'no-store',
    })
    const { result: count } = await res.json()
    if (count === 1) {
      await fetch(REDIS_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['EXPIRE', key, 3600]),
        cache: 'no-store',
      })
    }
    return (count as number) <= 15
  } catch {
    return true
  }
}

/** Generates a secure 12-char password: upper + lower + digits + specials. Avoids ambiguous chars. */
function generateSecurePassword(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*'
  const bytes = crypto.randomBytes(12)
  return Array.from(bytes).map(b => charset[b % charset.length]).join('')
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const allowed = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu — thử lại sau 1 giờ' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const name  = (body?.name  || '').toString().trim()
  const email = (body?.email || '').toString().trim().toLowerCase()

  if (!name)  return NextResponse.json({ error: 'Vui lòng nhập họ tên' }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }

  const existing = await getMember(email)
  if (existing) {
    return NextResponse.json({ emailExists: true }, { status: 409 })
  }

  const plainPassword = generateSecurePassword()
  const now = new Date().toISOString()

  const member: Member = {
    id: crypto.randomUUID(),
    name,
    email,
    password: await hashPassword(plainPassword),
    status: 'pending',
    createdAt: now,
    product: 'khauquyet',
    enrollments: {
      'khau-quyet': {
        status: 'pending',
        enrolledAt: now,
        source: 'paid',
      },
    },
  }

  await saveMember(member)

  // Fire-and-forget: welcome email + Telegram
  Promise.all([
    sendKhauQuyetWelcome({ to: email, name, password: plainPassword })
      .catch(e => console.error('[kq-checkout] welcome email failed:', e)),
    notifyNewRegistration({ name, email })
      .catch(e => console.error('[kq-checkout] telegram notify failed:', e)),
  ])

  const encoded = setMemberCookie({ id: member.id, name: member.name, email: member.email })
  const res = NextResponse.json({ success: true }, { status: 200 })
  res.cookies.set(MEMBER_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
