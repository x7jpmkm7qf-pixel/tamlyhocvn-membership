import { NextRequest, NextResponse } from 'next/server'
import { notifyBanDoLead } from '@/lib/telegram'
import { upsertFreeLead, updateFreeLead } from '@/lib/free-leads'
import { sendBanDoWelcomeEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, source } = body as {
      name?: string
      email?: string
      source?: string
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'Vui lòng nhập họ tên và email' }, { status: 400 })
    }
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    let leadResult: { id?: string; isNew: boolean } = { isNew: true }
    try {
      const r = await upsertFreeLead({
        name,
        email,
        source: source || '/ban-do',
      })
      leadResult = { id: r.lead.id, isNew: r.isNew }
    } catch (e) {
      console.error('[ban-do lead] save error:', e instanceof Error ? e.message : e)
    }

    if (leadResult.isNew) {
      const now = new Date().toISOString()

      try {
        await notifyBanDoLead({ name, email })
        if (leadResult.id) {
          await updateFreeLead(leadResult.id, { telegramNotifiedAt: now })
        }
      } catch (e) {
        console.error('[ban-do lead] telegram error:', e instanceof Error ? e.message : e)
      }

      try {
        const result = await sendBanDoWelcomeEmail({ to: email, name })
        if (result.ok && leadResult.id) {
          await updateFreeLead(leadResult.id, {
            nurtureStep: 0,
            lastEmailSentAt: now,
          })
        }
      } catch (e) {
        console.error('[ban-do lead] welcome email error:', e instanceof Error ? e.message : e)
      }
    }

    return NextResponse.json({ success: true, isNew: leadResult.isNew })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
