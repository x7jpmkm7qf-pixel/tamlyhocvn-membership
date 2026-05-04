import { NextRequest, NextResponse } from 'next/server'
import { getMembers, saveMember, Member } from '@/lib/data'

export const dynamic = 'force-dynamic'
import { notifyNewRegistration } from '@/lib/telegram'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const { name, email, password, phone } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })
  }

  const members = await getMembers()
  if (members.find(m => m.email === email.toLowerCase().trim())) {
    return NextResponse.json({ error: 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.' }, { status: 400 })
  }

  const member: Member = {
    id: `member-${uuidv4()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone?.trim() || undefined,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  await saveMember(member)

  // Gửi thông báo Telegram cho admin (không block response)
  notifyNewRegistration({
    name: member.name,
    email: member.email,
    phone: member.phone,
  }).catch(e => console.error('[Register] Telegram notify lỗi:', e))

  const { password: _p, ...safe } = member
  return NextResponse.json({ success: true, member: safe }, { status: 201 })
}
