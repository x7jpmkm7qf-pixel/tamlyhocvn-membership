import { NextRequest, NextResponse } from 'next/server'
import { trackAffiliateClick } from '@/lib/affiliate'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase()
  const destination = new URL('/khau-quyet', req.url)
  const response = NextResponse.redirect(destination, { status: 302 })

  response.cookies.set('aff_code', code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  trackAffiliateClick(code).catch(e => console.error('[r/:code] trackAffiliateClick failed for', code, e))

  return response
}
