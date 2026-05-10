/**
 * POST /api/leads/free/resend-telegram
 * Body: { id?: string }   — id cụ thể, hoặc bỏ trống để resend ALL leads bị miss
 *
 * Resend Telegram notification cho lead chưa có telegramNotifiedAt
 * (do bug fire-and-forget cũ — Vercel terminate function trước khi
 * Telegram call complete).
 *
 * Bảo vệ admin session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import {
  getFreeLeads,
  updateFreeLead,
  type FreeLead,
} from '@/lib/free-leads'
import { notifyFreeLead, notifyLeadNudge } from '@/lib/telegram'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const HOUR = 60 * 60 * 1000

function ageHours(lead: FreeLead): number {
  return (Date.now() - new Date(lead.createdAt).getTime()) / HOUR
}

export async function POST(req: NextRequest) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { id } = body as { id?: string }

  const allLeads = await getFreeLeads()
  let targets: FreeLead[]

  if (id) {
    // Resend cho 1 lead cụ thể
    const found = allLeads.find((l) => l.id === id)
    if (!found) {
      return NextResponse.json({ error: 'Không tìm thấy lead' }, { status: 404 })
    }
    targets = [found]
  } else {
    // Resend cho TẤT CẢ leads chưa có telegramNotifiedAt + chưa converted/lost
    targets = allLeads.filter(
      (l) =>
        !l.telegramNotifiedAt &&
        l.status !== 'converted' &&
        l.status !== 'lost'
    )
  }

  let sent = 0
  let errors = 0
  const now = new Date().toISOString()

  for (const lead of targets) {
    try {
      const age = ageHours(lead)

      // Nếu lead < 24h → dùng tin "Lead Magnet mới" (T+0 template)
      // Nếu ≥ 24h → dùng tin nudge với template phù hợp
      if (age < 24) {
        await notifyFreeLead({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
        })
      } else {
        await notifyLeadNudge({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          ageHours: age,
          source: lead.source,
        })
      }

      await updateFreeLead(lead.id, { telegramNotifiedAt: now })
      sent++
    } catch (e) {
      console.error('[resend-telegram] error for lead', lead.email, e)
      errors++
    }
  }

  return NextResponse.json({
    ok: true,
    targets: targets.length,
    sent,
    errors,
  })
}
