import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getCommissions, saveCommissions, getAuditLogs, saveAuditLogs, Commission } from '@/lib/affiliate'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const commission_ids: string[] = Array.isArray(body?.commission_ids) ? body.commission_ids : []
  const new_status = (body?.new_status || '').toString() as Commission['status']
  const reason = (body?.reason || '').toString().trim()

  const validStatuses: Commission['status'][] = ['available', 'requested', 'processing', 'paid_out', 'on_hold', 'rejected', 'clawback']
  if (commission_ids.length === 0 || !validStatuses.includes(new_status)) {
    return NextResponse.json({ error: 'Thiếu commission_ids hoặc new_status không hợp lệ' }, { status: 400 })
  }
  if (!reason) return NextResponse.json({ error: 'Cần nhập lý do' }, { status: 400 })

  const [commissions, auditLogs] = await Promise.all([getCommissions(), getAuditLogs()])
  const idSet = new Set(commission_ids)
  const now = new Date().toISOString()
  let updated = 0

  for (let i = 0; i < commissions.length; i++) {
    if (!idSet.has(commissions[i].id)) continue
    const old_status = commissions[i].status
    if (old_status === new_status) continue
    commissions[i] = {
      ...commissions[i],
      status: new_status,
      ...(new_status === 'paid_out' && !commissions[i].paid_out_at ? { paid_out_at: now } : {}),
    }
    auditLogs.push({
      id: crypto.randomUUID(),
      commission_id: commissions[i].id,
      old_status,
      new_status,
      changed_by: 'admin',
      reason,
      timestamp: now,
    })
    updated++
  }

  await Promise.all([saveCommissions(commissions), saveAuditLogs(auditLogs)])
  return NextResponse.json({ ok: true, updated })
}
