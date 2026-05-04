/**
 * GET /api/bootcamp/check-status?email=...
 * Poll SePay để phát hiện thanh toán PRO Bootcamp (1,497,000đ)
 * Cùng pattern với /api/auth/check-status nhưng dành cho leads
 */

import { NextRequest, NextResponse } from 'next/server'
import { getBootcampLead, saveBootcampLead } from '@/lib/leads'
import { notifyBootcampPaid } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

const SEPAY_API_TOKEN = process.env.SEPAY_WEBHOOK_TOKEN
const BANK_ACCOUNT    = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0984899999'
const BOOTCAMP_AMOUNT = 1_497_000

function normalizeEmail(email: string) {
  return email.toLowerCase().replace(/[@.]/g, '')
}

async function checkSePayForBootcamp(email: string): Promise<{
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

    // Nội dung chuyển khoản: "PRO email@gmail.com"
    // MB Bank strip @. → "PROemailgmailcom"
    const target = `pro${normalizeEmail(email)}`

    for (const tx of json.transactions) {
      const content: string = (tx.transaction_content || '').toLowerCase().replace(/[@.\s]/g, '')
      const amount = parseFloat(tx.amount_in || '0')
      if (amount >= BOOTCAMP_AMOUNT && content.includes(target)) {
        return { found: true, amount, referenceCode: tx.reference_number, rawContent: tx.transaction_content }
      }
    }
  } catch (e) {
    console.error('[bootcamp/check-status] SePay lỗi:', e)
  }
  return { found: false }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ error: 'Thiếu email' }, { status: 400 })
  }

  const emailNorm = email.toLowerCase().trim()
  const lead = await getBootcampLead(emailNorm)
  if (!lead) {
    return NextResponse.json({ status: 'not_found' }, { headers: { 'Cache-Control': 'no-store' } })
  }

  // Đã paid → trả về luôn
  if (lead.status === 'paid') {
    return NextResponse.json({ status: 'paid', name: lead.name }, { headers: { 'Cache-Control': 'no-store' } })
  }

  // Vẫn pending → hỏi SePay
  const tx = await checkSePayForBootcamp(emailNorm)
  if (tx.found && tx.amount) {
    const updated = { ...lead, status: 'paid' as const, paidAt: new Date().toISOString(), referenceCode: tx.referenceCode }
    await saveBootcampLead(updated)
    console.log('[bootcamp/check-status] ✅ Paid:', emailNorm)

    notifyBootcampPaid({
      name: lead.name, email: lead.email, phone: lead.phone,
      industry: lead.industry, amount: tx.amount,
      transferContent: tx.rawContent || '', referenceCode: tx.referenceCode,
    }).catch(e => console.error('[bootcamp] Telegram lỗi:', e))

    return NextResponse.json({ status: 'paid', name: lead.name }, { headers: { 'Cache-Control': 'no-store' } })
  }

  return NextResponse.json(
    { status: 'pending', name: lead.name },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  )
}
