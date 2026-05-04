import { NextRequest, NextResponse } from 'next/server'
import { getScript, saveScript, deleteScript } from '@/lib/data'
import { getMemberSession, getAdminSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const member = getMemberSession()
  const isAdmin = getAdminSession()

  if (!member && !isAdmin) {
    return NextResponse.json({ error: 'Vui lòng đăng nhập để xem kịch bản đầy đủ' }, { status: 401 })
  }

  const script = getScript(params.id)
  if (!script) {
    return NextResponse.json({ error: 'Không tìm thấy kịch bản' }, { status: 404 })
  }

  return NextResponse.json(script)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const existing = getScript(params.id)
  if (!existing) {
    return NextResponse.json({ error: 'Không tìm thấy kịch bản' }, { status: 404 })
  }

  const body = await req.json()
  const updated = { ...existing, ...body, id: params.id }
  saveScript(updated)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  deleteScript(params.id)
  return NextResponse.json({ success: true })
}
