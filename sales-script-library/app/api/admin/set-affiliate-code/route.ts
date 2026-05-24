/**
 * POST /api/admin/set-affiliate-code
 * Body: { email: string, code: string }
 *
 * Forcibly sets a member's affiliate_code to the given value.
 * Used to restore the original code after the race-condition bug
 * regenerated codes on concurrent page loads.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getMember, getMembers, saveMember } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const email = (body?.email || '').toString().trim().toLowerCase()
  const code  = (body?.code  || '').toString().trim().toUpperCase()

  if (!email || !code) {
    return NextResponse.json({ error: 'Cần email và code' }, { status: 400 })
  }

  const [member, members] = await Promise.all([getMember(email), getMembers()])
  if (!member) return NextResponse.json({ error: `Không tìm thấy member: ${email}` }, { status: 404 })

  const conflict = members.find(m => m.affiliate_code === code && m.email !== email)
  if (conflict) {
    return NextResponse.json({ error: `Code ${code} đã được dùng bởi ${conflict.email}` }, { status: 409 })
  }

  const prev = member.affiliate_code
  await saveMember({ ...member, affiliate_code: code })

  return NextResponse.json({ ok: true, email, previous_code: prev ?? null, new_code: code })
}
