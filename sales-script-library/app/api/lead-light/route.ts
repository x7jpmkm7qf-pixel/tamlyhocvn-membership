import { NextRequest, NextResponse } from 'next/server'

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const KEY = 'msl:exit-leads'

async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID?.split(',')[0]?.trim()
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  })
}

interface ExitLead {
  email: string
  source: string
  createdAt: string
}

async function redisExec(command: unknown[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) return null
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  return (await res.json()).result
}

async function getExitLeads(): Promise<ExitLead[]> {
  const result = await redisExec(['GET', KEY])
  if (!result || typeof result !== 'string') return []
  try { return JSON.parse(result) } catch { return [] }
}

async function saveExitLeads(leads: ExitLead[]): Promise<void> {
  await redisExec(['SET', KEY, JSON.stringify(leads)])
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email ?? '').trim().toLowerCase()
    const source = (body.source ?? 'exit_intent').slice(0, 64)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    const leads = await getExitLeads()

    // Deduplicate by email
    if (!leads.find(l => l.email === email)) {
      leads.push({ email, source, createdAt: new Date().toISOString() })
      await saveExitLeads(leads)

      notifyTelegram(
        `📧 *Exit Lead mới*\nEmail: ${email}\nSource: ${source}\nTotal: ${leads.length}`,
      ).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // silent fail — never block the user
  }
}
