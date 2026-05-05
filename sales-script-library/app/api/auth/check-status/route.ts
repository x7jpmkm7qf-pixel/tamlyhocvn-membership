/**
 * GET /api/auth/check-status?email=...
 * Kiểm tra trạng thái tài khoản.
 * Nếu pending → hỏi SePay API → tự activate nếu tìm thấy giao dịch.
 * Nếu active → set session cookie luôn để tự đăng nhập.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMember, saveMember } from '@/lib/data'
import { notifyPaymentConfirmed } from '@/lib/telegram'
import { setMemberCookie, MEMBER_COOKIE_NAME } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const SEPAY_API_TOKEN  = process.env.SEPAY_WEBHOOK_TOKEN
const BANK_ACCOUNT     = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0984899999'
const REQUIRED_AMOUNT  = parseInt(process.env.MEMBERSHIP_PRICE || '99000')

/** MB Bank xóa @ và . trong nội dung CK — chuẩn hóa để so sánh */
function normalizeEmail(email: string) {
  return email.toLowerCase().replace(/[@.]/g, '')
}

/** Kiểm tra SePay API xem có giao dịch khớp với email không */
async function checkSePayForEmail(email: string): Promise<{
  found: boolean
  amount?: number
  referenceCode?: string
  rawContent?: string
}> {
  if (!SEPAY_API_TOKEN) return { found: false }
  try {
    const res = await fetch(
      `https://my.sepay.vn/userapi/transactions/list?account_number=${BANK_ACCOUNT}&limit=20`,
      { headers: { Authorization: `Bearer ${SEPAY_API_TOKEN}` }, cache: 'no-store' }
    )
    const json = await res.json()
    if (!json.transactions) return { found: false }

    const mslTarget = `msl${normalizeEmail(email)}`   // vd: "msldolphingmailcom"

    for (const tx of json.transactions) {
      const content: string = (tx.transaction_content || '').toLowerCase().replace(/[@.\s]/g, '')
      const amount = parseFloat(tx.amount_in || '0')

      if (amount >= REQUIRED_AMOUNT && content.includes(mslTarget)) {
        return { found: true, amount, referenceCode: tx.reference_number, rawContent: tx.transaction_content }
      }
    }
  } catch (e) {
    console.error('[check-status] SePay API lỗi:', e)
  }
  return { found: false }
}

/** Tạo response với session cookie đã set */
function responseWithSession(member: { id: string; name: string; email: string }, body: object) {
  const encoded = setMemberCookie({ id: member.id, name: member.name, email: member.email })
  const res = NextResponse.json(body, {
    headers: { 'Cache-Control': 'no-store' }
  })
  res.cookies.set(MEMBER_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7,  // 7 ngày
    path:     '/',
  })
  return res
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'Thiếu email' }, { status: 400 })
  }

  const member = await getMember(email.toLowerCase().trim())
  if (!member) {
    return NextResponse.json({ status: 'not_found' }, { headers: { 'Cache-Control': 'no-store' } })
  }

  // ── Đã active → set cookie + trả về active ────────────────
  if (member.status === 'active') {
    return responseWithSession(member, { status: 'active', name: member.name })
  }

  // ── Vẫn pending → hỏi SePay API ──────────────────────────
  const tx = await checkSePayForEmail(member.email)
  if (tx.found && tx.amount) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const activated = { ...member, status: 'active' as const, expiresAt, lastReferenceCode: tx.referenceCode }
    await saveMember(activated)
    console.log('[check-status] ✅ Auto-activated:', member.email)

    // Gửi Telegram (không block)
    notifyPaymentConfirmed({
      name:            member.name,
      email:           member.email,
      amount:          tx.amount,
      transferContent: tx.rawContent || '',
      referenceCode:   tx.referenceCode,
    }).catch(e => console.error('[check-status] Telegram lỗi:', e))

    // Set cookie + trả về active
    return responseWithSession(activated, { status: 'active', name: member.name })
  }

  return NextResponse.json(
    { status: 'pending', name: member.name },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  )
}
