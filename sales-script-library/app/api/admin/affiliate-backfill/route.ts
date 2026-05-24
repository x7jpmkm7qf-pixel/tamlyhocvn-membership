/**
 * POST /api/admin/affiliate-backfill
 *
 * Backfill referred_by_code + create commission for a member whose
 * referred_by_code was null at payment time due to the cookie-domain bug.
 *
 * Body: { buyer_email: string, aff_code: string, reference_code?: string }
 *
 * GET /api/admin/affiliate-backfill
 * Lists recent active members (last 48h) with no referred_by_code.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getMember, getMembers, saveMember } from '@/lib/data'
import { getMemberByAffCode, createCommission } from '@/lib/affiliate'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const members = await getMembers()

  const candidates = members
    .filter(m =>
      m.status === 'active' &&
      !m.referred_by_code &&
      m.createdAt >= cutoff
    )
    .map(m => ({
      email: m.email,
      name: m.name,
      product: m.product,
      tier: m.tier,
      createdAt: m.createdAt,
      lastReferenceCode: m.lastReferenceCode,
    }))

  return NextResponse.json({ candidates, count: candidates.length })
}

export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const buyer_email    = (body?.buyer_email || '').toString().trim().toLowerCase()
  const aff_code       = (body?.aff_code || '').toString().trim().toUpperCase()
  const reference_code = (body?.reference_code || `manual-backfill-${Date.now()}`).toString().trim()

  if (!buyer_email || !aff_code) {
    return NextResponse.json({ error: 'Cần buyer_email và aff_code' }, { status: 400 })
  }

  const [buyer, referrer] = await Promise.all([
    getMember(buyer_email),
    getMemberByAffCode(aff_code),
  ])

  if (!buyer)    return NextResponse.json({ error: `Không tìm thấy member: ${buyer_email}` }, { status: 404 })
  if (!referrer) return NextResponse.json({ error: `Không tìm thấy affiliate với code: ${aff_code}` }, { status: 404 })

  // Backfill referred_by_code if not already set
  let backfilled = false
  if (!buyer.referred_by_code) {
    await saveMember({ ...buyer, referred_by_code: aff_code })
    backfilled = true
  }

  // Create commission (idempotent — createCommission skips duplicates by reference_code)
  const commission = await createCommission({
    affiliate_email: referrer.email,
    buyer_email:     buyer.email,
    order_reference_code: reference_code,
    order_amount:    buyer.enrollments?.['khau-quyet']
      ? 199000
      : (body?.order_amount || 199000),
  })

  return NextResponse.json({
    ok: true,
    backfilled_referred_by_code: backfilled,
    commission: commission
      ? { id: commission.id, amount: commission.commission_amount, status: commission.status }
      : null,
    note: commission ? 'Commission tạo thành công' : 'Commission đã tồn tại hoặc bị chặn (xem log)',
  })
}
