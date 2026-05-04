import { NextResponse } from 'next/server'
import { getMemberSession, getAdminSession } from '@/lib/auth'

export async function GET() {
  const member = getMemberSession()
  const isAdmin = getAdminSession()
  return NextResponse.json({ member, isAdmin })
}
