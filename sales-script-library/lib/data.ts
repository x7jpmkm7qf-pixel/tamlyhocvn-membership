import fs from 'fs'
import path from 'path'

export interface Script {
  id: string
  title: string
  industry: string
  situation: string
  preview: string
  content: string
  psychology: string
  examples: string
  createdAt: string
}

export interface ProductEnrollment {
  status: 'pending' | 'active'
  enrolledAt: string
  source?: 'free' | 'paid'
  activatedAt?: string
  referenceCode?: string
}

export interface Member {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  consent?: boolean
  consentAt?: string
  status?: 'pending' | 'active'
  createdAt: string
  expiresAt?: string
  // PayOS payment tracking
  orderCode?: number
  paymentLinkId?: string
  // Email verification
  emailVerified?: boolean
  verificationToken?: string
  verificationTokenExpiresAt?: string
  verificationSentAt?: string
  // Renewal tracking
  lastReferenceCode?: string   // SePay reference of last confirmed payment
  // Tier — ngoaimon (Khẩu Quyết 199k hoặc Membership 99k) vs noimon (Tàng Kinh Các Nội Môn 300k/499k)
  tier?: 'ngoaimon' | 'noimon'
  upgradeReferenceCode?: string  // SePay ref khi nâng cấp lên Nội Môn
  upgradedAt?: string
  // Product — sản phẩm gốc khi member đăng ký. Phân biệt 2 sản phẩm cùng tier ngoaimon:
  // - 'khauquyet': mua trên /khau-quyet (199k, chỉ truy cập PDF Khẩu Quyết qua email)
  // - 'membership': mua trên /register (99k/tháng, truy cập library kịch bản)
  // - undefined: legacy members (treat as 'membership' để không break access cũ)
  product?: 'khauquyet' | 'membership'
  // Per-product enrollment tracking (added 2026-05-17)
  enrollments?: Record<string, ProductEnrollment>
}

// ── File-based storage (read-only, for static content) ─────────────────────

const DATA_DIR = path.join(process.cwd(), 'data')

function readJson<T>(filename: string): T {
  const file = path.join(DATA_DIR, filename)
  if (!fs.existsSync(file)) return [] as unknown as T
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
}

export function getScripts(): Script[] {
  return readJson<Script[]>('scripts.json')
}

export function getScript(id: string): Script | undefined {
  return getScripts().find(s => s.id === id)
}

export function saveScript(script: Script) {
  // Scripts are managed via data/scripts.json in the codebase
  // Write operations are no-ops on Vercel (read-only filesystem)
  console.warn('[saveScript] Filesystem write not supported on Vercel — update scripts.json in codebase')
}

export function deleteScript(id: string) {
  console.warn('[deleteScript] Filesystem write not supported on Vercel — update scripts.json in codebase')
}

export function getRoadmapData(): unknown {
  return readJson<unknown>('roadmap.json')
}

// ── Upstash Redis (for Members — read/write) ───────────────────────────────

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const MEMBERS_KEY = 'msl:members'

async function redisExec(command: unknown[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Redis chưa được cấu hình (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)')
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
  const result = await redisExec(['GET', key])
  if (result === null || result === undefined) return null
  return (typeof result === 'string' ? JSON.parse(result) : result) as T
}

async function rset(key: string, value: unknown): Promise<void> {
  await redisExec(['SET', key, JSON.stringify(value)])
}

// ── Member CRUD (async, Redis) ─────────────────────────────────────────────

export async function getMembers(): Promise<Member[]> {
  const members = await rget<Member[]>(MEMBERS_KEY)
  return members || []
}

export async function getMember(email: string): Promise<Member | undefined> {
  const members = await getMembers()
  return members.find(m => m.email === email)
}

export async function getMemberByOrderCode(orderCode: number): Promise<Member | undefined> {
  const members = await getMembers()
  return members.find(m => m.orderCode === orderCode)
}

export async function getMemberByVerificationToken(token: string): Promise<Member | undefined> {
  const members = await getMembers()
  return members.find(m => m.verificationToken === token)
}

export async function saveMember(member: Member): Promise<void> {
  const members = await getMembers()
  const idx = members.findIndex(m => m.id === member.id)
  if (idx >= 0) members[idx] = member
  else members.push(member)
  await rset(MEMBERS_KEY, members)
}

export async function deleteMember(id: string): Promise<void> {
  const members = (await getMembers()).filter(m => m.id !== id)
  await rset(MEMBERS_KEY, members)
}
