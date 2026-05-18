import { redirect, notFound } from 'next/navigation'
import { getMemberSession } from '@/lib/auth'
import { getCourseBySlug, getCourseContent, getEnrollment, enrollUser } from '@/lib/courses'

export const dynamic = 'force-dynamic'

export default async function CourseIndexPage({ params }: { params: { slug: string } }) {
  const session = getMemberSession()!
  const [course, chapters] = await Promise.all([
    getCourseBySlug(params.slug),
    getCourseContent(params.slug),
  ])

  if (!course || !course.isPublished) notFound()
  if (chapters.length === 0) notFound()

  let enrollment = await getEnrollment(session.id, course.id)

  // Auto-enroll on first visit (all courses — paywall is enforced at chapter level)
  if (!enrollment) {
    enrollment = await enrollUser(session.id, course.id)
  }

  // Redirect to last read chapter, or first chapter
  const lastChapterId = enrollment.lastReadChapterId
  const targetChapter = lastChapterId
    ? (chapters.find(c => c.id === lastChapterId) ?? chapters[0])
    : chapters[0]

  redirect(`/tang-kinh-cac/khoa-hoc/${params.slug}/${targetChapter.id}`)
}
