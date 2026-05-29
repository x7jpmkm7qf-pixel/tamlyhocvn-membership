import { NextResponse } from 'next/server'
import { MEMBER_COOKIE_NAME, ADMIN_COOKIE_NAME, COOKIE_DOMAIN } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ success: true })
  // Clear with the same scope (path + domain) the cookies were set with,
  // otherwise the browser keeps the .tamlyhocvn.club-scoped cookie.
  res.cookies.set(MEMBER_COOKIE_NAME, '', { path: '/', maxAge: 0, ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}) })
  res.cookies.set(ADMIN_COOKIE_NAME, '', { path: '/', maxAge: 0, ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}) })
  return res
}
