import { NextRequest, NextResponse } from 'next/server'
import { getMembers, saveMember, deleteMember, Member } from '@/lib/data'
import { getAdminSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }
  const members = (await getMembers()).map(({ password: _p, ...m }) => m)
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const body = await req.json()
  if (!body.email || !body.password || !body.name) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  const members = await getMembers()
  if (members.find(m => m.email === body.email.toLowerCase().trim())) {
    return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 400 })
  }

  const member: Member = {
    id: `member-${uuidv4()}`,
    name: body.name,
    email: body.email.toLowerCase().trim(),
    password: body.password,
    createdAt: new Date().toISOString(),
  }

  await saveMember(member)
  const { password: _p, ...safe } = member
  return NextResponse.json(safe, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const { id } = await req.json()
  await deleteMember(id)
  return NextResponse.json({ success: true })
}
