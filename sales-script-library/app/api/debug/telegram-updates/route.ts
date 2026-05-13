/**
 * GET /api/debug/telegram-updates?secret=XXX
 * Diagnostic endpoint — gọi Telegram getUpdates để tìm chat_id của user mới bấm /start.
 * Bảo vệ bằng hardcoded pseudo-auth. Xóa sau khi dùng.
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEBUG_KEY = 'tlh-debug-tg-updates-2026-05-13-9k4mqp2zvx8'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== DEBUG_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 500 })
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`)
  const json = await res.json()

  // Extract distinct chat info from updates
  const chats = new Map<number, { id: number; type: string; username?: string; first_name?: string; title?: string }>()
  for (const update of json?.result || []) {
    const chat = update?.message?.chat
    if (chat?.id) {
      chats.set(chat.id, {
        id: chat.id,
        type: chat.type,
        username: chat.username,
        first_name: chat.first_name,
        title: chat.title,
      })
    }
  }

  return NextResponse.json({
    ok: true,
    total_updates: json?.result?.length || 0,
    distinct_chats: Array.from(chats.values()),
  })
}
