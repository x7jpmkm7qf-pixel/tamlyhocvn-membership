import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getAuditLogs } from '@/lib/affiliate'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const commission_id = req.nextUrl.searchParams.get('commission_id')

  const logs = await getAuditLogs()
  const filtered = commission_id
    ? logs.filter(l => l.commission_id === commission_id)
    : logs

  return NextResponse.json({ logs: filtered.sort((a, b) => a.timestamp.localeCompare(b.timestamp)) })
}
