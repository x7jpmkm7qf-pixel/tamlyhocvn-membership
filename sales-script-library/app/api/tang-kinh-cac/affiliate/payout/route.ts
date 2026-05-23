import { NextRequest, NextResponse } from 'next/server'
import { getMemberSession } from '@/lib/auth'
import { createPayoutRequest } from '@/lib/affiliate'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = getMemberSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const bank_name      = (body?.bank_name || '').toString().trim()
  const bank_account   = (body?.bank_account || '').toString().trim()
  const account_holder = (body?.account_holder || '').toString().trim()

  if (!bank_name || !bank_account || !account_holder) {
    return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin ngân hàng' }, { status: 400 })
  }

  const result = await createPayoutRequest({
    affiliate_email: session.email,
    bank_name,
    bank_account,
    account_holder,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true, request: result.request })
}
