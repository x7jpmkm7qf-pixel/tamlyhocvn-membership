/**
 * POST /api/payment/create
 * Tạo PayOS payment link cho member đang pending
 *
 * Body: { email: string }
 * Returns: { orderCode, paymentLinkId, checkoutUrl, qrCode, amount }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMember, saveMember } from '@/lib/data'
import { createPayOSPayment } from '@/lib/payos'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tamlyhocvn.club'
const AMOUNT   = parseInt(process.env.MEMBERSHIP_PRICE || '99000')

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Thiếu email' }, { status: 400 })
    }

    const member = await getMember(email.toLowerCase().trim())
    if (!member) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 })
    }

    // Nếu đã có payment link còn dùng được → trả về luôn
    if (member.orderCode && member.paymentLinkId) {
      return NextResponse.json({
        orderCode:     member.orderCode,
        paymentLinkId: member.paymentLinkId,
        reused: true,
      })
    }

    // Tạo orderCode độc nhất (số nguyên dương, max 9 chữ số để an toàn)
    const orderCode = Math.floor(Date.now() / 1000) % 999999999 + Math.floor(Math.random() * 100)

    // Description PayOS tối đa 25 ký tự
    const description = `MSL${orderCode}`

    const payosData = await createPayOSPayment({
      orderCode,
      amount:    AMOUNT,
      description,
      buyerName:  member.name,
      buyerEmail: member.email,
      buyerPhone: member.phone,
      returnUrl: `${BASE_URL}/register/success?orderCode=${orderCode}`,
      cancelUrl:  `${BASE_URL}/register/payment?email=${encodeURIComponent(email)}&cancelled=1`,
    })

    // Lưu orderCode + paymentLinkId vào member record
    await saveMember({ ...member, orderCode: payosData.orderCode, paymentLinkId: payosData.paymentLinkId })

    return NextResponse.json({
      orderCode:     payosData.orderCode,
      paymentLinkId: payosData.paymentLinkId,
      checkoutUrl:   payosData.checkoutUrl,
      qrCode:        payosData.qrCode,
      amount:        payosData.amount,
      accountNumber: payosData.accountNumber,
      accountName:   payosData.accountName,
      bin:           payosData.bin,
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Payment/Create]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
