import { NextRequest, NextResponse } from 'next/server'
import { getMember, saveMember } from '@/lib/data'
import { sendBanDoMagicLinkEmail } from '@/lib/email'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }
    const normalizedEmail = email.toLowerCase().trim()
    const member = await getMember(normalizedEmail)

    // Always return success to avoid email enumeration
    if (!member) {
      return NextResponse.json({ ok: true })
    }

    const magicToken = crypto.randomBytes(32).toString('hex')
    const magicTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    await saveMember({ ...member, magicToken, magicTokenExpiresAt })

    sendBanDoMagicLinkEmail({
      to: member.email,
      name: member.name,
      token: magicToken,
    }).catch(e => console.error('[magic-link] email failed:', e))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[magic-link] error:', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
