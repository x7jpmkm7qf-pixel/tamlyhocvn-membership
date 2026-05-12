/**
 * PayOS Webhook Handler
 *
 * PayOS gọi endpoint này khi phát hiện thanh toán thành công.
 * URL cần điền vào PayOS Dashboard: https://www.tamlyhocvn.club/api/webhook/payos
 *
 * Tài liệu: https://payos.vn/docs/du-lieu-webhook/
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMemberByOrderCode, saveMember } from '@/lib/data'
import { verifyPayOSWebhook, PayOSWebhookData } from '@/lib/payos'
import { notifyPaymentConfirmed } from '@/lib/telegram'
import { sendPurchaseEvent } from '@/lib/fb-capi'
import { sendTikTokPurchaseEvent } from '@/lib/tiktok-events-api'

interface PayOSWebhookPayload {
  code: string
  desc: string
  success: boolean
  data: PayOSWebhookData
  signature: string
}

export async function POST(req: NextRequest) {
  try {
    const payload: PayOSWebhookPayload = await req.json()
    console.log('[PayOS Webhook]', JSON.stringify(payload, null, 2))

    // ── 1. Xác thực signature ─────────────────────────────
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY
    if (checksumKey) {
      const valid = verifyPayOSWebhook(payload.data, payload.signature, checksumKey)
      if (!valid) {
        console.warn('[PayOS] Signature không hợp lệ!')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // ── 2. Kiểm tra thanh toán thành công ────────────────
    const { data } = payload
    if (payload.code !== '00' || !payload.success) {
      console.log('[PayOS] Giao dịch không thành công:', payload.code, payload.desc)
      return NextResponse.json({ success: true, message: 'Bỏ qua giao dịch không thành công' })
    }

    // ── 3. Kiểm tra số tiền ───────────────────────────────
    const REQUIRED = parseInt(process.env.MEMBERSHIP_PRICE || '99000')
    if (data.amount < REQUIRED) {
      console.log(`[PayOS] Số tiền không đủ: ${data.amount} < ${REQUIRED}`)
      return NextResponse.json({ success: true, message: `Số tiền ${data.amount} chưa đủ` })
    }

    // ── 4. Tìm member theo orderCode ──────────────────────
    const member = await getMemberByOrderCode(data.orderCode)
    if (!member) {
      console.log('[PayOS] Không tìm thấy member với orderCode:', data.orderCode)
      return NextResponse.json({ success: true, message: 'Không tìm thấy đơn hàng' })
    }

    // Tránh kích hoạt lại nếu đã active
    if (member.status === 'active') {
      console.log('[PayOS] Tài khoản đã active:', member.email)
      return NextResponse.json({ success: true, message: 'Tài khoản đã được kích hoạt trước đó' })
    }

    // ── 5. Kích hoạt tài khoản ────────────────────────────
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await saveMember({ ...member, status: 'active', expiresAt })
    console.log('[PayOS] ✅ Kích hoạt thành công:', member.email)

    // ── 6. Gửi Telegram ───────────────────────────────────
    await notifyPaymentConfirmed({
      name:            member.name,
      email:           member.email,
      amount:          data.amount,
      transferContent: data.description,
      referenceCode:   data.reference,
    })

    // ── 7. Gửi Purchase event lên Facebook + TikTok (Server CAPI) ──
    const eventId = `purchase_register_${data.orderCode}`
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const userAgent = req.headers.get('user-agent')

    await Promise.all([
      sendPurchaseEvent({
        user: {
          email: member.email,
          phone: member.phone,
          name: member.name,
          ip,
          userAgent,
          externalId: member.id,
        },
        amount: data.amount,
        sku: 'msl-register',
        productName: 'Mind Sales Lab Membership',
        eventId,
        eventSourceUrl: 'https://www.tamlyhocvn.club/register/success',
      }),
      sendTikTokPurchaseEvent({
        user: {
          email: member.email,
          phone: member.phone,
          ip,
          userAgent,
          externalId: member.id,
        },
        amount: data.amount,
        sku: 'msl-register',
        productName: 'Mind Sales Lab Membership',
        eventId,
        eventSourceUrl: 'https://www.tamlyhocvn.club/register/success',
      }),
    ])

    return NextResponse.json({ success: true, message: `Đã kích hoạt ${member.email}` })

  } catch (err) {
    console.error('[PayOS Webhook] Lỗi:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PayOS gọi GET để verify endpoint còn sống
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Mind Sales Lab — PayOS Webhook' })
}
