/**
 * Lead & Application storage cho PRO Bootcamp + 1:1 Mentoring
 * Dùng Upstash Redis — cùng pattern với lib/data.ts
 */

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

const BOOTCAMP_KEY  = 'msl:bootcamp_leads'
const MENTORING_KEY = 'msl:mentoring_apps'

// ── Types ──────────────────────────────────────────────────────────────────

export interface BootcampLead {
  id: string
  name: string
  email: string
  phone: string
  industry: string
  note?: string
  status: 'pending' | 'paid'
  createdAt: string
  paidAt?: string
  referenceCode?: string
}

export interface MentoringApplication {
  id: string
  name: string
  email: string
  phone: string
  industry: string
  experience?: string
  currentProblem: string
  goal: string
  status: 'applied' | 'approved' | 'paid'
  createdAt: string
  paidAt?: string
  referenceCode?: string
}

// ── Redis helpers ──────────────────────────────────────────────────────────

async function redisExec(command: unknown[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Redis chưa được cấu hình')
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

// ── Bootcamp Lead CRUD ─────────────────────────────────────────────────────

export async function getBootcampLeads(): Promise<BootcampLead[]> {
  return (await rget<BootcampLead[]>(BOOTCAMP_KEY)) || []
}

export async function getBootcampLead(email: string): Promise<BootcampLead | undefined> {
  const leads = await getBootcampLeads()
  return leads.find(l => l.email === email.toLowerCase().trim())
}

export async function saveBootcampLead(lead: BootcampLead): Promise<void> {
  const leads = await getBootcampLeads()
  const idx = leads.findIndex(l => l.id === lead.id)
  if (idx >= 0) leads[idx] = lead
  else leads.push(lead)
  await rset(BOOTCAMP_KEY, leads)
}

// ── Mentoring Application CRUD ─────────────────────────────────────────────

export async function getMentoringApplications(): Promise<MentoringApplication[]> {
  return (await rget<MentoringApplication[]>(MENTORING_KEY)) || []
}

export async function getMentoringApplication(email: string): Promise<MentoringApplication | undefined> {
  const apps = await getMentoringApplications()
  return apps.find(a => a.email === email.toLowerCase().trim())
}

export async function saveMentoringApplication(app: MentoringApplication): Promise<void> {
  const apps = await getMentoringApplications()
  const idx = apps.findIndex(a => a.id === app.id)
  if (idx >= 0) apps[idx] = app
  else apps.push(app)
  await rset(MENTORING_KEY, apps)
}
