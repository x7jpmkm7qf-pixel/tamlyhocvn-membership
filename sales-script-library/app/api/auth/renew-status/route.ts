/**
 * GET /api/auth/renew-status?email=...
 * Dành cho luồng gia hạn: kiểm tra SePay xem có giao dịch MỚI không.
 * "Mới" = referenceCode khác với lần thanh toán cuối (lastReferenceCode).
 * Khi tìm thấy → gia hạn thêm 30 ngày (tính từ expiresAt hiện tại nếu chưa hết, hoặc từ now nếu đã hết).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMember, saveMember } from '@/lib/data'
import { notifyPaymentConfirmed } from '@/lib/telegram'
import { setMemberCookie, MEMBER_COOKIE_NAME, sessionCookieOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const SEPAY_API_TOKEN = process.env.SEPAY_WEBHOOK_TOKEN
const BANK_ACCOUNT    = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0984899999'
const REQUIRED_AMOUNT = parseInt(process.env.MEMBERSHIP_PRICE || '99000')

function normalizeEmail(email: string) {
  return email.toLowerCase().replace(/[@.]/g, '')
}

async function findNewSePayTransaction(email: string, lastReferenceCode?: string) {
  if (!SEPAY_API_TOKEN) return null
  try {
    const res = await fetch(
      `https://my.sepay.vn/userapi/transactions/list?account_number=${BANK_ACCOUNT}&limit=30`,
      { headers: { Authorization: `Bearer ${SEPAY_API_TOKEN}` }, cache: 'no-store' }
    )
    const json = await res.json()
    if (!json.transactions) return null

    const target = `msl${normalizeEmail(email)}`

    for (const tx of json.transactions) {
      const content: string = (tx.transaction_content || '').toLowerCase().replace(/[@.\s]/g, '')
      const amount = parseFloat(tx.amount_in || '0')
      const refCode: string = tx.reference_number || ''

      if (
        amount >= REQUIRED_AMOUNT &&
        content.includes(target) &&
        refCode !== lastReferenceCode   // phải là giao dịch MỚI
      ) {
        return { amount, referenceCode: refCode, rawContent: tx.transaction_content }
      }
    }
  } catch (e) {
    console.error('[renew-status] SePay lỗi:', e)
  }
  return null
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Thiếu email' }, { status: 400 })

  const member = await getMember(email.toLowerCase().trim())
  if (!member) return NextResponse.json({ status: 'not_found' }, { headers: { 'Cache-Control': 'no-store' } })

  const tx = await findNewSePayTransaction(member.email, member.lastReferenceCode)

  if (!tx) {
    return NextResponse.json(
      { status: 'waiting', name: member.name },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // Tính expiresAt mới: nếu chưa hết hạn thì cộng 30 ngày từ expiresAt cũ (gia hạn sớm)
  // Nếu đã hết hạn thì cộng 30 ngày từ bây giờ
  const currentExpiry = member.expiresAt ? new Date(member.expiresAt) : new Date(0)
  const base = currentExpiry > new Date() ? currentExpiry : new Date()
  const newExpiresAt = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const renewed = {
    ...member,
    status:            'active' as const,
    expiresAt:         newExpiresAt,
    lastReferenceCode: tx.referenceCode,
  }
  await saveMember(renewed)
  console.log('[renew-status] ✅ Gia hạn thành công:', member.email, '→', newExpiresAt)

  // Telegram notification (non-blocking)
  notifyPaymentConfirmed({
    name:            member.name,
    email:           member.email,
    amount:          tx.amount,
    transferContent: tx.rawContent || '',
    referenceCode:   tx.referenceCode,
  }).catch(e => console.error('[renew-status] Telegram lỗi:', e))

  // Set session cookie
  const encoded = setMemberCookie({ id: member.id, name: member.name, email: member.email })
  const res = NextResponse.json(
    { status: 'renewed', name: member.name, expiresAt: newExpiresAt },
    { headers: { 'Cache-Control': 'no-store' } }
  )
  res.cookies.set(MEMBER_COOKIE_NAME, encoded, sessionCookieOptions(60 * 60 * 24 * 7))
  return res
}
