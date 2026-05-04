/**
 * POST /api/apply/mentoring
 * Nhận đơn ứng tuyển 1:1 Mentoring — lưu lead + thông báo Telegram
 */

import { NextRequest, NextResponse } from 'next/server'
import { notifyMentoringApplication } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, industry, experience, currentProblem, goal } = await req.json()

    if (!name || !email || !phone || !industry || !currentProblem || !goal) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    // Gửi thông báo Telegram đầy đủ cho Sơn
    await notifyMentoringApplication({ name, email, phone, industry, experience, currentProblem, goal })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[apply/mentoring]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
