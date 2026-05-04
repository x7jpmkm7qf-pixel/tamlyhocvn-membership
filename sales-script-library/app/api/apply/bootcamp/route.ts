/**
 * POST /api/apply/bootcamp
 * Nhận đăng ký PRO Bootcamp — lưu lead + thông báo Telegram
 */

import { NextRequest, NextResponse } from 'next/server'
import { notifyBootcampLead } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, industry, note } = await req.json()

    if (!name || !email || !phone || !industry) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    // Gửi thông báo Telegram cho Sơn
    await notifyBootcampLead({ name, email, phone, industry, note })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[apply/bootcamp]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
