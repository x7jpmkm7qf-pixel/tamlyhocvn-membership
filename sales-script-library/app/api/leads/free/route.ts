import { NextRequest, NextResponse } from 'next/server'
import { notifyFreeLead } from '@/lib/telegram'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Vui lòng nhập họ tên và email' }, { status: 400 })
    }

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    // Notify admin via Telegram (non-blocking)
    notifyFreeLead({ name, email, phone }).catch(console.error)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
