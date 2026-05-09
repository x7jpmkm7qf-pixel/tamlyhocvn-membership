import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getFreeLeads, getFreeLeadStats } from '@/lib/free-leads'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const [leads, stats] = await Promise.all([
    getFreeLeads(),
    getFreeLeadStats(),
  ])

  // Sort newest first
  leads.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return NextResponse.json({ leads, stats })
}
