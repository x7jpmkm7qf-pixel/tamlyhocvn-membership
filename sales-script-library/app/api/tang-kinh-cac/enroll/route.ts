/**
 * POST /api/tang-kinh-cac/enroll
 * Body: { courseId }
 * Enrolls the current member in a free course.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMemberSession } from '@/lib/auth'
import { getCourseBySlug, enrollUser } from '@/lib/courses'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = getMemberSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const course = await getCourseBySlug(slug)
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  if (course.price !== 0) return NextResponse.json({ error: 'Course requires payment' }, { status: 403 })

  const enrollment = await enrollUser(session.id, course.id)
  return NextResponse.json({ ok: true, enrollment })
}
