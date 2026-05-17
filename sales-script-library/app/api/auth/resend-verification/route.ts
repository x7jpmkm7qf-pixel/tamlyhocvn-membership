import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getMember, saveMember } from '@/lib/data'
import { sendVerificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000  // 60s rate-limit per email

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = (body.email || '').toString().toLowerCase().trim()

  if (!email) {
    return NextResponse.json({ error: 'Thiếu email' }, { status: 400 })
  }

  const member = await getMember(email)
  if (!member) {
    // Avoid leaking whether email exists — return generic success
    return NextResponse.json({ success: true })
  }

  if (member.emailVerified) {
    return NextResponse.json({ success: true, alreadyVerified: true })
  }

  if (member.verificationSentAt) {
    const elapsed = Date.now() - new Date(member.verificationSentAt).getTime()
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
      return NextResponse.json({ error: `Vui lòng đợi ${wait}s rồi thử lại` }, { status: 429 })
    }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const now = new Date()
  const updated = {
    ...member,
    verificationToken: token,
    verificationTokenExpiresAt: new Date(now.getTime() + TOKEN_TTL_MS).toISOString(),
    verificationSentAt: now.toISOString(),
  }
  await saveMember(updated)

  const result = await sendVerificationEmail({
    to: member.email,
    name: member.name,
    token,
  })

  if (!result.ok) {
    return NextResponse.json({ error: 'Không gửi được email — vui lòng thử lại sau' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
