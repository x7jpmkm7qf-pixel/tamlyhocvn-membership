/**
 * POST /api/apply/bootcamp
 * Nhận đăng ký PRO Bootcamp — lưu lead vào Redis + thông báo Telegram
 */

import { NextRequest, NextResponse } from 'next/server'
import { notifyBootcampLead } from '@/lib/telegram'
import { saveBootcampLead, getBootcampLead } from '@/lib/leads'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, industry, note } = await req.json()

    if (!name || !email || !phone || !industry) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const emailNorm = email.toLowerCase().trim()

    // Upsert lead (cho phép đăng ký lại nếu chưa paid)
    const existing = await getBootcampLead(emailNorm)
    if (!existing || existing.status !== 'paid') {
      await saveBootcampLead({
        id:        existing?.id ?? randomUUID(),
        name:      name.trim(),
        email:     emailNorm,
        phone:     phone.trim(),
        industry,
        note:      note?.trim() || '',
        status:    'pending',
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      })
    }

    // Gửi thông báo Telegram cho Sơn
    await notifyBootcampLead({ name, email: emailNorm, phone, industry, note })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[apply/bootcamp]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
