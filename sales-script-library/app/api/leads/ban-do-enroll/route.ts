/**
 * POST /api/leads/ban-do-enroll
 * Body: { name, email, phone, consent }
 *
 * Creates member account + enrolls in Bản Đồ course + sends magic link email.
 * Returns { ok: true } on success — no cookie, no redirect (magic link flow).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMember, saveMember, Member } from '@/lib/data'
import { getCourseBySlug, enrollUser, getEnrollment } from '@/lib/courses'
import { sendBanDoMagicLinkEmail } from '@/lib/email'
import { notifyBanDoLead } from '@/lib/telegram'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

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

const PHONE_REGEX = /^(0|\+84)[0-9]{9}$/

function normalizePhone(raw: string): string {
  const p = raw.trim()
  return p.startsWith('+84') ? '0' + p.slice(3) : p
}

function generateMagicToken() {
  const magicToken = crypto.randomBytes(32).toString('hex')
  const magicTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  return { magicToken, magicTokenExpiresAt }
}

export async function POST(req: NextRequest) {
  try {
    return await handlePost(req)
  } catch (err) {
    console.error('[ban-do-enroll] unhandled error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Lỗi server — vui lòng thử lại sau' }, { status: 500 })
  }
}

async function handlePost(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const allowed = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Thử lại sau — quá nhiều yêu cầu trong 1 giờ' }, { status: 429 })
  }

  const { name, email, phone, consent } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'Vui lòng điền đầy đủ họ tên và email' }, { status: 400 })
  }
  if (!email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
  }
  if (!phone || !PHONE_REGEX.test(String(phone).trim())) {
    return NextResponse.json({ error: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0 hoặc +84)' }, { status: 400 })
  }
  if (consent !== true) {
    return NextResponse.json({ error: 'Vui lòng đồng ý điều khoản để tiếp tục' }, { status: 400 })
  }

  const normalizedPhone = normalizePhone(String(phone))
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
      // Already enrolled — generate new magic token and resend
      const { magicToken, magicTokenExpiresAt } = generateMagicToken()
      await saveMember({ ...existing, magicToken, magicTokenExpiresAt })
      sendBanDoMagicLinkEmail({ to: existing.email, name: existing.name, token: magicToken })
        .catch(e => console.error('[ban-do-enroll] magic link email failed:', e))
      return NextResponse.json({ ok: true })
    }

    // Existing member not yet enrolled — enroll and send magic link
    const { magicToken, magicTokenExpiresAt } = generateMagicToken()
    await enrollUser(existing.id, course.id)
    await saveMember({
      ...existing,
      phone: existing.phone ?? normalizedPhone,
      consent: existing.consent ?? true,
      consentAt: existing.consentAt ?? new Date().toISOString(),
      magicToken,
      magicTokenExpiresAt,
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
    sendBanDoMagicLinkEmail({ to: existing.email, name: existing.name, token: magicToken })
      .catch(e => console.error('[ban-do-enroll] magic link email failed:', e))
    return NextResponse.json({ ok: true })
  }

  // New user — create member WITHOUT password, with magic token, enroll, send email
  const { magicToken, magicTokenExpiresAt } = generateMagicToken()
  const member: Member = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    consent: true,
    consentAt: new Date().toISOString(),
    status: 'active',
    createdAt: new Date().toISOString(),
    magicToken,
    magicTokenExpiresAt,
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
  sendBanDoMagicLinkEmail({ to: member.email, name: member.name, token: magicToken })
    .catch(e => console.error('[ban-do-enroll] magic link email failed:', e))
  notifyBanDoLead({ name: member.name, email: member.email })
    .catch(e => console.error('[ban-do-enroll] telegram notify failed:', e))

  return NextResponse.json({ ok: true })
}
