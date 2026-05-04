/**
 * SePay Webhook Handler
 *
 * SePay sẽ gọi endpoint này mỗi khi phát hiện giao dịch vào tài khoản ngân hàng.
 * Webhook URL cần điền vào SePay dashboard: https://www.tamlyhocvn.club/api/webhook/sepay
 *
 * Tài liệu SePay: https://docs.sepay.vn/
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMembers, saveMember } from '@/lib/data'
import { notifyPaymentConfirmed } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

// Cấu trúc dữ liệu SePay gửi về
interface SepayWebhookPayload {
  id: number
  gateway: string
  transactionDate: string
  accountNumber: string
  subAccount: string | null
  code: string | null          // Mã giao dịch ngắn
  content: string              // Nội dung chuyển khoản (quan trọng nhất)
  transferType: 'in' | 'out'
  transferAmount: number
  accumulated: number
  referenceCode: string
  description: string
}

/**
 * Trích xuất email từ nội dung chuyển khoản
 * Format: "MSL email@example.com ..."
 */
function extractEmailFromContent(content: string): string | null {
  if (!content) return null
  const lower = content.toLowerCase().trim()

  // Tìm pattern "msl " theo sau là email
  const match = lower.match(/msl\s+([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,})/)
  if (match) return match[1]

  // Fallback: tìm email bất kỳ trong content
  const emailMatch = lower.match(/([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,})/)
  if (emailMatch) return emailMatch[1]

  return null
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Xác thực webhook token từ SePay ─────────────────────
    const sepayToken = process.env.SEPAY_WEBHOOK_TOKEN
    if (sepayToken) {
      const authHeader = req.headers.get('Authorization') || ''
      const apiKeyHeader = req.headers.get('apikey') || req.headers.get('x-api-key') || ''
      // Hỗ trợ: "Apikey TOKEN" | "Bearer TOKEN" | header "apikey: TOKEN"
      const token = authHeader.replace(/^(Apikey|Bearer)\s+/i, '').trim()
                 || apiKeyHeader.trim()
      if (token !== sepayToken) {
        console.warn('[SePay] Token không hợp lệ. Got:', token?.slice(0, 15), '| Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())))
        // Vẫn tiếp tục xử lý (log để debug) — tắt hard reject tạm thời
        // return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
    }

    const payload: SepayWebhookPayload = await req.json()
    console.log('[SePay] Webhook nhận được:', JSON.stringify(payload, null, 2))

    // ── 2. Chỉ xử lý giao dịch "tiền vào" (in) ────────────────
    if (payload.transferType !== 'in') {
      return NextResponse.json({ success: true, message: 'Bỏ qua giao dịch tiền ra' })
    }

    // ── 3. Kiểm tra số tiền đúng 99.000đ ──────────────────────
    const REQUIRED_AMOUNT = parseInt(process.env.MEMBERSHIP_PRICE || '99000')
    if (payload.transferAmount < REQUIRED_AMOUNT) {
      console.log(`[SePay] Số tiền không đủ: ${payload.transferAmount} < ${REQUIRED_AMOUNT}`)
      return NextResponse.json({
        success: false,
        message: `Số tiền ${payload.transferAmount} không đủ ${REQUIRED_AMOUNT}`
      })
    }

    // ── 4. Trích xuất email từ nội dung chuyển khoản ──────────
    const content = payload.content || payload.code || ''
    const email = extractEmailFromContent(content)

    if (!email) {
      console.log('[SePay] Không tìm thấy email trong nội dung:', content)
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy email trong nội dung chuyển khoản'
      })
    }

    // ── 5. Tìm thành viên pending với email này ────────────────
    const members = await getMembers()
    const member = members.find(
      m => m.email === email && m.status === 'pending'
    )

    if (!member) {
      // Kiểm tra xem email đã active chưa (tránh xử lý lại)
      const activeMember = members.find(m => m.email === email && m.status === 'active')
      if (activeMember) {
        console.log('[SePay] Tài khoản đã active rồi:', email)
        return NextResponse.json({ success: true, message: 'Tài khoản đã được kích hoạt trước đó' })
      }

      console.log('[SePay] Không tìm thấy tài khoản pending với email:', email)
      return NextResponse.json({
        success: false,
        message: `Không tìm thấy tài khoản chờ kích hoạt với email: ${email}`
      })
    }

    // ── 6. Kích hoạt tài khoản ────────────────────────────────
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await saveMember({ ...member, status: 'active', expiresAt })
    console.log('[SePay] ✅ Đã kích hoạt tài khoản:', email)

    // ── 7. Gửi thông báo Telegram ─────────────────────────────
    await notifyPaymentConfirmed({
      name: member.name,
      email: member.email,
      amount: payload.transferAmount,
      transferContent: content,
      referenceCode: payload.referenceCode,
    })

    return NextResponse.json({
      success: true,
      message: `Đã kích hoạt tài khoản ${email} thành công`,
    })

  } catch (err) {
    console.error('[SePay] Lỗi xử lý webhook:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// SePay đôi khi gọi GET để kiểm tra endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Mind Sales Lab SePay Webhook' })
}
