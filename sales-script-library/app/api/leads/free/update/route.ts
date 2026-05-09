import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { updateFreeLead, deleteFreeLead, type FreeLeadStatus } from '@/lib/free-leads'

export const dynamic = 'force-dynamic'

const ALLOWED: FreeLeadStatus[] = ['new', 'contacted', 'converted', 'lost']

export async function POST(req: NextRequest) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { id, status, note } = body as {
    id?: string
    status?: string
    note?: string
  }

  if (!id) {
    return NextResponse.json({ error: 'Thiếu id' }, { status: 400 })
  }

  const patch: { status?: FreeLeadStatus; note?: string } = {}
  if (status) {
    if (!ALLOWED.includes(status as FreeLeadStatus)) {
      return NextResponse.json({ error: `Status không hợp lệ — phải là: ${ALLOWED.join(', ')}` }, { status: 400 })
    }
    patch.status = status as FreeLeadStatus
  }
  if (typeof note === 'string') patch.note = note

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Không có gì để cập nhật' }, { status: 400 })
  }

  const updated = await updateFreeLead(id, patch)
  if (!updated) {
    return NextResponse.json({ error: 'Không tìm thấy lead' }, { status: 404 })
  }
  return NextResponse.json({ lead: updated })
}

export async function DELETE(req: NextRequest) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Thiếu id' }, { status: 400 })
  }

  const ok = await deleteFreeLead(id)
  if (!ok) {
    return NextResponse.json({ error: 'Không tìm thấy lead' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
