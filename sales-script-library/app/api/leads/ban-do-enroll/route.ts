/**
 * POST /api/leads/ban-do-enroll
 * Body: { name, email, password }
 *
 * Creates member account + enrolls in Bản Đồ course + sets session cookie.
 * Returns { redirectTo } on success.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMember, saveMember, Member } from '@/lib/data'
import { hashPassword, verifyPassword, setMemberCookie, MEMBER_COOKIE_NAME } from '@/lib/auth'
import { getCourseBySlug, enrollUser, getEnrollment } from '@/lib/courses'
import { sendBanDoWelcomeEmail } from '@/lib/email'
import { notifyBanDoLead } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const READER_URL  = '/tang-kinh-cac/khoa-hoc/ban-do'

async function checkRateLimit(ip: string): Promise<boolean> {
  if (!REDIS_URL || !REDIS_TOKEN) return true
  const key = `msl:ratelimit:ban-do-enroll:${ip}`
  try {
    const res = await fetch(REDIS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['INCR', key]),
      cache: 'no-store',
    })
    const { result: count } = await res.json()
    if (count === 1) {
      // Set 1-hour TTL on first request
      await fetch(REDIS_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['EXPIRE', key, 3600]),
        cache: 'no-store',
      })
    }
    return (count as number) <= 10
  } catch {
    return true
  }
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const allowed = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Thử lại sau — quá nhiều yêu cầu trong 1 giờ' }, { status: 429 })
  }

  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' }, { status: 400 })
  }
  if (!email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const course = await getCourseBySlug('ban-do')
  if (!course) {
    return NextResponse.json({ error: 'Khóa học chưa sẵn sàng — vui lòng thử lại sau' }, { status: 503 })
  }

  const existing = await getMember(normalizedEmail)

  if (existing) {
    // Check if already enrolled
    const enrollment = await getEnrollment(existing.id, course.id)
    if (enrollment) {
      // Already has access — let them log in normally
      return NextResponse.json(
        { error: 'Email này đã có tài khoản và đã được cấp bản đồ. Hãy đăng nhập để đọc.', redirectTo: `/login?from=${READER_URL}` },
        { status: 409 }
      )
    }

    // Verify password before enrolling
    const passwordOk = await verifyPassword(password, existing.password)
    if (!passwordOk) {
      return NextResponse.json(
        { error: 'Email này đã có tài khoản — nhập đúng mật khẩu hoặc vào /login để đăng nhập.' },
        { status: 401 }
      )
    }

    // Enroll existing member
    await enrollUser(existing.id, course.id)
    // Track ban-do enrollment in member record
    await saveMember({
      ...existing,
      enrollments: {
        ...existing.enrollments,
        'ban-do': existing.enrollments?.['ban-do'] || {
          status: 'active',
          enrolledAt: new Date().toISOString(),
          source: 'free',
          activatedAt: new Date().toISOString(),
        },
      },
    })
    const session = { id: existing.id, name: existing.name, email: existing.email }
    const encoded = setMemberCookie(session)
    const res = NextResponse.json({ ok: true, redirectTo: `${READER_URL}?welcome=true` })
    res.cookies.set(MEMBER_COOKIE_NAME, encoded, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
    })
    return res
  }

  // New user — create member, enroll, set cookie, send email
  const member: Member = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password: await hashPassword(password),
    status: 'active',
    createdAt: new Date().toISOString(),
    enrollments: {
      'ban-do': {
        status: 'active',
        enrolledAt: new Date().toISOString(),
        source: 'free',
        activatedAt: new Date().toISOString(),
      },
    },
  }

  await saveMember(member)
  await enrollUser(member.id, course.id)

  // Fire-and-forget notifications (don't block response)
  Promise.all([
    sendBanDoWelcomeEmail({ to: member.email, name: member.name }).catch(e =>
      console.error('[ban-do-enroll] welcome email failed:', e)
    ),
    notifyBanDoLead({ name: member.name, email: member.email }).catch(e =>
      console.error('[ban-do-enroll] telegram notify failed:', e)
    ),
  ])

  const session = { id: member.id, name: member.name, email: member.email }
  const encoded = setMemberCookie(session)
  const res = NextResponse.json({ ok: true, redirectTo: `${READER_URL}?welcome=true` })
  res.cookies.set(MEMBER_COOKIE_NAME, encoded, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
  })
  return res
}
