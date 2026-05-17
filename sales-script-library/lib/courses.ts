// ── Types ──────────────────────────────────────────────────────────────────

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  price: number
  coverImage?: string
  orderIndex: number
  isPublished: boolean
  requiredTier?: 'ngoaimon' | 'noimon'
  createdAt: string
  updatedAt: string
}

export interface CourseContent {
  id: string
  courseId: string
  chapterNumber: number
  chapterTitle: string
  contentHtml: string
  contentType: 'text' | 'audio' | 'video'
  audioUrl?: string
  videoUrl?: string
  orderIndex: number
}

export interface Enrollment {
  userId: string
  courseId: string
  enrolledAt: string
  completedAt?: string
  progressPercent: number
  lastReadChapterId?: string
  chaptersRead: string[]
}

// ── Redis helpers (private, same pattern as lib/data.ts) ──────────────────

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function redisExec(command: unknown[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Redis chưa được cấu hình (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)')
  }
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  const json = await res.json()
  return json.result
}

async function rget<T>(key: string): Promise<T | null> {
  const result = await redisExec(['GET', key])
  if (result === null || result === undefined) return null
  return (typeof result === 'string' ? JSON.parse(result) : result) as T
}

async function rset(key: string, value: unknown): Promise<void> {
  await redisExec(['SET', key, JSON.stringify(value)])
}

// ── Redis keys ─────────────────────────────────────────────────────────────

const COURSES_KEY     = 'msl:courses'
const ENROLLMENTS_KEY = 'msl:enrollments'
const contentKey      = (slug: string) => `msl:course_content:${slug}`

// ── Course CRUD ────────────────────────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  const courses = await rget<Course[]>(COURSES_KEY)
  return (courses || []).sort((a, b) => a.orderIndex - b.orderIndex)
}

export async function getCourseBySlug(slug: string): Promise<Course | undefined> {
  const courses = await getCourses()
  return courses.find(c => c.slug === slug)
}

export async function saveCourse(course: Course): Promise<void> {
  const courses = await getCourses()
  const idx = courses.findIndex(c => c.id === course.id)
  if (idx >= 0) courses[idx] = course
  else courses.push(course)
  await rset(COURSES_KEY, courses)
}

// ── Course content (chapters) ──────────────────────────────────────────────

export async function getCourseContent(slug: string): Promise<CourseContent[]> {
  const content = await rget<CourseContent[]>(contentKey(slug))
  return (content || []).sort((a, b) => a.orderIndex - b.orderIndex)
}

export async function getChapter(slug: string, chapterId: string): Promise<CourseContent | undefined> {
  const chapters = await getCourseContent(slug)
  return chapters.find(c => c.id === chapterId)
}

export async function saveCourseContent(slug: string, chapters: CourseContent[]): Promise<void> {
  await rset(contentKey(slug), chapters)
}

// ── Enrollment CRUD ────────────────────────────────────────────────────────

export async function getEnrollments(): Promise<Enrollment[]> {
  const enrollments = await rget<Enrollment[]>(ENROLLMENTS_KEY)
  return enrollments || []
}

export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  const all = await getEnrollments()
  return all.filter(e => e.userId === userId)
}

export async function getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
  const all = await getEnrollments()
  return all.find(e => e.userId === userId && e.courseId === courseId)
}

export async function enrollUser(userId: string, courseId: string): Promise<Enrollment> {
  const existing = await getEnrollment(userId, courseId)
  if (existing) return existing

  const enrollment: Enrollment = {
    userId,
    courseId,
    enrolledAt: new Date().toISOString(),
    progressPercent: 0,
    chaptersRead: [],
  }

  const all = await getEnrollments()
  all.push(enrollment)
  await rset(ENROLLMENTS_KEY, all)
  return enrollment
}

export async function markChapterRead(userId: string, courseId: string, chapterId: string, totalChapters: number): Promise<Enrollment> {
  const all = await getEnrollments()
  const idx = all.findIndex(e => e.userId === userId && e.courseId === courseId)

  if (idx < 0) throw new Error('Enrollment not found')

  const enrollment = all[idx]
  if (!enrollment.chaptersRead.includes(chapterId)) {
    enrollment.chaptersRead.push(chapterId)
  }
  enrollment.lastReadChapterId = chapterId
  enrollment.progressPercent = totalChapters > 0
    ? Math.round((enrollment.chaptersRead.length / totalChapters) * 100)
    : 0
  if (enrollment.progressPercent === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date().toISOString()
  }

  all[idx] = enrollment
  await rset(ENROLLMENTS_KEY, all)
  return enrollment
}
