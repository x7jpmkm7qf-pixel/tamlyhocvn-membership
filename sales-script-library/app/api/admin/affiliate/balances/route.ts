/**
 * GET /api/admin/affiliate/balances
 *
 * Aggregated balance view per affiliate — used by the "Số dư User" admin tab.
 * Returns one row per affiliate who has at least one commission record.
 */

import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getCommissions, getPayoutRequests } from '@/lib/affiliate'
import { getMembers } from '@/lib/data'

export const dynamic = 'force-dynamic'

export interface AffiliateBalance {
  email: string
  name: string
  phone: string
  affiliate_code: string | null
  tier: 'ngoaimon' | 'noimon' | null
  is_blocked: boolean
  // Financial metrics
  available_total: number        // status='available'
  processing_total: number       // status='requested' | 'processing'
  paid_total: number             // status='paid_out'
  on_hold_total: number          // status='on_hold'
  clawback_total: number         // status='clawback'
  net_debt: number               // available + processing + on_hold
  // Order counts
  total_orders: number           // non-clawback commissions
  available_count: number
  processing_count: number
  on_hold_count: number
  // Tier label
  referral_rate: 'Standard' | 'Premium'
  // Dates
  oldest_unpaid_at: string | null   // oldest created_at among available commissions
  // Bank info from latest payout request
  bank: { bank_name: string; bank_account: string; account_holder: string } | null
}

export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [commissions, payouts, members] = await Promise.all([
    getCommissions(),
    getPayoutRequests(),
    getMembers(),
  ])

  // Build member lookup
  const memberMap = new Map(members.map(m => [m.email, m]))

  // Group commissions by affiliate
  const balMap = new Map<string, AffiliateBalance>()

  for (const c of commissions) {
    const email = c.affiliate_email
    if (!balMap.has(email)) {
      const m = memberMap.get(email)
      balMap.set(email, {
        email,
        name:           m?.name    || email,
        phone:          m?.phone   || '',
        affiliate_code: m?.affiliate_code || null,
        tier:           (m?.tier as 'ngoaimon' | 'noimon' | null) || null,
        is_blocked:     m?.is_affiliate_blocked || false,
        available_total:   0,
        processing_total:  0,
        paid_total:        0,
        on_hold_total:     0,
        clawback_total:    0,
        net_debt:          0,
        total_orders:      0,
        available_count:   0,
        processing_count:  0,
        on_hold_count:     0,
        referral_rate:     'Standard',
        oldest_unpaid_at:  null,
        bank:              null,
      })
    }
    const bal = balMap.get(email)!

    if (c.status === 'available') {
      bal.available_total  += c.commission_amount
      bal.available_count  += 1
      bal.total_orders     += 1
      if (!bal.oldest_unpaid_at || c.created_at < bal.oldest_unpaid_at) {
        bal.oldest_unpaid_at = c.created_at
      }
    } else if (c.status === 'requested' || c.status === 'processing') {
      bal.processing_total += c.commission_amount
      bal.processing_count += 1
      bal.total_orders     += 1
    } else if (c.status === 'paid_out') {
      bal.paid_total       += c.commission_amount
      bal.total_orders     += 1
    } else if (c.status === 'on_hold') {
      bal.on_hold_total    += c.commission_amount
      bal.on_hold_count    += 1
      bal.total_orders     += 1
    } else if (c.status === 'clawback') {
      bal.clawback_total   += Math.abs(c.commission_amount)
    }
    // rejected: don't count toward total_orders or any balance
  }

  // Post-process
  for (const bal of Array.from(balMap.values())) {
    bal.net_debt = bal.available_total + bal.processing_total + bal.on_hold_total
    // Premium tier = 30+ successful referrals
    bal.referral_rate = bal.total_orders >= 30 ? 'Premium' : 'Standard'
  }

  // Attach bank info from latest payout request per affiliate
  const latestPayoutMap = new Map<string, typeof payouts[0]>()
  for (const p of payouts) {
    if (!p.bank_account) continue
    const existing = latestPayoutMap.get(p.affiliate_email)
    if (!existing || p.created_at > existing.created_at) {
      latestPayoutMap.set(p.affiliate_email, p)
    }
  }
  for (const bal of Array.from(balMap.values())) {
    const p = latestPayoutMap.get(bal.email)
    if (p) bal.bank = { bank_name: p.bank_name, bank_account: p.bank_account, account_holder: p.account_holder }
  }

  const balances = Array.from(balMap.values())
    .sort((a, b) => b.available_total - a.available_total)

  const summary = {
    total_affiliates:    balances.length,
    total_net_debt:      balances.reduce((s, b) => s + b.net_debt, 0),
    total_available:     balances.reduce((s, b) => s + b.available_total, 0),
    total_processing:    balances.reduce((s, b) => s + b.processing_total, 0),
    total_paid:          balances.reduce((s, b) => s + b.paid_total, 0),
    total_clawback:      balances.reduce((s, b) => s + b.clawback_total, 0),
    affiliates_with_debt: balances.filter(b => b.net_debt > 0).length,
  }

  return NextResponse.json({ balances, summary })
}
