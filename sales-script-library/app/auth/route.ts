import { NextRequest, NextResponse } from 'next/server'
import { getMemberByMagicToken, saveMember } from '@/lib/data'
import { setMemberCookie, MEMBER_COOKIE_NAME } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const baseUrl = req.nextUrl.origin

  if (!token) {
    return NextResponse.redirect(new URL('/doc?error=missing', baseUrl))
  }

  try {
    const member = await getMemberByMagicToken(token)

    if (!member) {
      return NextResponse.redirect(new URL('/doc?error=invalid', baseUrl))
    }

    if (!member.magicTokenExpiresAt || new Date(member.magicTokenExpiresAt) < new Date()) {
      return NextResponse.redirect(new URL('/doc?error=expired', baseUrl))
    }

    // Consume token (one-time use — clear it)
    await saveMember({ ...member, magicToken: undefined, magicTokenExpiresAt: undefined })

    const session = { id: member.id, name: member.name, email: member.email }
    const encoded = setMemberCookie(session)
    const res = NextResponse.redirect(new URL('/doc', baseUrl))
    res.cookies.set(MEMBER_COOKIE_NAME, encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return res
  } catch (err) {
    console.error('[auth] magic link verify error:', err)
    return NextResponse.redirect(new URL('/doc?error=server', baseUrl))
  }
}
