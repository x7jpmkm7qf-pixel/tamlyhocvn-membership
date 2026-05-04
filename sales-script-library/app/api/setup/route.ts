/**
 * Setup helper API — chỉ dùng trong quá trình cài đặt
 * Kiểm tra kết nối Telegram và SePay
 * Truy cập: /api/setup?token=ADMIN_PASSWORD
 */
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Bảo vệ bằng admin password
  const token = req.nextUrl.searchParams.get('token')
  if (token !== (process.env.ADMIN_PASSWORD || 'admin2024')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  // ── Test Telegram ────────────────────────────────────────
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (botToken) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
      const data = await res.json()
      results.telegram_bot = { ok: data.ok, bot_name: data.result?.first_name, username: data.result?.username }

      if (chatId) {
        // Gửi tin nhắn test
        const testRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '✅ <b>Mind Sales Lab</b> — Kết nối Telegram thành công!\n\nBạn sẽ nhận thông báo ở đây khi có đăng ký mới.',
            parse_mode: 'HTML',
          }),
        })
        const testData = await testRes.json()
        results.telegram_send = { ok: testData.ok, chat_id: chatId }
      } else {
        results.telegram_send = { ok: false, error: 'TELEGRAM_CHAT_ID chưa được cấu hình' }
      }
    } catch (e) {
      results.telegram_bot = { ok: false, error: String(e) }
    }
  } else {
    results.telegram_bot = { ok: false, error: 'TELEGRAM_BOT_TOKEN chưa được cấu hình' }
  }

  // ── Test SePay Webhook config ────────────────────────────
  results.sepay = {
    webhook_url: 'https://www.tamlyhocvn.club/api/webhook/sepay',
    token_configured: !!process.env.SEPAY_WEBHOOK_TOKEN,
    note: process.env.SEPAY_WEBHOOK_TOKEN
      ? 'Token đã cấu hình ✅'
      : 'Chưa có SEPAY_WEBHOOK_TOKEN — webhook sẽ không verify token (kém bảo mật)',
  }

  // ── Env summary ──────────────────────────────────────────
  results.env = {
    TELEGRAM_BOT_TOKEN: botToken ? `${botToken.slice(0, 10)}...` : '❌ chưa có',
    TELEGRAM_CHAT_ID: chatId || '❌ chưa có',
    SEPAY_WEBHOOK_TOKEN: process.env.SEPAY_WEBHOOK_TOKEN ? '✅ đã có' : '❌ chưa có',
    MEMBERSHIP_PRICE: process.env.MEMBERSHIP_PRICE || '99000 (default)',
  }

  return NextResponse.json(results, { status: 200 })
}
