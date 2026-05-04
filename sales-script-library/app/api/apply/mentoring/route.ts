/**
 * POST /api/apply/mentoring
 * Nhận đơn ứng tuyển 1:1 Mentoring — lưu Redis + thông báo Telegram
 */

import { NextRequest, NextResponse } from 'next/server'
import { notifyMentoringApplication } from '@/lib/telegram'
import { saveMentoringApplication, getMentoringApplication } from '@/lib/leads'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, industry, experience, currentProblem, goal } = await req.json()

    if (!name || !email || !phone || !industry || !currentProblem || !goal) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const emailNorm = email.toLowerCase().trim()

    // Upsert application
    const existing = await getMentoringApplication(emailNorm)
    if (!existing || existing.status === 'applied') {
      await saveMentoringApplication({
        id:             existing?.id ?? randomUUID(),
        name:           name.trim(),
        email:          emailNorm,
        phone:          phone.trim(),
        industry,
        experience:     experience || '',
        currentProblem: currentProblem.trim(),
        goal:           goal.trim(),
        status:         'applied',
        createdAt:      existing?.createdAt ?? new Date().toISOString(),
      })
    }

    // Gửi thông báo Telegram đầy đủ cho Sơn
    await notifyMentoringApplication({ name, email: emailNorm, phone, industry, experience, currentProblem, goal })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[apply/mentoring]', err)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
