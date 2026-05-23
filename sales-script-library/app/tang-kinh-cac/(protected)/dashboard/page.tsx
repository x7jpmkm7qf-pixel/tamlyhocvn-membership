import Link from 'next/link'
import { getMemberSession } from '@/lib/auth'
import { getMember } from '@/lib/data'
import { getCourses, getUserEnrollments } from '@/lib/courses'

export const dynamic = 'force-dynamic'

export default async function TKCDashboard() {
  const session = getMemberSession()!
  const [courses, enrollments, member] = await Promise.all([
    getCourses(),
    getUserEnrollments(session.id),
    getMember(session.email),
  ])

  const kqPaymentActive = member?.enrollments?.['khau-quyet']?.status === 'active'

  const enrolledCourseIds = new Set(enrollments.map(e => e.courseId))
  // Show KQ course if paid but not yet TKC-enrolled (first-time buyer)
  if (kqPaymentActive) enrolledCourseIds.add('khau-quyet')

  const enrolledCourses = courses.filter(c => enrolledCourseIds.has(c.id))
  const getTkcEnrollment = (courseId: string) => enrollments.find(e => e.courseId === courseId)

  return (
    <div className="min-h-screen" style={{ background: '#091b30' }}>
      <style>{`
        .tkc-hover-card { transition: border-color 0.2s, transform 0.2s; }
        .tkc-hover-card:hover { border-color: #C9A961 !important; transform: translateY(-2px); }
      `}</style>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'rgba(201,169,97,0.15)', background: '#040e1c' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ color: '#C9A961', fontSize: '1.25rem' }}>⚜</span>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 700, color: '#FEF7E6', lineHeight: 1 }}>
                Tàng Kinh Các
              </div>
              <div style={{ fontSize: '0.7rem', color: '#a09070', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Thư viện Kịch bản Sales
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '0.875rem', color: '#a09070' }}>
              Chào, <span style={{ color: '#FEF7E6' }}>{session.name}</span>
            </span>
            {kqPaymentActive && (
              <Link
                href="/tang-kinh-cac/affiliate"
                style={{ fontSize: '0.75rem', color: '#C9A961', textDecoration: 'none', fontWeight: 600 }}
                className="hover:opacity-80 transition-opacity"
              >
                💰 Hoa hồng
              </Link>
            )}
            <Link
              href="/dashboard"
              style={{ fontSize: '0.75rem', color: '#a09070', textDecoration: 'none' }}
              className="hover:text-white transition-colors"
            >
              Library cũ →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.5rem' }}>
            Kho Bí Kíp của Sư Huynh
          </h1>
          <p style={{ color: '#a09070', fontSize: '0.9375rem' }}>
            {enrolledCourses.length === 0
              ? 'Sư huynh chưa có khóa học nào. Xem bên dưới để nhận miễn phí.'
              : `${enrolledCourses.length} bí kíp đang chờ sư huynh khám phá.`
            }
          </p>
        </div>

        {/* Enrolled courses */}
        {enrolledCourses.length > 0 && (
          <section className="mb-12">
            <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A961', marginBottom: '1.25rem' }}>
              Bí Kíp Của Tôi
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {enrolledCourses.map(course => {
                const enrollment = getTkcEnrollment(course.id)
                const progress = enrollment?.progressPercent ?? 0
                const lastChapter = enrollment?.lastReadChapterId

                return (
                  <Link
                    key={course.id}
                    href={`/tang-kinh-cac/khoa-hoc/${course.slug}${lastChapter ? `/${lastChapter}` : ''}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      className="tkc-hover-card"
                      style={{
                        background: '#0f2744',
                        border: '1px solid rgba(201,169,97,0.2)',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Cover placeholder */}
                      <div
                        style={{
                          height: '100px',
                          borderRadius: '0.5rem',
                          marginBottom: '1rem',
                          background: 'linear-gradient(135deg, #040e1c 0%, #1a3a5c 50%, #0f2744 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem',
                          border: '1px solid rgba(201,169,97,0.15)',
                        }}
                      >
                        <span style={{ fontSize: '1.5rem', color: '#C9A961' }}>⚜</span>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.75rem', color: '#a09070', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          Bí Kíp Ngoại Môn
                        </span>
                      </div>

                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.375rem' }}>
                        {course.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#a09070', marginBottom: '1rem', lineHeight: 1.5 }}>
                        {course.description}
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginBottom: '0.375rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tiến độ</span>
                        <span style={{ fontSize: '0.75rem', color: progress === 100 ? '#C9A961' : '#e8dcc8', fontWeight: 600 }}>
                          {progress === 100 ? '✓ Hoàn thành' : `${progress}%`}
                        </span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: '#C9A961', borderRadius: '2px', transition: 'width 0.3s' }} />
                      </div>

                      <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: '#C9A961', fontWeight: 600 }}>
                        {progress === 0 ? 'Bắt đầu đọc →' : progress === 100 ? 'Đọc lại →' : 'Tiếp tục đọc →'}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Available free courses not yet enrolled */}
        {enrolledCourses.length === 0 && (
          <div
            style={{
              background: '#0f2744',
              border: '1px solid rgba(201,169,97,0.2)',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚜</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.5rem' }}>
              Sư huynh chưa có bí kíp nào
            </div>
            <p style={{ color: '#a09070', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
              Nhận miễn phí <strong style={{ color: '#FEF7E6' }}>Bản Đồ 4 Loại Khách Hàng</strong> — 8 chương, 21 trang, chắt lọc 3 năm telesale.
            </p>
            <Link
              href="/ban-do"
              style={{
                display: 'inline-block',
                background: '#C9A961',
                color: '#040e1c',
                fontWeight: 700,
                fontSize: '0.9375rem',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
              }}
            >
              Nhận miễn phí →
            </Link>
          </div>
        )}

        {/* Upsell: Khẩu Quyết — only show if not yet purchased */}
        {!kqPaymentActive && (
          <section className="mb-10">
            <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A961', marginBottom: '1.25rem' }}>
              Bí Kíp Tiếp Theo
            </h2>
            <Link
              href="/tang-kinh-cac/checkout"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                className="tkc-hover-card"
                style={{
                  background: 'linear-gradient(135deg, #0f2744 0%, #1a3855 100%)',
                  border: '1px solid rgba(201,169,97,0.35)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: '2rem' }}>📜</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.25rem' }}>
                    Khẩu Quyết Phá Phản Đối
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#a09070', lineHeight: 1.6 }}>
                    10 câu trả lời chuẩn cho 10 phản đối phổ biến nhất — từ "Đắt quá" đến "Để nghĩ thêm". Bước kế tiếp sau Bản Đồ.
                  </div>
                </div>
                <div style={{ flexShrink: 0, background: '#C9A961', color: '#040e1c', fontWeight: 700, fontSize: '0.875rem', padding: '0.625rem 1.25rem', borderRadius: '0.5rem', whiteSpace: 'nowrap' }}>
                  Mua 199.000đ →
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Affiliate banner — only show for paid members */}
        {kqPaymentActive && (
          <Link href="/tang-kinh-cac/affiliate" style={{ textDecoration: 'none', display: 'block', marginTop: '1rem' }}>
            <div style={{ background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.2)', borderRadius: '0.75rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.125rem' }}>💰 Giới thiệu, nhận hoa hồng</div>
                <div style={{ fontSize: '0.8125rem', color: '#a09070' }}>101.000đ–150.000đ mỗi đơn bạn giới thiệu thành công</div>
              </div>
              <span style={{ color: '#C9A961', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>Xem ngay →</span>
            </div>
          </Link>
        )}

        {/* Footer nav */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(201,169,97,0.1)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ fontSize: '0.8125rem', color: '#a09070', textDecoration: 'none' }}>
            ← Kịch bản Sales (Library cũ)
          </Link>
          <Link href="/ban-do" style={{ fontSize: '0.8125rem', color: '#a09070', textDecoration: 'none' }}>
            Bản Đồ 4 Loại Khách Hàng
          </Link>
          {kqPaymentActive && (
            <Link href="/tang-kinh-cac/affiliate" style={{ fontSize: '0.8125rem', color: '#a09070', textDecoration: 'none' }}>
              Chương trình giới thiệu
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
