/**
 * POST /api/tang-kinh-cac/progress
 * Body: { courseId, chapterId, totalChapters }
 * Returns updated enrollment progress.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMemberSession } from '@/lib/auth'
import { markChapterRead, getEnrollment } from '@/lib/courses'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = getMemberSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, chapterId, totalChapters } = await req.json()
  if (!courseId || !chapterId || typeof totalChapters !== 'number') {
    return NextResponse.json({ error: 'courseId, chapterId, totalChapters required' }, { status: 400 })
  }

  const enrollment = await getEnrollment(session.id, courseId)
  if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

  const updated = await markChapterRead(session.id, courseId, chapterId, totalChapters)
  return NextResponse.json({ ok: true, progressPercent: updated.progressPercent, chaptersRead: updated.chaptersRead })
}
