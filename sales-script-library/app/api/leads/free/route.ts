import { NextRequest, NextResponse } from 'next/server'
import { notifyFreeLead } from '@/lib/telegram'
import { upsertFreeLead, updateFreeLead } from '@/lib/free-leads'
import { sendLeadWelcomeEmail } from '@/lib/email'

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
    let leadResult: { id?: string; isNew: boolean } = { isNew: true }
    try {
      const r = await upsertFreeLead({
        name,
        email,
        phone,
        source: source || '/free',
      })
      leadResult = { id: r.lead.id, isNew: r.isNew }
    } catch (e) {
      console.error('[free lead] save error:', e instanceof Error ? e.message : e)
      // fail-soft — vẫn notify Telegram để không miss lead
    }

    // Chỉ trigger các hành động dưới đây khi là lead MỚI
    if (leadResult.isNew) {
      // 1) Notify admin qua Telegram (non-blocking)
      notifyFreeLead({ name, email, phone }).catch(console.error)

      // 2) Welcome email NGAY — kèm link tải PDF + giới thiệu (T+0)
      ;(async () => {
        try {
          const result = await sendLeadWelcomeEmail({ to: email, name })
          if (result.ok && leadResult.id) {
            await updateFreeLead(leadResult.id, {
              nurtureStep: 0,
              lastEmailSentAt: new Date().toISOString(),
            })
          }
        } catch (e) {
          console.error('[free lead] welcome email error:', e instanceof Error ? e.message : e)
        }
      })()
    }

    return NextResponse.json({ success: true, isNew: leadResult.isNew })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
