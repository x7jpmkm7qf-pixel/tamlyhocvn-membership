import crypto from 'crypto'
import { getMember, getMembers, saveMember } from './data'

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const COMMISSIONS_KEY    = 'msl:commissions'
const PAYOUT_REQUESTS_KEY = 'msl:payout_requests'

const RATE_STANDARD  = 101000   // referrals 1–29
const RATE_POWER     = 150000   // referrals 30+
export const MIN_WITHDRAWAL = 101000

export interface Commission {
  id: string
  affiliate_email: string
  buyer_email: string
  order_reference_code: string
  commission_amount: number
  order_amount: number
  referral_number: number
  status: 'available' | 'clawback' | 'paid_out'
  created_at: string
  paid_out_at?: string
  payout_request_id?: string
}

export interface PayoutRequest {
  id: string
  affiliate_email: string
  total_amount: number
  bank_name: string
  bank_account: string
  account_holder: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  note?: string
  commission_ids: string[]
}

async function redisExec(command: unknown[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) throw new Error('Redis not configured')
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  const json = await res.json()
  return json.result
}

async function rget<T>(key: string): Promise<T | null> {
  const result = await redisExec(['GET', key])
  if (result === null || result === undefined) return null
  return (typeof result === 'string' ? JSON.parse(result) : result) as T
}

async function rset(key: string, value: unknown): Promise<void> {
  await redisExec(['SET', key, JSON.stringify(value)])
}

export async function getCommissions(): Promise<Commission[]> {
  return (await rget<Commission[]>(COMMISSIONS_KEY)) || []
}

export async function getPayoutRequests(): Promise<PayoutRequest[]> {
  return (await rget<PayoutRequest[]>(PAYOUT_REQUESTS_KEY)) || []
}

export async function saveCommissions(commissions: Commission[]): Promise<void> {
  await rset(COMMISSIONS_KEY, commissions)
}

export async function savePayoutRequests(requests: PayoutRequest[]): Promise<void> {
  await rset(PAYOUT_REQUESTS_KEY, requests)
}

export function generateAffiliateCode(name: string): string {
  // Normalize: "Hán Văn Sơn" → "Han Van Son" → "HANV"
  const normalized = name.normalize('NFD').replace(/[̀-ͯ]/g, '')
  const prefix = normalized.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4).padEnd(4, 'X')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(4)
  const suffix = Array.from(bytes).map(b => chars[b % chars.length]).join('')
  return prefix + suffix
}

export async function ensureAffiliateCode(memberEmail: string): Promise<string | null> {
  const member = await getMember(memberEmail)
  if (!member) return null
  if (member.affiliate_code) return member.affiliate_code

  const members = await getMembers()
  const existingCodes = new Set(members.map(m => m.affiliate_code).filter(Boolean))

  let code: string
  let attempts = 0
  do {
    code = generateAffiliateCode(member.name)
    attempts++
    if (attempts > 50) throw new Error('Could not generate unique affiliate code')
  } while (existingCodes.has(code))

  await saveMember({ ...member, affiliate_code: code })
  return code
}

export async function getMemberByAffCode(code: string) {
  const members = await getMembers()
  return members.find(m => m.affiliate_code === code.toUpperCase())
}

export async function createCommission({
  affiliate_email,
  buyer_email,
  order_reference_code,
  order_amount,
}: {
  affiliate_email: string
  buyer_email: string
  order_reference_code: string
  order_amount: number
}): Promise<Commission | null> {
  if (affiliate_email === buyer_email) return null

  const [commissions, affiliate] = await Promise.all([
    getCommissions(),
    getMember(affiliate_email),
  ])

  if (!affiliate || affiliate.is_affiliate_blocked) return null

  const alreadyExists = commissions.some(c => c.order_reference_code === order_reference_code)
  if (alreadyExists) return null

  const successfulCount = commissions.filter(
    c => c.affiliate_email === affiliate_email && (c.status === 'available' || c.status === 'paid_out')
  ).length

  const referral_number = successfulCount + 1
  const commission_amount = referral_number >= 30 ? RATE_POWER : RATE_STANDARD

  const commission: Commission = {
    id: crypto.randomUUID(),
    affiliate_email,
    buyer_email,
    order_reference_code,
    commission_amount,
    order_amount,
    referral_number,
    status: 'available',
    created_at: new Date().toISOString(),
  }

  commissions.push(commission)
  await Promise.all([
    saveCommissions(commissions),
    saveMember({ ...affiliate, total_successful_referrals: referral_number }),
  ])

  return commission
}

export async function getAffiliateStats(email: string) {
  const [commissions, payoutRequests] = await Promise.all([
    getCommissions(),
    getPayoutRequests(),
  ])

  const mine       = commissions.filter(c => c.affiliate_email === email)
  const available  = mine.filter(c => c.status === 'available')
  const paidOut    = mine.filter(c => c.status === 'paid_out')
  const clawbacks  = mine.filter(c => c.status === 'clawback')

  const availableTotal = available.reduce((s, c) => s + c.commission_amount, 0)
  const paidOutTotal   = paidOut.reduce((s, c) => s + c.commission_amount, 0)
  const totalEarned    = availableTotal + paidOutTotal

  const successCount = mine.filter(c => c.status !== 'clawback').length
  const nextRate     = successCount >= 30 ? RATE_POWER : RATE_STANDARD

  const pendingPayout = payoutRequests.find(
    p => p.affiliate_email === email && p.status === 'pending'
  ) || null

  return {
    commissions: mine,
    available,
    paidOut,
    clawbacks,
    availableTotal,
    paidOutTotal,
    totalEarned,
    totalReferrals: successCount,
    nextRate,
    canWithdraw: availableTotal >= MIN_WITHDRAWAL && !pendingPayout,
    pendingPayout,
    MIN_WITHDRAWAL,
  }
}

export async function createPayoutRequest({
  affiliate_email,
  bank_name,
  bank_account,
  account_holder,
}: {
  affiliate_email: string
  bank_name: string
  bank_account: string
  account_holder: string
}): Promise<{ ok: boolean; error?: string; request?: PayoutRequest }> {
  const [commissions, payoutRequests] = await Promise.all([
    getCommissions(),
    getPayoutRequests(),
  ])

  const available = commissions.filter(c => c.affiliate_email === affiliate_email && c.status === 'available')
  const total = available.reduce((s, c) => s + c.commission_amount, 0)

  if (total < MIN_WITHDRAWAL) {
    return { ok: false, error: `Cần tối thiểu ${MIN_WITHDRAWAL.toLocaleString('vi-VN')}đ để rút` }
  }

  const existing = payoutRequests.find(p => p.affiliate_email === affiliate_email && p.status === 'pending')
  if (existing) {
    return { ok: false, error: 'Đã có yêu cầu rút đang chờ xử lý' }
  }

  const request: PayoutRequest = {
    id: crypto.randomUUID(),
    affiliate_email,
    total_amount: total,
    bank_name: bank_name.trim(),
    bank_account: bank_account.trim(),
    account_holder: account_holder.trim().toUpperCase(),
    status: 'pending',
    created_at: new Date().toISOString(),
    commission_ids: available.map(c => c.id),
  }

  payoutRequests.push(request)
  await savePayoutRequests(payoutRequests)

  return { ok: true, request }
}
