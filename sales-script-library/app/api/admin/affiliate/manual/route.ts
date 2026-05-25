import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAdminSession } from '@/lib/auth'
import { getMember } from '@/lib/data'
import { getCommissions, saveCommissions, Commission } from '@/lib/affiliate'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const affiliate_email = (body?.affiliate_email || '').toString().trim().toLowerCase()
  const manual_type = (body?.manual_type || 'BONUS').toString() as Commission['manual_type']
  const amount = parseInt(body?.amount ?? '0')
  const reason = (body?.reason || '').toString().trim()
  const buyer_email = (body?.buyer_email || '').toString().trim().toLowerCase() || 'admin'
  const initial_status: Commission['status'] = body?.initial_status === 'paid_out' ? 'paid_out' : 'available'

  if (!affiliate_email || !amount || !reason) {
    return NextResponse.json({ error: 'Cần affiliate_email, amount, reason' }, { status: 400 })
  }

  const validTypes = ['BONUS', 'COMPENSATION', 'MANUAL_REFERRAL', 'ADJUSTMENT_PLUS', 'ADJUSTMENT_MINUS']
  if (!validTypes.includes(manual_type!)) {
    return NextResponse.json({ error: 'manual_type không hợp lệ' }, { status: 400 })
  }

  const affiliate = await getMember(affiliate_email)
  if (!affiliate) return NextResponse.json({ error: `Không tìm thấy member: ${affiliate_email}` }, { status: 404 })

  const commissions = await getCommissions()
  const successCount = commissions.filter(c =>
    c.affiliate_email === affiliate_email &&
    (c.status === 'available' || c.status === 'paid_out' || c.status === 'requested' || c.status === 'processing')
  ).length

  const commission: Commission = {
    id: crypto.randomUUID(),
    affiliate_email,
    buyer_email,
    order_reference_code: `manual-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    commission_amount: manual_type === 'ADJUSTMENT_MINUS' ? -Math.abs(amount) : Math.abs(amount),
    order_amount: amount,
    referral_number: successCount + 1,
    status: initial_status,
    created_at: new Date().toISOString(),
    is_manual: true,
    manual_type,
    manual_reason: reason,
    created_by_admin_id: 'admin',
    ...(initial_status === 'paid_out' ? { paid_out_at: new Date().toISOString() } : {}),
  }

  commissions.push(commission)
  await saveCommissions(commissions)

  return NextResponse.json({ ok: true, commission })
}
