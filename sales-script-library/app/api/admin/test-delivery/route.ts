/**
 * GET /api/admin/test-delivery?email=X
 * Header: x-admin-secret: ADMIN_PASSWORD
 *
 * Test endpoint để gửi PDF Khẩu Quyết cho email bất kỳ — bypass payment flow.
 * Dùng để debug delivery setup mà không cần thanh toán thật.
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendKhauQuyetDelivery } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret') || ''
  const expected = process.env.ADMIN_PASSWORD || ''

  if (!expected || adminSecret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = req.nextUrl.searchParams.get('email')
  const name = req.nextUrl.searchParams.get('name') || 'Sư huynh'

  if (!email) {
    return NextResponse.json({ error: 'Missing ?email=' }, { status: 400 })
  }

  const result = await sendKhauQuyetDelivery({ to: email, name })

  return NextResponse.json({
    ok: result.ok,
    error: result.error,
    to: email,
    pdfUrl: process.env.KHAU_QUYET_PDF_URL,
    fromEmail: process.env.RESEND_FROM_EMAIL,
  })
}
