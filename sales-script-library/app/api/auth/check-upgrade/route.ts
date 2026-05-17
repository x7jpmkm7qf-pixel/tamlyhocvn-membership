/**
 * GET /api/auth/check-upgrade?email=...
 * Kiểm tra xem member đã chuyển khoản 266k/365k để nâng cấp Nội Môn chưa.
 * Nếu có → set tier='noimon', expiresAt = 10 năm (lifetime), trả về { tier: 'noimon' }
 * Nếu chưa → trả về { tier: <hiện tại> } (ngoaimon/undefined)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMember, saveMember } from '@/lib/data'
import { notifyPaymentConfirmed } from '@/lib/telegram'
import { sendNoiMonDelivery } from '@/lib/email'

export const dynamic = 'force-dynamic'

const SEPAY_API_TOKEN = process.env.SEPAY_WEBHOOK_TOKEN
const BANK_ACCOUNT    = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0984899999'
const UPGRADE_MIN     = parseInt(process.env.NOIMON_MIN_PRICE || '266000')
// Lifetime = ~10 năm
const LIFETIME_MS     = 10 * 365 * 24 * 60 * 60 * 1000

function normalizeEmail(email: string) {
  return email.toLowerCase().replace(/[@.]/g, '')
}

async function checkSePayForUpgrade(email: string, memberCreatedAt: string): Promise<{
  found: boolean
  amount?: number
  referenceCode?: string
  rawContent?: string
}> {
  if (!SEPAY_API_TOKEN) return { found: false }
  try {
    const res = await fetch(
      `https://my.sepay.vn/userapi/transactions/list?account_number=${BANK_ACCOUNT}&limit=30`,
      { headers: { Authorization: `Bearer ${SEPAY_API_TOKEN}` }, cache: 'no-store' }
    )
    const json = await res.json()
    if (!json.transactions) return { found: false }

    const mslTarget = `msl${normalizeEmail(email)}`
    const memberCreatedMs = new Date(memberCreatedAt).getTime()

    for (const tx of json.transactions) {
      const content: string = (tx.transaction_content || '').toLowerCase().replace(/[@.\s]/g, '')
      const amount = parseFloat(tx.amount_in || '0')

      // Chặn match giao dịch xảy ra TRƯỚC khi member đăng ký — tránh false-positive
      // khi cùng email đã có thanh toán Nội Môn từ session test cũ.
      const txDateRaw = tx.transaction_date || tx.created_at || ''
      const txMs = txDateRaw ? new Date(txDateRaw).getTime() : 0
      const isAfterRegister = txMs > 0 && txMs >= memberCreatedMs

      if (amount >= UPGRADE_MIN && content.includes(mslTarget) && isAfterRegister) {
        return { found: true, amount, referenceCode: tx.reference_number, rawContent: tx.transaction_content }
      }
    }
  } catch (e) {
    console.error('[check-upgrade] SePay API lỗi:', e)
  }
  return { found: false }
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

  // Đã là Nội Môn rồi → trả về luôn
  if (member.tier === 'noimon') {
    return NextResponse.json(
      { status: member.status || 'active', tier: 'noimon', name: member.name },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // Chưa Nội Môn → hỏi SePay xem đã có giao dịch 266k+ chưa
  // Truyền createdAt để chặn match giao dịch CŨ trước thời điểm member đăng ký
  const tx = await checkSePayForUpgrade(member.email, member.createdAt)
  if (tx.found && tx.amount) {
    const upgradedAt = new Date().toISOString()
    const expiresAt  = new Date(Date.now() + LIFETIME_MS).toISOString()
    const upgraded = {
      ...member,
      status: 'active' as const,
      tier: 'noimon' as const,
      expiresAt,
      upgradedAt,
      upgradeReferenceCode: tx.referenceCode,
    }
    await saveMember(upgraded)
    console.log('[check-upgrade] ✅ Upgraded to Nội Môn:', member.email)

    notifyPaymentConfirmed({
      name:            `${member.name} (NÂNG CẤP NỘI MÔN)`,
      email:           member.email,
      amount:          tx.amount,
      transferContent: tx.rawContent || '',
      referenceCode:   tx.referenceCode,
    }).catch(e => console.error('[check-upgrade] Telegram lỗi:', e))

    // Gửi email chào mừng Nội Môn
    sendNoiMonDelivery({ to: member.email, name: member.name })
      .then(r => {
        if (r.ok) console.log('[check-upgrade] 🏯 Đã gửi welcome Nội Môn cho:', member.email)
        else console.error('[check-upgrade] Nội Môn delivery failed:', r.error)
      })
      .catch(e => console.error('[check-upgrade] Nội Môn delivery exception:', e))

    return NextResponse.json(
      { status: 'active', tier: 'noimon', name: member.name },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return NextResponse.json(
    { status: member.status || 'pending', tier: member.tier || 'ngoaimon', name: member.name },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  )
}
