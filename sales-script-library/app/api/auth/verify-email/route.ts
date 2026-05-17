import { NextRequest, NextResponse } from 'next/server'
import { getMemberByVerificationToken, saveMember } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ status: 'error', error: 'missing_token' }, { status: 400 })
  }

  const member = await getMemberByVerificationToken(token)
  if (!member) {
    return NextResponse.json({ status: 'error', error: 'invalid_token' }, { status: 400 })
  }

  if (member.emailVerified) {
    return NextResponse.json({ status: 'already_verified', email: member.email })
  }

  if (member.verificationTokenExpiresAt && new Date(member.verificationTokenExpiresAt) < new Date()) {
    return NextResponse.json({ status: 'expired', email: member.email }, { status: 400 })
  }

  const updated = {
    ...member,
    emailVerified: true,
    verificationToken: undefined,
    verificationTokenExpiresAt: undefined,
  }
  await saveMember(updated)

  return NextResponse.json({ status: 'success', email: member.email, name: member.name })
}
