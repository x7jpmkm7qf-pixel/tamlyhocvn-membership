import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import {
  getCommissions,
  getPayoutRequests,
  saveCommissions,
  savePayoutRequests,
  Commission,
  PayoutRequest,
} from '@/lib/affiliate'

export const dynamic = 'force-dynamic'

// GET — return all payouts + commissions for admin
export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [commissions, payouts] = await Promise.all([getCommissions(), getPayoutRequests()])

  // Aggregate per-affiliate stats
  const affiliateMap = new Map<string, {
    email: string
    total_referrals: number
    available: number
    paid_out: number
    clawbacks: number
  }>()

  for (const c of commissions) {
    const existing = affiliateMap.get(c.affiliate_email) || {
      email: c.affiliate_email,
      total_referrals: 0,
      available: 0,
      paid_out: 0,
      clawbacks: 0,
    }
    if (c.status === 'available') {
      existing.available += c.commission_amount
      existing.total_referrals++
    } else if (c.status === 'paid_out') {
      existing.paid_out += c.commission_amount
      existing.total_referrals++
    } else if (c.status === 'clawback') {
      existing.clawbacks += c.commission_amount
    }
    affiliateMap.set(c.affiliate_email, existing)
  }

  return NextResponse.json({
    payouts: payouts.sort((a, b) => {
      // pending first, then by date desc
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (b.status === 'pending' && a.status !== 'pending') return 1
      return b.created_at.localeCompare(a.created_at)
    }),
    commissions,
    affiliates: Array.from(affiliateMap.values()),
    summary: {
      total_commissions: commissions.length,
      total_available: commissions.filter(c => c.status === 'available').reduce((s, c) => s + c.commission_amount, 0),
      total_paid_out: commissions.filter(c => c.status === 'paid_out').reduce((s, c) => s + c.commission_amount, 0),
      pending_payouts: payouts.filter(p => p.status === 'pending').length,
    },
  })
}

// POST — approve or reject a payout request
export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const id     = (body?.id || '').toString()
  const action = (body?.action || '').toString() as 'approve' | 'reject'
  const note   = (body?.note || '').toString().trim()

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Cần id và action (approve|reject)' }, { status: 400 })
  }

  const [commissions, payouts] = await Promise.all([getCommissions(), getPayoutRequests()])

  const payoutIdx = payouts.findIndex(p => p.id === id)
  if (payoutIdx === -1) return NextResponse.json({ error: 'Không tìm thấy yêu cầu' }, { status: 404 })

  const payout = payouts[payoutIdx]
  if (payout.status !== 'pending') {
    return NextResponse.json({ error: 'Yêu cầu này đã được xử lý rồi' }, { status: 400 })
  }

  const now = new Date().toISOString()
  payouts[payoutIdx] = { ...payout, status: action === 'approve' ? 'approved' : 'rejected', reviewed_at: now, note: note || undefined }

  if (action === 'approve') {
    const commissionIdSet = new Set(payout.commission_ids)
    for (const c of commissions) {
      if (commissionIdSet.has(c.id) && c.status === 'available') {
        c.status = 'paid_out'
        c.paid_out_at = now
        c.payout_request_id = payout.id
      }
    }
  }

  await Promise.all([saveCommissions(commissions), savePayoutRequests(payouts)])

  return NextResponse.json({ success: true })
}
