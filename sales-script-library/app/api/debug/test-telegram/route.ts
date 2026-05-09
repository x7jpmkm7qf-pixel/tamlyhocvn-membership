/**
 * GET /api/debug/test-telegram?secret=XXX
 * Diagnostic endpoint — tests Telegram delivery directly + returns the
 * Telegram API response so chúng ta nhìn được error nếu có.
 *
 * Bảo vệ bằng CRON_SECRET (cùng pattern với cron endpoint).
 * Sau khi debug xong, có thể xóa file này hoặc giữ làm health check.
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  const diag: Record<string, unknown> = {
    has_token: !!token,
    has_chat_id: !!chatId,
    token_prefix: token ? token.slice(0, 10) + '...' : null,
    chat_id: chatId || null,
  }

  if (!token || !chatId) {
    return NextResponse.json({ ok: false, diag, error: 'Missing env' })
  }

  // Test 1: simple plain text message
  const test1 = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '🧪 Test 1/3 — plain text — ' + new Date().toISOString(),
      }),
    }
  )
  diag.test1_status = test1.status
  diag.test1_body = await test1.json().catch(() => null)

  // Test 2: HTML parse mode
  const test2 = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        parse_mode: 'HTML',
        text: '🧪 Test 2/3 — HTML mode — <b>bold</b> + <code>monospace</code>',
      }),
    }
  )
  diag.test2_status = test2.status
  diag.test2_body = await test2.json().catch(() => null)

  // Test 3: HTML + inline keyboard
  const test3 = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        parse_mode: 'HTML',
        text: '🧪 Test 3/3 — HTML + inline keyboard',
        reply_markup: {
          inline_keyboard: [
            [{ text: '💬 Test button (zalo.me)', url: 'https://zalo.me/0858181950' }],
          ],
        },
      }),
    }
  )
  diag.test3_status = test3.status
  diag.test3_body = await test3.json().catch(() => null)

  return NextResponse.json({ ok: true, diag })
}
