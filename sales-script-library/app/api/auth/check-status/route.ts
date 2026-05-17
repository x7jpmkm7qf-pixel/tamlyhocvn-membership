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
import { sendKhauQuyetDelivery } from '@/lib/email'

export const dynamic = 'force-dynamic'

const SEPAY_API_TOKEN  = process.env.SEPAY_WEBHOOK_TOKEN
const BANK_ACCOUNT     = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0984899999'
const DEFAULT_AMOUNT   = parseInt(process.env.MEMBERSHIP_PRICE || '99000')

/** MB Bank xóa @ và . trong nội dung CK — chuẩn hóa để so sánh */
function normalizeEmail(email: string) {
  return email.toLowerCase().replace(/[@.]/g, '')
}

/**
 * Kiểm tra SePay API xem có giao dịch khớp với email không.
 * @param email — email của member
 * @param requiredAmount — số tiền tối thiểu mà giao dịch phải đạt (199k cho khẩu quyết, 99k cho membership)
 * @param memberCreatedAt — chỉ chấp nhận giao dịch xảy ra SAU thời điểm này (chặn match giao dịch cũ từ session test khác)
 * @param prefix — 'KQ' (Khẩu Quyết) hoặc 'MSL' (Membership). Pattern matching theo prefix tương ứng để tránh
 *                false match giữa 2 sản phẩm. Nếu null/undefined → thử cả 2 prefix.
 */
async function checkSePayForEmail(email: string, requiredAmount: number, memberCreatedAt: string, prefix?: 'KQ' | 'MSL' | null): Promise<{
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

    const emailNorm = normalizeEmail(email)
    const targets: string[] = prefix
      ? [`${prefix.toLowerCase()}${emailNorm}`]
      : [`kq${emailNorm}`, `msl${emailNorm}`]
    const memberCreatedMs = new Date(memberCreatedAt).getTime()

    for (const tx of json.transactions) {
      const content: string = (tx.transaction_content || '').toLowerCase().replace(/[@.\s]/g, '')
      const amount = parseFloat(tx.amount_in || '0')

      // SePay trả về `transaction_date` (ISO string) — chặn match giao dịch xảy ra TRƯỚC khi member đăng ký
      const txDateRaw = tx.transaction_date || tx.created_at || ''
      const txMs = txDateRaw ? new Date(txDateRaw).getTime() : 0
      const isAfterRegister = txMs > 0 && txMs >= memberCreatedMs

      const matchesPattern = targets.some(t => content.includes(t))

      if (amount >= requiredAmount && matchesPattern && isAfterRegister) {
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

  // FE truyền expectedAmount để chặn match giao dịch sai mức giá
  // (vd: khẩu quyết 199k không được activate bởi giao dịch 99k cũ)
  const expectedAmountRaw = req.nextUrl.searchParams.get('expectedAmount')
  const requiredAmount = expectedAmountRaw ? parseInt(expectedAmountRaw) : DEFAULT_AMOUNT
  const safeRequiredAmount = Number.isFinite(requiredAmount) && requiredAmount > 0 ? requiredAmount : DEFAULT_AMOUNT

  // FE truyền prefix (KQ hoặc MSL) để chỉ match đúng pattern sản phẩm hiện tại
  const prefixRaw = req.nextUrl.searchParams.get('prefix')
  const prefix: 'KQ' | 'MSL' | null = prefixRaw === 'KQ' ? 'KQ' : prefixRaw === 'MSL' ? 'MSL' : null

  const member = await getMember(email.toLowerCase().trim())
  if (!member) {
    return NextResponse.json({ status: 'not_found' }, { headers: { 'Cache-Control': 'no-store' } })
  }

  // ── Đã active → set cookie + trả về active ────────────────
  if (member.status === 'active') {
    return responseWithSession(member, { status: 'active', name: member.name })
  }

  // ── Vẫn pending → hỏi SePay API ──────────────────────────
  const tx = await checkSePayForEmail(member.email, safeRequiredAmount, member.createdAt, prefix)
  if (tx.found && tx.amount) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const activated = {
      ...member,
      status: 'active' as const,
      tier: (member.tier || 'ngoaimon') as 'ngoaimon' | 'noimon',
      expiresAt,
      lastReferenceCode: tx.referenceCode,
    }
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

    // Gửi PDF Khẩu Quyết (không block — fire & forget với catch)
    sendKhauQuyetDelivery({ to: member.email, name: member.name })
      .then(r => {
        if (r.ok) console.log('[check-status] 📜 Đã gửi PDF Khẩu Quyết cho:', member.email)
        else console.error('[check-status] PDF delivery failed:', r.error)
      })
      .catch(e => console.error('[check-status] PDF delivery exception:', e))

    // Set cookie + trả về active
    return responseWithSession(activated, { status: 'active', name: member.name })
  }

  return NextResponse.json(
    { status: 'pending', name: member.name },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  )
}
