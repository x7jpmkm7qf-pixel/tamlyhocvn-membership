import { NextRequest, NextResponse } from 'next/server'
import { notifyFreeLead } from '@/lib/telegram'
import { upsertFreeLead } from '@/lib/free-leads'

export const runtime = 'nodejs'  // changed from edge — fb-capi/redis stable on node

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, source } = body as {
      name?: string
      email?: string
      phone?: string
      source?: string
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'Vui lòng nhập họ tên và email' }, { status: 400 })
    }
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    // Lưu lead vào Redis (idempotent — duplicate email được merge)
    let leadResult: { isNew: boolean } = { isNew: true }
    try {
      const r = await upsertFreeLead({
        name,
        email,
        phone,
        source: source || '/free',
      })
      leadResult = { isNew: r.isNew }
    } catch (e) {
      console.error('[free lead] save error:', e instanceof Error ? e.message : e)
      // fail-soft — vẫn notify Telegram để không miss lead
    }

    // Chỉ notify Telegram khi là lead MỚI (lần 2+ tải lại của cùng email không spam)
    if (leadResult.isNew) {
      notifyFreeLead({ name, email, phone }).catch(console.error)
    }

    return NextResponse.json({ success: true, isNew: leadResult.isNew })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
