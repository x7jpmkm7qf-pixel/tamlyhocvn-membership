/**
 * GET /api/cron/lead-nurture
 *
 * Chạy mỗi sáng 9h VN (02:00 UTC). Quét toàn bộ free leads, dispatch action
 * tự động theo "tuổi" của lead:
 *
 *   T+0           Welcome email + PDF (đã gửi tại capture endpoint, không động)
 *   T+24-48h      Email check-in (step 1) + Telegram nudge admin nếu vẫn `new`
 *   T+72-96h      Email soft-pitch 99K (step 2)
 *   T+5-6d        Email last call (step 3) + Telegram nudge cuối
 *   T+14d+        Auto-archive `new` → `lost` (admin Telegram summary)
 *
 * Conversion rule: nếu lead status = 'converted' / 'contacted' / 'lost'
 * → KHÔNG gửi email nurture nữa (avoid spam khách đã chốt hoặc anh đã xử lý).
 *
 * Bảo vệ: CRON_SECRET header (Vercel auto-set) + cũng cho phép admin gọi tay.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getFreeLeads,
  updateFreeLead,
  type FreeLead,
  type NurtureStep,
} from '@/lib/free-leads'
import {
  sendLeadCheckinEmail,
  sendLeadPitchEmail,
  sendLeadLastCallEmail,
} from '@/lib/email'
import {
  notifyLeadNudge,
  notifyLeadAutoArchived,
  notifyLeadCronSummary,
} from '@/lib/telegram'
import { getAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60  // worker có thể chạy lâu nếu nhiều leads

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

// Thresholds (giờ kể từ createdAt)
const T_CHECKIN_MIN = 24       // gửi check-in từ giờ thứ 24
const T_CHECKIN_MAX = 48       // muộn nhất là giờ thứ 48 (cron daily nên có window)
const T_PITCH_MIN = 72
const T_PITCH_MAX = 96
const T_LASTCALL_MIN = 5 * 24
const T_LASTCALL_MAX = 6 * 24
const T_ARCHIVE = 14 * 24      // auto-archive sau 14 ngày
const T_ADMIN_NUDGE_HOURS = 24 // nhắc admin sau 24h nếu vẫn `new`
const T_ADMIN_NUDGE_REPEAT_DAYS = 4 // nhắc lại sau mỗi 4 ngày, max 2 lần

/** Trả về true nếu lead đang ở trạng thái "active" cho nurture (chưa được anh xử lý) */
function shouldNurture(l: FreeLead): boolean {
  return l.status === 'new'
}

function ageHours(l: FreeLead): number {
  return (Date.now() - new Date(l.createdAt).getTime()) / HOUR
}

function lastNudgeDays(l: FreeLead): number {
  if (!l.lastAdminNudgeAt) return Infinity
  return (Date.now() - new Date(l.lastAdminNudgeAt).getTime()) / DAY
}

interface RunResult {
  emailsSent: { welcome: number; checkin: number; pitch: number; lastcall: number }
  nudgesSent: number
  archived: number
  errors: number
  archivedEmails: string[]
}

async function runNurture(): Promise<RunResult> {
  const result: RunResult = {
    emailsSent: { welcome: 0, checkin: 0, pitch: 0, lastcall: 0 },
    nudgesSent: 0,
    archived: 0,
    errors: 0,
    archivedEmails: [],
  }

  const leads = await getFreeLeads()
  console.log(`[cron lead-nurture] Quét ${leads.length} leads...`)

  for (const lead of leads) {
    if (!shouldNurture(lead)) continue

    const age = ageHours(lead)
    const step: NurtureStep = (lead.nurtureStep ?? 0) as NurtureStep

    try {
      // ── 1. Auto-archive lead nguội ────────────────────────────────────
      if (age >= T_ARCHIVE) {
        await updateFreeLead(lead.id, {
          status: 'lost',
          autoArchivedAt: new Date().toISOString(),
        })
        result.archived++
        result.archivedEmails.push(lead.email)
        continue
      }

      // ── 2. Email check-in (T+24h) — chỉ gửi nếu chưa gửi step này ────
      if (
        step < 1 &&
        age >= T_CHECKIN_MIN &&
        age <= T_CHECKIN_MAX
      ) {
        const r = await sendLeadCheckinEmail({ to: lead.email, name: lead.name })
        if (r.ok) {
          await updateFreeLead(lead.id, {
            nurtureStep: 1,
            lastEmailSentAt: new Date().toISOString(),
          })
          result.emailsSent.checkin++
        } else {
          result.errors++
        }
      }

      // ── 3. Email soft-pitch (T+72h) ──────────────────────────────────
      else if (
        step < 2 &&
        age >= T_PITCH_MIN &&
        age <= T_PITCH_MAX
      ) {
        const r = await sendLeadPitchEmail({ to: lead.email, name: lead.name })
        if (r.ok) {
          await updateFreeLead(lead.id, {
            nurtureStep: 2,
            lastEmailSentAt: new Date().toISOString(),
          })
          result.emailsSent.pitch++
        } else {
          result.errors++
        }
      }

      // ── 4. Email last-call (T+5d) ─────────────────────────────────────
      else if (
        step < 3 &&
        age >= T_LASTCALL_MIN &&
        age <= T_LASTCALL_MAX
      ) {
        const r = await sendLeadLastCallEmail({ to: lead.email, name: lead.name })
        if (r.ok) {
          await updateFreeLead(lead.id, {
            nurtureStep: 3,
            lastEmailSentAt: new Date().toISOString(),
          })
          result.emailsSent.lastcall++
        } else {
          result.errors++
        }
      }

      // ── 5. Telegram nudge admin ──────────────────────────────────────
      // Lần 1: sau 24h vẫn `new` (chưa nudge bao giờ)
      // Lần 2: cách lần 1 ít nhất 4 ngày (max 2 nudges total)
      const shouldNudge =
        age >= T_ADMIN_NUDGE_HOURS &&
        age < T_ARCHIVE &&
        (!lead.lastAdminNudgeAt || lastNudgeDays(lead) >= T_ADMIN_NUDGE_REPEAT_DAYS)

      if (shouldNudge) {
        await notifyLeadNudge({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          industry: lead.industry,
          ageHours: age,
          source: lead.source,
        })
        await updateFreeLead(lead.id, {
          lastAdminNudgeAt: new Date().toISOString(),
        })
        result.nudgesSent++
      }
    } catch (e) {
      console.error('[cron lead-nurture] error processing lead', lead.email, e)
      result.errors++
    }
  }

  return result
}

export async function GET(req: NextRequest) {
  // Cho phép 2 cách trigger: (a) Vercel cron với CRON_SECRET, (b) admin gọi thủ công
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const isCronCall = cronSecret && authHeader === `Bearer ${cronSecret}`
  const isAdminCall = getAdminSession()

  if (!isCronCall && !isAdminCall) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const result = await runNurture()
  const durationMs = Date.now() - startedAt

  console.log(
    `[cron lead-nurture] Done in ${durationMs}ms — ${JSON.stringify(result)}`
  )

  // Gửi summary lên Telegram (chỉ khi có activity, helper tự skip silent runs)
  await notifyLeadCronSummary({
    emailsSent: result.emailsSent,
    nudgesSent: result.nudgesSent,
    archived: result.archived,
    errors: result.errors,
  })

  // Gửi summary archived
  if (result.archived > 0) {
    await notifyLeadAutoArchived({
      count: result.archived,
      emails: result.archivedEmails,
    })
  }

  return NextResponse.json({
    ok: true,
    durationMs,
    ...result,
  })
}
