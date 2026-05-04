/**
 * GET /api/mentoring/check-status?email=...
 * Poll SePay để phát hiện thanh toán 1:1 Mentoring (6,997,000đ)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMentoringApplication, saveMentoringApplication } from '@/lib/leads'
import { notifyMentoringPaid } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

const SEPAY_API_TOKEN  = process.env.SEPAY_WEBHOOK_TOKEN
const BANK_ACCOUNT     = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0984899999'
const MENTORING_AMOUNT = 6_997_000

function normalizeEmail(email: string) {
  return email.toLowerCase().replace(/[@.]/g, '')
}

async function checkSePayForMentoring(email: string): Promise<{
  found: boolean; amount?: number; referenceCode?: string; rawContent?: string
}> {
  if (!SEPAY_API_TOKEN) return { found: false }
  try {
    const res = await fetch(
      `https://my.sepay.vn/userapi/transactions/list?account_number=${BANK_ACCOUNT}&limit=30`,
      { headers: { Authorization: `Bearer ${SEPAY_API_TOKEN}` }, cache: 'no-store' }
    )
    const json = await res.json()
    if (!json.transactions) return { found: false }

    // Nội dung chuyển khoản: "MENTOR email@gmail.com"
    // MB Bank strip @. → "MENTORemailgmailcom"
    const target = `mentor${normalizeEmail(email)}`

    for (const tx of json.transactions) {
      const content: string = (tx.transaction_content || '').toLowerCase().replace(/[@.\s]/g, '')
      const amount = parseFloat(tx.amount_in || '0')
      if (amount >= MENTORING_AMOUNT && content.includes(target)) {
        return { found: true, amount, referenceCode: tx.reference_number, rawContent: tx.transaction_content }
      }
    }
  } catch (e) {
    console.error('[mentoring/check-status] SePay lỗi:', e)
  }
  return { found: false }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'Thiếu email' }, { status: 400 })
  }

  const emailNorm = email.toLowerCase().trim()
  const app = await getMentoringApplication(emailNorm)
  if (!app) {
    return NextResponse.json({ status: 'not_found' }, { headers: { 'Cache-Control': 'no-store' } })
  }

  // Đã paid → trả về luôn
  if (app.status === 'paid') {
    return NextResponse.json({ status: 'paid', name: app.name }, { headers: { 'Cache-Control': 'no-store' } })
  }

  // Vẫn pending → hỏi SePay
  const tx = await checkSePayForMentoring(emailNorm)
  if (tx.found && tx.amount) {
    const updated = { ...app, status: 'paid' as const, paidAt: new Date().toISOString(), referenceCode: tx.referenceCode }
    await saveMentoringApplication(updated)
    console.log('[mentoring/check-status] ✅ Paid:', emailNorm)

    notifyMentoringPaid({
      name: app.name, email: app.email, phone: app.phone,
      industry: app.industry, amount: tx.amount,
      transferContent: tx.rawContent || '', referenceCode: tx.referenceCode,
    }).catch(e => console.error('[mentoring] Telegram lỗi:', e))

    return NextResponse.json({ status: 'paid', name: app.name }, { headers: { 'Cache-Control': 'no-store' } })
  }

  return NextResponse.json(
    { status: 'pending', name: app.name },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  )
}
