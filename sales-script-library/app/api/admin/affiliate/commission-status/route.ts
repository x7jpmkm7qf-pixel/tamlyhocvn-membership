import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getCommissions, saveCommissions, getAuditLogs, saveAuditLogs, Commission } from '@/lib/affiliate'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const commission_id = (body?.commission_id || '').toString()
  const new_status = (body?.new_status || '').toString() as Commission['status']
  const reason = (body?.reason || '').toString().trim()

  const validStatuses: Commission['status'][] = ['available', 'requested', 'processing', 'paid_out', 'on_hold', 'rejected', 'clawback']
  if (!commission_id || !validStatuses.includes(new_status)) {
    return NextResponse.json({ error: 'Thiếu commission_id hoặc new_status không hợp lệ' }, { status: 400 })
  }
  if (!reason) return NextResponse.json({ error: 'Cần nhập lý do' }, { status: 400 })

  const [commissions, auditLogs] = await Promise.all([getCommissions(), getAuditLogs()])

  const idx = commissions.findIndex(c => c.id === commission_id)
  if (idx === -1) return NextResponse.json({ error: 'Không tìm thấy commission' }, { status: 404 })

  const old_status = commissions[idx].status
  if (old_status === new_status) return NextResponse.json({ ok: true, message: 'Không thay đổi' })

  const now = new Date().toISOString()
  commissions[idx] = {
    ...commissions[idx],
    status: new_status,
    ...(new_status === 'paid_out' && !commissions[idx].paid_out_at ? { paid_out_at: now } : {}),
  }

  auditLogs.push({
    id: crypto.randomUUID(),
    commission_id,
    old_status,
    new_status,
    changed_by: 'admin',
    reason,
    timestamp: now,
  })

  await Promise.all([saveCommissions(commissions), saveAuditLogs(auditLogs)])
  return NextResponse.json({ ok: true, commission: commissions[idx] })
}
