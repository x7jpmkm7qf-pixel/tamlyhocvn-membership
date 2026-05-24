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
import { ensureAffiliateCode, getMemberByAffCode, createCommission } from '@/lib/affiliate'
import { notifyPaymentConfirmed } from '@/lib/telegram'
import { sendPurchaseEvent } from '@/lib/fb-capi'
import { sendTikTokPurchaseEvent } from '@/lib/tiktok-events-api'
import { sendKhauQuyetDelivery, sendNoiMonDelivery } from '@/lib/email'

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
 * Trích xuất email và prefix sản phẩm từ nội dung chuyển khoản.
 *
 * Hỗ trợ 2 prefix:
 *   - "KQ <email>" — Khẩu Quyết Phá Phản Đối (199k)
 *   - "MSL <email>" — Mind Sales Lab Membership (99k/tháng)
 *
 * Email có thể bị MB Bank strip @ và . — normalize bằng cách compare normalized email.
 */
function extractEmailFromContent(content: string, allMemberEmails: string[]): { email: string | null; prefix: 'KQ' | 'MSL' | null } {
  if (!content) return { email: null, prefix: null }
  const lower = content.toLowerCase().trim()

  // Phát hiện prefix
  const prefix: 'KQ' | 'MSL' | null = /\bkq\b/.test(lower) ? 'KQ'
                                    : /\bmsl\b/.test(lower) ? 'MSL'
                                    : null

  // Thử match email đầy đủ trong content (chuyển khoản giữ nguyên @ .)
  const emailMatch = lower.match(/([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,})/)
  if (emailMatch) return { email: emailMatch[1], prefix }

  // MB Bank strip @ . — match normalized email với danh sách member
  const stripped = lower.replace(/[^a-z0-9]/g, '')
  for (const memberEmail of allMemberEmails) {
    const normalized = memberEmail.toLowerCase().replace(/[@.]/g, '')
    if (normalized && stripped.includes(normalized)) {
      return { email: memberEmail, prefix }
    }
  }

  return { email: null, prefix }
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

    // ── 3. Lấy member list (cần để extract email trong case MB Bank strip @ .) ─
    const members = await getMembers()

    // ── 4. Trích xuất email + prefix từ nội dung chuyển khoản ──
    const content = payload.content || payload.code || ''
    const { email, prefix } = extractEmailFromContent(content, members.map(m => m.email))

    if (!email) {
      console.log('[SePay] Không tìm thấy email trong nội dung:', content)
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy email trong nội dung chuyển khoản'
      })
    }

    // ── 5. Kiểm tra số tiền tối thiểu — tuỳ theo prefix ────────
    // KQ (Khẩu Quyết) phải ≥ 199k. MSL (Membership) ≥ 99k. UPGRADE_MIN (≥300k) → Nội Môn (cả 2 prefix).
    // UPGRADE_MIN giữ env fallback 266k để khách hàng cũ chuyển voucher 266k vẫn được activate Nội Môn.
    const KHAUQUYET_MIN   = parseInt(process.env.KHAUQUYET_PRICE   || '199000')
    const MEMBERSHIP_MIN  = parseInt(process.env.MEMBERSHIP_PRICE  || '99000')
    const UPGRADE_MIN     = parseInt(process.env.NOIMON_MIN_PRICE  || '266000')

    // Nếu prefix = KQ: yêu cầu ≥ 199k (trừ khi ≥ 266k thì là Nội Môn — ok)
    // Nếu prefix = MSL hoặc null: yêu cầu ≥ 99k
    const productMin = prefix === 'KQ' ? KHAUQUYET_MIN : MEMBERSHIP_MIN
    if (payload.transferAmount < productMin && payload.transferAmount < UPGRADE_MIN) {
      console.log(`[SePay] Số tiền không đủ cho prefix ${prefix || 'unknown'}: ${payload.transferAmount} < ${productMin}`)
      return NextResponse.json({
        success: false,
        message: `Số tiền ${payload.transferAmount} không đủ ${productMin} cho sản phẩm ${prefix || 'unknown'}`
      })
    }

    // ── 6. Tìm thành viên với email này ────────────────────────
    const member = members.find(m => m.email === email)

    if (!member) {
      console.log('[SePay] Không tìm thấy tài khoản với email:', email)
      return NextResponse.json({
        success: false,
        message: `Không tìm thấy tài khoản với email: ${email}`
      })
    }

    // ── 6. Phân nhánh theo TIER GIÁ (amount-based routing) ──
    // Routing rules:
    //   - Đã noimon active        → no-op (đã trọn đời)
    //   - amount ≥ 266k + pending → "noimon-direct" (trọn gói 365k hoặc 266k thẳng, chưa từng active)
    //   - amount ≥ 266k + active  → "noimon-upgrade" (nâng cấp từ ngoaimon)
    //   - amount < 266k + pending → "ngoaimon-activate" (Khẩu Quyết 99k)
    //   - còn lại                 → no-op (renewal 99k đã handle ở /api/auth/renew-status)
    if (member.status === 'active' && member.tier === 'noimon') {
      console.log('[SePay] Tài khoản đã là Nội Môn rồi:', email)
      return NextResponse.json({ success: true, message: 'Tài khoản đã ở tier Nội Môn' })
    }

    const wantsNoiMon = payload.transferAmount >= UPGRADE_MIN
    type Action = 'noimon-direct' | 'noimon-upgrade' | 'ngoaimon-activate' | 'noop'
    let action: Action = 'noop'
    if (member.status === 'pending' && wantsNoiMon) action = 'noimon-direct'
    else if (member.status === 'active' && wantsNoiMon) action = 'noimon-upgrade'
    else if (member.status === 'pending') action = 'ngoaimon-activate'

    if (action === 'noop') {
      console.log('[SePay] Không có hành động phù hợp cho:', email, 'status:', member.status, 'tier:', member.tier, 'amount:', payload.transferAmount)
      return NextResponse.json({ success: true, message: 'Không có hành động phù hợp' })
    }

    const isNoiMon = action === 'noimon-direct' || action === 'noimon-upgrade'

    // Lifetime cho Nội Môn = 10 năm, Khẩu Quyết = 30 ngày
    const LIFETIME_MS = 10 * 365 * 24 * 60 * 60 * 1000
    const MONTH_MS    = 30 * 24 * 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + (isNoiMon ? LIFETIME_MS : MONTH_MS)).toISOString()

    const productSlug = action === 'ngoaimon-activate' ? 'khau-quyet'
                    : (action === 'noimon-direct' || action === 'noimon-upgrade') ? 'noi-mon'
                    : null

    const updated = {
      ...member,
      status: 'active' as const,
      expiresAt,
      ...(isNoiMon
        ? { tier: 'noimon' as const, upgradedAt: new Date().toISOString(), upgradeReferenceCode: payload.referenceCode }
        : { tier: 'ngoaimon' as const, lastReferenceCode: payload.referenceCode }
      ),
      ...(productSlug ? {
        enrollments: {
          ...member.enrollments,
          [productSlug]: {
            status: 'active' as const,
            enrolledAt: member.enrollments?.[productSlug]?.enrolledAt || new Date().toISOString(),
            source: 'paid' as const,
            activatedAt: new Date().toISOString(),
            referenceCode: payload.referenceCode,
          },
        },
      } : {}),
    }
    await saveMember(updated)
    const actionLabel = action === 'noimon-direct' ? 'Kích hoạt Nội Môn trọn gói'
                     : action === 'noimon-upgrade' ? 'Nâng cấp Nội Môn'
                     : 'Kích hoạt Khẩu Quyết'
    console.log(`[SePay] ✅ ${actionLabel}:`, email)

    // ── Affiliate: generate code for new member + create commission ──
    if (action === 'ngoaimon-activate') {
      await Promise.all([
        ensureAffiliateCode(updated.email)
          .catch(e => console.error('[SePay] affiliate code gen failed:', e)),
        (async () => {
          const refCode = member.referred_by_code
          if (!refCode) {
            console.log('[SePay] no referred_by_code for', updated.email, '— skipping commission')
            return
          }
          const referrer = await getMemberByAffCode(refCode)
          if (!referrer) {
            console.log('[SePay] referrer not found for code', refCode)
            return
          }
          const commission = await createCommission({
            affiliate_email: referrer.email,
            buyer_email:     updated.email,
            order_reference_code: payload.referenceCode,
            order_amount: payload.transferAmount,
          }).catch(e => { console.error('[SePay] commission creation failed:', e); return null })
          if (commission) {
            console.log('[SePay] ✅ Commission created:', commission.commission_amount, 'for', referrer.email)
          }
        })(),
      ])
    }

    // ── 7. Gửi thông báo Telegram ─────────────────────────────
    const notifySuffix = action === 'noimon-direct' ? ' (NỘI MÔN TRỌN GÓI)'
                      : action === 'noimon-upgrade' ? ' (NÂNG CẤP NỘI MÔN)'
                      : ''
    await notifyPaymentConfirmed({
      name: `${member.name}${notifySuffix}`,
      email: member.email,
      amount: payload.transferAmount,
      transferContent: content,
      referenceCode: payload.referenceCode,
    })

    // ── 8. Gửi Purchase event lên Facebook + TikTok (Server CAPI) ──
    const sku = action === 'noimon-direct' ? 'msl-noimon-full'
             : action === 'noimon-upgrade' ? 'msl-noimon-upgrade'
             : 'msl-register'
    const productName = isNoiMon ? 'Tàng Kinh Các Nội Môn' : 'Mind Sales Lab Membership'
    const eventId = `purchase_${sku}_${payload.referenceCode}`
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const userAgent = req.headers.get('user-agent')
    const eventSourceUrl = isNoiMon
      ? 'https://www.tamlyhocvn.club/khau-quyet/nang-cap'
      : 'https://www.tamlyhocvn.club/register/success'

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
        amount: payload.transferAmount,
        sku,
        productName,
        eventId,
        eventSourceUrl,
      }),
      sendTikTokPurchaseEvent({
        user: {
          email: member.email,
          phone: member.phone,
          ip,
          userAgent,
          externalId: member.id,
        },
        amount: payload.transferAmount,
        sku,
        productName,
        eventId,
        eventSourceUrl,
      }),
    ])

    // ── 9. Gửi email delivery: Nội Môn welcome (266k/365k) HOẶC PDF Khẩu Quyết (99k) ──
    const deliveryResult = isNoiMon
      ? await sendNoiMonDelivery({ to: member.email, name: member.name })
      : await sendKhauQuyetDelivery({ to: member.email, name: member.name })
    if (!deliveryResult.ok) {
      console.error(`[SePay] ${isNoiMon ? 'Nội Môn' : 'Khẩu Quyết'} delivery failed:`, deliveryResult.error)
    } else {
      console.log(`[SePay] 📧 Đã gửi ${isNoiMon ? 'email Nội Môn' : 'PDF Khẩu Quyết'} cho:`, member.email)
    }

    return NextResponse.json({
      success: true,
      message: action === 'noimon-direct' ? `Đã kích hoạt ${email} ở tier Nội Môn (trọn gói)`
             : action === 'noimon-upgrade' ? `Đã nâng cấp ${email} lên Nội Môn`
             : `Đã kích hoạt tài khoản ${email}`,
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
