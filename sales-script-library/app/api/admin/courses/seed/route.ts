/**
 * POST /api/admin/courses/seed
 * Header: x-admin-secret: ADMIN_PASSWORD
 * Body: { slug: string }
 *
 * Reads data/courses/{slug}.json and writes course + chapters to Redis.
 * Safe to re-run — overwrites existing data for that slug.
 */

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { saveCourse, saveCourseContent, Course, CourseContent } from '@/lib/courses'

export const dynamic = 'force-dynamic'

interface SeedFile {
  course: Course
  chapters: CourseContent[]
}

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret') || ''
  const expected = process.env.ADMIN_PASSWORD || ''

  if (!expected || adminSecret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await req.json()
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'data', 'courses', `${slug}.json`)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: `data/courses/${slug}.json not found` }, { status: 404 })
  }

  let data: SeedFile
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as SeedFile
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in seed file' }, { status: 500 })
  }

  await saveCourse(data.course)
  await saveCourseContent(slug, data.chapters)

  return NextResponse.json({
    ok: true,
    slug,
    chapters: data.chapters.length,
    title: data.course.title,
  })
}
