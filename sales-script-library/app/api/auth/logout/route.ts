import { NextResponse } from 'next/server'
import { MEMBER_COOKIE_NAME, ADMIN_COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(MEMBER_COOKIE_NAME)
  res.cookies.delete(ADMIN_COOKIE_NAME)
  return res
}
