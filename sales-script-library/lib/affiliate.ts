import crypto from 'crypto'
import { unstable_cache } from 'next/cache'
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
  status: 'available' | 'requested' | 'processing' | 'paid_out' | 'on_hold' | 'rejected' | 'clawback'
  created_at: string
  paid_out_at?: string
  payout_request_id?: string
  transfer_proof_url?: string
  bank_reference?: string
  is_manual?: boolean
  manual_type?: 'BONUS' | 'COMPENSATION' | 'MANUAL_REFERRAL' | 'ADJUSTMENT_PLUS' | 'ADJUSTMENT_MINUS'
  manual_reason?: string
  created_by_admin_id?: string
}

export interface AuditLogEntry {
  id: string
  commission_id: string
  old_status: Commission['status']
  new_status: Commission['status']
  changed_by: string
  reason: string
  timestamp: string
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

async function rhincrby(key: string, field: string, by = 1): Promise<void> {
  await redisExec(['HINCRBY', key, field, by])
}

async function rhgetall(key: string): Promise<Record<string, string> | null> {
  const result = await redisExec(['HGETALL', key])
  if (!result || !Array.isArray(result) || result.length === 0) return null
  const obj: Record<string, string> = {}
  for (let i = 0; i < result.length; i += 2) obj[result[i]] = result[i + 1]
  return obj
}

export async function trackAffiliateClick(code: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)
  await rhincrby(`msl:aff_clicks:${code.toUpperCase()}`, today)
    .catch(e => console.error('[affiliate] HINCRBY failed for', code, today, e))
}

export async function getClickCount30d(code: string): Promise<number> {
  const hash = await rhgetall(`msl:aff_clicks:${code.toUpperCase()}`)
  if (!hash) return 0
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return Object.entries(hash)
    .filter(([day]) => day >= cutoff)
    .reduce((sum, [, count]) => sum + parseInt(count, 10), 0)
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

const AUDIT_LOG_KEY = 'msl:affiliate_audit_log'

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return (await rget<AuditLogEntry[]>(AUDIT_LOG_KEY)) || []
}

export async function saveAuditLogs(logs: AuditLogEntry[]): Promise<void> {
  await rset(AUDIT_LOG_KEY, logs)
}

export async function appendAuditLog(entry: Omit<AuditLogEntry, 'id'>): Promise<void> {
  const logs = await getAuditLogs()
  logs.push({ ...entry, id: crypto.randomUUID() })
  await saveAuditLogs(logs)
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
  if (member.affiliate_code) return member.affiliate_code  // fast path

  // Re-fetch the full member list to get a fresh snapshot.
  // A concurrent call may have already generated and saved a code between our
  // first getMember read and now — we must check again to avoid overwriting it.
  const members = await getMembers()
  const fresh = members.find(m => m.id === member.id)
  if (fresh?.affiliate_code) return fresh.affiliate_code  // concurrent call already set it

  const existingCodes = new Set(members.map(m => m.affiliate_code).filter(Boolean))

  let code: string
  let attempts = 0
  do {
    code = generateAffiliateCode(fresh?.name ?? member.name)
    attempts++
    if (attempts > 50) throw new Error('Could not generate unique affiliate code')
  } while (existingCodes.has(code))

  // Use the FRESH snapshot — not the stale `member` from the first getMember.
  // If we used `member`, we'd overwrite any field changes made between reads.
  await saveMember({ ...(fresh ?? member), affiliate_code: code })
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

export async function getActiveAffiliatesCount(): Promise<number> {
  const commissions = await getCommissions()
  const set = new Set(
    commissions
      .filter(c => c.status === 'available' || c.status === 'paid_out')
      .map(c => c.affiliate_email)
  )
  return set.size
}

// Cached wrappers — 5-minute TTL, shared across chapter navigations
export const getCachedAffiliateStats = unstable_cache(
  getAffiliateStats,
  ['aff-stats'],
  { revalidate: 300 }
)

export const getCachedActiveAffiliatesCount = unstable_cache(
  getActiveAffiliatesCount,
  ['aff-active-count'],
  { revalidate: 300 }
)
