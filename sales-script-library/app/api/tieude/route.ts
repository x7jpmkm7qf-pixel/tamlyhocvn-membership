/**
 * POST /api/tieude
 * Tiểu Đệ chatbot — đệ tử ảo của sư phụ Hán Văn Sơn,
 * kèm cặp sư huynh / sư tỷ trong quá trình tu luyện hằng ngày.
 *
 * Khác với /api/chat (OpenAI sales-info bot dành cho landing-page visitor),
 * route này dùng Claude Haiku 4.5 — chỉ phục vụ học viên đã login.
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(process.cwd(), 'lib', 'tieude-system-prompt.txt'),
  'utf-8'
)

const MOCK = process.env.TIEUDE_MOCK === '1'
const MODEL = process.env.TIEUDE_MODEL || 'claude-haiku-4-5-20251001'
const MAX_TOKENS = parseInt(process.env.TIEUDE_MAX_TOKENS || '400', 10)

const client = MOCK
  ? null
  : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface UserContext {
  user_name?: string
  user_gender?: 'm' | 'f' | 'unknown'
  streak_days?: number
  today_missions?: string[]
  completed_today?: string[]
  current_lesson?: string
  last_visit?: string
  lesson_kb?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const rateMap = new Map<string, number[]>()
function rateLimit(ip: string): boolean {
  const now = Date.now()
  const arr = (rateMap.get(ip) || []).filter((t) => now - t < 60_000)
  if (arr.length >= 30) return false
  arr.push(now)
  rateMap.set(ip, arr)
  return true
}

function buildContextBlock(ctx: UserContext): string {
  return `<context>
user_name: ${ctx.user_name || 'Sư huynh ẩn danh'}
user_gender: ${ctx.user_gender || 'unknown'}
streak_days: ${ctx.streak_days ?? 0}
today_missions: ${JSON.stringify(ctx.today_missions || [])}
completed_today: ${JSON.stringify(ctx.completed_today || [])}
current_lesson: ${ctx.current_lesson || 'chưa chọn bài'}
last_visit: ${ctx.last_visit || 'lần đầu'}
lesson_kb: ${(ctx.lesson_kb || '').slice(0, 2000)}
</context>`
}

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({
      role: m.role,
      content: String(m.content || '').slice(0, 2000),
    }))
    .slice(-12)
}

function mockReply(messages: ChatMessage[], ctx: UserContext): string {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || ''
  const xh = ctx.user_gender === 'f' ? 'sư tỷ' : 'sư huynh'
  if (last.includes('nhiệm vụ')) {
    return `📜 Hôm nay ${xh} có ${ctx.today_missions?.length || 0} nhiệm vụ. Bắt đầu nhé? (MOCK MODE)`
  }
  if (last.includes('kịch bản') || last.includes('sales')) {
    return `📜 Tàng kinh các có rất nhiều kịch bản sales theo ngành — ${xh} đang quan tâm ngành nào ạ? (MOCK MODE)`
  }
  if (last.includes('xin chào') || /^chào\b/.test(last) || /\b(hi|hello)\b/.test(last)) {
    return `🙇‍♂️ ${xh} chào tiểu đệ rồi! Em là Tiểu Đệ, đệ tử của sư phụ Hán Văn Sơn. (MOCK MODE)`
  }
  return `📜 Tiểu đệ đã nhận tin: "${last.slice(0, 80)}". Đây là MOCK MODE — set ANTHROPIC_API_KEY để bot trả lời thông minh.`
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anon'

    if (!rateLimit(ip)) {
      return NextResponse.json(
        {
          reply: '🍵 Tiểu đệ đang nghỉ tay một chút, sư huynh đợi 1 phút rồi chat lại nhé.',
        },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const messages = body?.messages as ChatMessage[] | undefined
    const userContext: UserContext = body?.userContext || {}

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { reply: '🙏 Sư huynh chưa gõ gì, tiểu đệ chưa hiểu.' },
        { status: 400 }
      )
    }

    const safe = sanitizeMessages(messages)

    if (MOCK) {
      return NextResponse.json({ reply: mockReply(safe, userContext), mock: true })
    }

    if (!process.env.ANTHROPIC_API_KEY?.trim()) {
      return NextResponse.json(
        {
          reply:
            "🙏 Tiểu đệ chưa được sư phụ trao 'lệnh bài' (API key). Sư huynh nhắn sư phụ giúp em với?",
        },
        { status: 500 }
      )
    }

    const response = await client!.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
        {
          type: 'text',
          text: buildContextBlock(userContext),
        },
      ],
      messages: safe,
    })

    const reply =
      (response.content?.[0] as { type: string; text?: string })?.text ||
      '🙏 Tiểu đệ chưa nghe rõ, sư huynh nói lại nhé?'

    return NextResponse.json({ reply, usage: response.usage })
  } catch (err) {
    console.error('[Tiểu Đệ] error:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      {
        reply:
          '🙏 Tiểu đệ vừa lỡ tay đánh rơi chén trà... Sư huynh chat lại giúp em với?',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, model: MODEL, mock: MOCK })
}
