import { NextRequest, NextResponse } from 'next/server'
import { getMembers, saveMember } from '@/lib/data'
import { getAdminSession } from '@/lib/auth'
import { notifyManualActivation } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 })

  const members = await getMembers()
  const member = members.find(m => m.id === id)
  if (!member) return NextResponse.json({ error: 'Không tìm thấy thành viên' }, { status: 404 })

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  await saveMember({ ...member, status: 'active', expiresAt })

  // Thông báo Telegram
  notifyManualActivation({ name: member.name, email: member.email })
    .catch(e => console.error('[Activate] Telegram notify lỗi:', e))

  return NextResponse.json({ success: true })
}
