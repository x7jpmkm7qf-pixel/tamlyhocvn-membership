/**
 * Free Lead storage — leads từ trang `/free` (lead magnet "3 Kịch Bản Chốt Đơn")
 * Pattern: Upstash Redis (cùng cách dùng với lib/data.ts + lib/leads.ts)
 *
 * Tách khỏi lib/leads.ts (Bootcamp + Mentoring) để rõ ràng + tránh xung đột
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

const KEY = 'msl:free_leads'

export type FreeLeadStatus =
  | 'new'        // mới tải, chưa contact
  | 'contacted'  // đã add Zalo / nhắn tin
  | 'converted'  // đã mua 99K
  | 'lost'       // không phản hồi / từ chối

/** Step 0 = welcome (T+0), 1 = checkin (T+24h), 2 = soft-pitch (T+72h), 3 = last-call (T+5d) */
export type NurtureStep = 0 | 1 | 2 | 3

export interface FreeLead {
  id: string
  name: string
  email: string
  phone?: string
  source: string         // vd: '/free', '/free/download', etc.
  createdAt: string
  status: FreeLeadStatus
  contactedAt?: string
  convertedAt?: string
  convertedMemberId?: string  // link với member khi user upgrade lên 99K
  note?: string

  // ── Nurture automation ───────────────────────────────────────────────
  /** Step cuối cùng đã gửi email cho lead */
  nurtureStep?: NurtureStep
  /** Timestamp email cuối cùng */
  lastEmailSentAt?: string
  /** Timestamp Telegram nudge admin gần nhất */
  lastAdminNudgeAt?: string
  /** Lead đã bị auto-archive vì quá hạn không phản hồi */
  autoArchivedAt?: string
}

// ── Redis helpers ──────────────────────────────────────────────────────────

async function redisExec(command: unknown[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Redis chưa được cấu hình (UPSTASH_REDIS_REST_URL/_TOKEN)')
  }
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  const json = await res.json()
  return json.result
}

async function rget<T>(key: string): Promise<T | null> {
  const r = await redisExec(['GET', key])
  if (r === null || r === undefined) return null
  return (typeof r === 'string' ? JSON.parse(r) : r) as T
}

async function rset(key: string, value: unknown): Promise<void> {
  await redisExec(['SET', key, JSON.stringify(value)])
}

// ── CRUD ───────────────────────────────────────────────────────────────────

export async function getFreeLeads(): Promise<FreeLead[]> {
  return (await rget<FreeLead[]>(KEY)) || []
}

export async function getFreeLeadByEmail(
  email: string
): Promise<FreeLead | undefined> {
  const leads = await getFreeLeads()
  return leads.find((l) => l.email === email.toLowerCase().trim())
}

/**
 * Add hoặc update lead (idempotent theo email).
 * Nếu email đã tồn tại → giữ nguyên status, chỉ update tên/SĐT/source nếu đầy đủ hơn.
 */
export async function upsertFreeLead(
  input: Pick<FreeLead, 'name' | 'email' | 'phone' | 'source'>
): Promise<{ lead: FreeLead; isNew: boolean }> {
  const leads = await getFreeLeads()
  const email = input.email.toLowerCase().trim()
  const idx = leads.findIndex((l) => l.email === email)

  if (idx >= 0) {
    const existing = leads[idx]
    const merged: FreeLead = {
      ...existing,
      name: existing.name || input.name,
      phone: existing.phone || input.phone,
      source: existing.source || input.source,
    }
    leads[idx] = merged
    await rset(KEY, leads)
    return { lead: merged, isNew: false }
  }

  const newLead: FreeLead = {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36),
    name: input.name.trim(),
    email,
    phone: input.phone?.trim() || undefined,
    source: input.source || '/free',
    createdAt: new Date().toISOString(),
    status: 'new',
  }
  leads.push(newLead)
  await rset(KEY, leads)
  return { lead: newLead, isNew: true }
}

export async function updateFreeLead(
  id: string,
  patch: Partial<
    Pick<
      FreeLead,
      | 'status'
      | 'note'
      | 'convertedMemberId'
      | 'nurtureStep'
      | 'lastEmailSentAt'
      | 'lastAdminNudgeAt'
      | 'autoArchivedAt'
    >
  >
): Promise<FreeLead | null> {
  const leads = await getFreeLeads()
  const idx = leads.findIndex((l) => l.id === id)
  if (idx < 0) return null

  const now = new Date().toISOString()
  const next: FreeLead = { ...leads[idx], ...patch }

  // Auto-set timestamps khi status đổi
  if (patch.status === 'contacted' && !next.contactedAt) next.contactedAt = now
  if (patch.status === 'converted' && !next.convertedAt) next.convertedAt = now

  leads[idx] = next
  await rset(KEY, leads)
  return next
}

export async function deleteFreeLead(id: string): Promise<boolean> {
  const leads = await getFreeLeads()
  const filtered = leads.filter((l) => l.id !== id)
  if (filtered.length === leads.length) return false
  await rset(KEY, filtered)
  return true
}

// ── Stats helper ───────────────────────────────────────────────────────────

export interface FreeLeadStats {
  total: number
  new: number
  contacted: number
  converted: number
  lost: number
  conversionRate: number  // converted / total (0..1)
  last7days: number
  last30days: number
}

export async function getFreeLeadStats(): Promise<FreeLeadStats> {
  const leads = await getFreeLeads()
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const stats: FreeLeadStats = {
    total: leads.length,
    new: 0,
    contacted: 0,
    converted: 0,
    lost: 0,
    conversionRate: 0,
    last7days: 0,
    last30days: 0,
  }

  for (const l of leads) {
    stats[l.status]++
    const t = new Date(l.createdAt).getTime()
    if (now - t < 7 * day) stats.last7days++
    if (now - t < 30 * day) stats.last30days++
  }

  stats.conversionRate = stats.total > 0 ? stats.converted / stats.total : 0
  return stats
}
