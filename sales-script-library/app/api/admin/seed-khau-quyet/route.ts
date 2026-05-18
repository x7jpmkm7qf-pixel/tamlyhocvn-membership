import { NextRequest, NextResponse } from 'next/server'
import { saveCourse, saveCourseContent } from '@/lib/courses'
import courseData from '@/data/courses/khau-quyet.json'

// One-time seed endpoint — DELETE THIS FILE after seeding
// Protected by ADMIN_PASSWORD env var
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}))
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await saveCourse(courseData.course as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await saveCourseContent(courseData.course.slug, courseData.chapters as any)

    return NextResponse.json({
      ok: true,
      course: courseData.course.id,
      chapters: courseData.chapters.length,
      preview: courseData.chapters.filter((c: { preview?: boolean }) => c.preview).length,
      paid: courseData.chapters.filter((c: { preview?: boolean }) => !c.preview).length,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
