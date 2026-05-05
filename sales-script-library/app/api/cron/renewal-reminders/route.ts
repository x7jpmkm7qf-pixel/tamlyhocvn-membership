/**
 * GET /api/cron/renewal-reminders
 * Chạy mỗi sáng 8h Việt Nam (1:00 UTC).
 * Tìm tất cả thành viên hết hạn trong 1–3 ngày → gửi danh sách vào Telegram.
 * Bảo vệ bằng CRON_SECRET header (Vercel tự thêm khi gọi).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMembers } from '@/lib/data'
import { notifyExpiringMembers } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

const WARN_DAYS = 3   // nhắc khi còn <= 3 ngày

export async function GET(req: NextRequest) {
  // Vercel gửi Authorization: Bearer <CRON_SECRET> khi trigger cron
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const members = await getMembers()
    const now     = Date.now()

    const expiring = members
      .filter(m => {
        if (m.status !== 'active' || !m.expiresAt) return false
        const msLeft  = new Date(m.expiresAt).getTime() - now
        const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24))
        return daysLeft >= 0 && daysLeft <= WARN_DAYS
      })
      .map(m => ({
        name:      m.name,
        email:     m.email,
        phone:     m.phone,
        expiresAt: m.expiresAt!,
        daysLeft:  Math.floor((new Date(m.expiresAt!).getTime() - now) / (1000 * 60 * 60 * 24)),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)   // sắp xếp từ gần nhất

    console.log(`[cron] renewal-reminders: ${expiring.length} thành viên sắp hết hạn`)

    if (expiring.length > 0) {
      await notifyExpiringMembers(expiring)
    }

    return NextResponse.json({
      success:  true,
      checked:  members.length,
      expiring: expiring.length,
      members:  expiring.map(m => ({ email: m.email, daysLeft: m.daysLeft })),
    })
  } catch (e) {
    console.error('[cron] renewal-reminders lỗi:', e)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
