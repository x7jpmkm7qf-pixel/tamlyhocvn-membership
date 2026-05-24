import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMemberSession } from '@/lib/auth'
import { getMember } from '@/lib/data'
import { getCourseBySlug, getCourseContent, getEnrollment, enrollUser, markChapterRead } from '@/lib/courses'
import { getCachedAffiliateStats, getCachedActiveAffiliatesCount } from '@/lib/affiliate'
import TKCWelcomeDialog from '@/components/TKCWelcomeDialog'
import KQUpsellStickyBar from '@/components/KQUpsellStickyBar'
import KQUpsellSidebarCard from '@/components/KQUpsellSidebarCard'
import KQUpsellInlineCard from '@/components/KQUpsellInlineCard'
import ZaloGroupButton from '@/components/ZaloGroupButton'
import AffiliateWidget from '@/components/AffiliateWidget'
import AffiliateFloatButton from '@/components/AffiliateFloatButton'
import AffiliateAhaBanner from '@/components/AffiliateAhaBanner'
import AffiliateCopyToast from '@/components/AffiliateCopyToast'
import '@/styles/tang-kinh-cac.css'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string; chapter: string }
  searchParams: { welcome?: string }
}

export default async function ChapterReaderPage({ params, searchParams }: Props) {
  const session = getMemberSession()!
  const [course, chapters] = await Promise.all([
    getCourseBySlug(params.slug),
    getCourseContent(params.slug),
  ])

  if (!course || !course.isPublished) notFound()

  const chapter = chapters.find(c => c.id === params.chapter)
  if (!chapter) notFound()

  let enrollment = await getEnrollment(session.id, course.id)
  if (!enrollment) {
    enrollment = await enrollUser(session.id, course.id)
  }

  // Fetch member once — used for ban-do upsell check, paywall, and affiliate widgets
  const isBanDo = params.slug === 'ban-do'
  const isKQ    = params.slug === 'khau-quyet'
  const needsMember = isBanDo || course.price > 0
  const member = needsMember ? await getMember(session.email) : null

  // KQ upsell: check payment enrollment only for the free ban-do course
  const kqActive = isBanDo ? member?.enrollments?.['khau-quyet']?.status === 'active' : true

  // Paywall: paid chapter on a paid course requires active payment enrollment
  const isPaidChapter = course.price > 0 && chapter.preview === false
  if (isPaidChapter) {
    const paymentEnrollment = member?.enrollments?.[course.id]
    if (paymentEnrollment?.status !== 'active') {
      // Show paywall — teaser of title + lock UI
      return (
        <div style={{ minHeight: '100vh', background: '#091b30', display: 'flex', flexDirection: 'column' }}>
          <header style={{ background: '#040e1c', borderBottom: '1px solid rgba(201,169,97,0.15)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href="/tang-kinh-cac/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                <span style={{ color: '#C9A961' }}>⚜</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 700, color: '#FEF7E6' }}>Tàng Kinh Các</span>
              </Link>
            </div>
          </header>
          <main style={{ flex: 1, padding: '2.5rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.5rem' }}>
                {chapter.chapterTitle}
              </h1>
              <p style={{ color: '#a09070', marginBottom: '2rem', lineHeight: 1.6 }}>
                Chương này chỉ dành cho đệ tử đã sở hữu <strong style={{ color: '#FEF7E6' }}>Khẩu Quyết Phá Phản Đối</strong>.
              </p>
              <div style={{ background: '#0f2744', border: '1px solid rgba(201,169,97,0.25)', borderRadius: '0.875rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#a09070', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bộ toàn tập bao gồm</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', marginBottom: '1.25rem' }}>
                  {['10 khẩu quyết phá 10 phản đối kinh điển', 'Framework L–H–Đ–Q + 3 câu hỏi vàng', 'Script thực chiến — copy dùng được ngay', 'Cheatsheet 1 trang dán bàn làm việc'].map(item => (
                    <div key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#C9A961', flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                      <span style={{ fontSize: '0.875rem', color: '#e8dcc8' }}>{item}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/tang-kinh-cac/checkout"
                  style={{ display: 'block', background: '#C9A961', color: '#040e1c', fontWeight: 700, fontSize: '1rem', padding: '0.875rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', textAlign: 'center' }}
                >
                  Mua ngay 199.000đ →
                </Link>
              </div>
              <Link href={`/tang-kinh-cac/khoa-hoc/${params.slug}/kq-ch-00`}
                style={{ fontSize: '0.8125rem', color: '#a09070', textDecoration: 'none' }}>
                ← Đọc lời tựa miễn phí
              </Link>
            </div>
          </main>
        </div>
      )
    }
  }

  const currentIdx = chapters.findIndex(c => c.id === chapter.id)
  const prevChapter = currentIdx > 0 ? chapters[currentIdx - 1] : null
  const nextChapter = currentIdx < chapters.length - 1 ? chapters[currentIdx + 1] : null

  // Mark chapter as read — returns updated enrollment directly, no second fetch needed
  const updatedEnrollment = await markChapterRead(session.id, course.id, chapter.id, chapters.length)
  const progress = updatedEnrollment?.progressPercent ?? 0
  const chaptersRead = new Set(updatedEnrollment?.chaptersRead ?? [])
  const showWelcome = searchParams.welcome === 'true'

  // Show KQ upsell layers from chapter index 2 onwards for non-KQ members on ban-do
  const showUpsell = isBanDo && !kqActive && currentIdx >= 2

  // Affiliate data — only for khau-quyet paid pages (cached 5 min)
  const affCode = isKQ ? (member?.affiliate_code ?? null) : null
  const [affStats, totalActiveAffiliates] = isKQ
    ? await Promise.all([
        affCode ? getCachedAffiliateStats(session.email) : Promise.resolve(null),
        getCachedActiveAffiliatesCount(),
      ])
    : [null, 0]
  const availableTotal = affStats?.availableTotal ?? 0
  const showAffiliateWidget = isKQ && !!affCode

  return (
    <div style={{ minHeight: '100vh', background: '#091b30', display: 'flex', flexDirection: 'column' }}>

      {showWelcome && <TKCWelcomeDialog />}

      {/* Top nav */}
      <header style={{ background: '#040e1c', borderBottom: '1px solid rgba(201,169,97,0.15)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Link href="/tang-kinh-cac/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ color: '#C9A961' }}>⚜</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 700, color: '#FEF7E6' }}>Tàng Kinh Các</span>
          </Link>
          <div style={{ flex: 1, maxWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tiến độ</span>
              <span style={{ fontSize: '0.7rem', color: progress === 100 ? '#C9A961' : '#e8dcc8', fontWeight: 600 }}>{progress}%</span>
            </div>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#C9A961', borderRadius: '2px' }} />
            </div>
          </div>
          <a
            href={`/files/Ban-Do-4-Loai-Khach-Hang-Sales-Viet.pdf`}
            download
            style={{ fontSize: '0.75rem', color: '#C9A961', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            ↓ PDF
          </a>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

        {/* Sidebar */}
        <aside style={{
          width: '260px', flexShrink: 0, background: '#0f2744',
          borderRight: '1px solid rgba(201,169,97,0.1)',
          padding: '1.5rem 0', display: 'none',
          position: 'sticky', top: '57px', height: 'calc(100vh - 57px)', overflowY: 'auto',
          flexDirection: 'column',
        }} className="tkc-sidebar">
          <div style={{ padding: '0 1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.875rem', fontWeight: 700, color: '#FEF7E6', lineHeight: 1.3 }}>
              {course.title}
            </div>
          </div>
          <nav style={{ flex: 1 }}>
            {chapters.map((ch, idx) => {
              const isActive = ch.id === chapter.id
              const isRead = chaptersRead.has(ch.id)
              return (
                <Link
                  key={ch.id}
                  href={`/tang-kinh-cac/khoa-hoc/${params.slug}/${ch.id}`}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                    padding: '0.625rem 1.25rem', textDecoration: 'none',
                    background: isActive ? 'rgba(201,169,97,0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid #C9A961' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem',
                    background: isRead ? '#C9A961' : 'rgba(255,255,255,0.08)',
                    color: isRead ? '#040e1c' : '#a09070', fontWeight: 700,
                  }}>
                    {isRead ? '✓' : idx + 1}
                  </span>
                  <span style={{
                    fontSize: '0.8125rem', lineHeight: 1.45, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#FEF7E6' : isRead ? '#d4c4a0' : '#a09070',
                  }}>
                    {ch.chapterTitle}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Layer 2: Sidebar CTA card — desktop only, from ch ≥ 2 */}
          {showUpsell && <KQUpsellSidebarCard />}

          {/* Affiliate widget — desktop sidebar, paid KQ members */}
          {showAffiliateWidget && <AffiliateWidget availableTotal={availableTotal} />}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '2.5rem 1.5rem', minWidth: 0, paddingBottom: showUpsell ? '7rem' : '2.5rem' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>

            {/* Chapter content */}
            <article className="tkc-content" dangerouslySetInnerHTML={{ __html: chapter.contentHtml }} />

            {/* Layer 3: Inline CTA at peak moments (idx 2, 4, 7) */}
            {showUpsell && currentIdx === 2 && (
              <KQUpsellInlineCard variant="after-framework" />
            )}
            {showUpsell && currentIdx === 4 && (
              <KQUpsellInlineCard variant="mid-journey" />
            )}
            {showUpsell && currentIdx === 7 && (
              <KQUpsellInlineCard variant="final-peak" />
            )}

            {/* Affiliate aha banner — scroll 85% trigger, khau-quyet only */}
            {isKQ && (
              <AffiliateAhaBanner
                chapterTitle={chapter.chapterTitle}
                chapterId={chapter.id}
                totalActiveAffiliates={totalActiveAffiliates}
                chaptersReadCount={chaptersRead.size}
              />
            )}

            {/* Chapter navigation */}
            <nav style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(201,169,97,0.15)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              {prevChapter ? (
                <Link
                  href={`/tang-kinh-cac/khoa-hoc/${params.slug}/${prevChapter.id}`}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '0.25rem',
                    textDecoration: 'none', flex: 1,
                    padding: '0.875rem 1rem', borderRadius: '0.5rem',
                    background: '#0f2744', border: '1px solid rgba(201,169,97,0.15)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.06em' }}>← Chương trước</span>
                  <span style={{ fontSize: '0.875rem', color: '#FEF7E6', fontWeight: 500, lineHeight: 1.35 }}>{prevChapter.chapterTitle}</span>
                </Link>
              ) : <div />}

              {nextChapter ? (
                <Link
                  href={`/tang-kinh-cac/khoa-hoc/${params.slug}/${nextChapter.id}`}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'right',
                    textDecoration: 'none', flex: 1,
                    padding: '0.875rem 1rem', borderRadius: '0.5rem',
                    background: '#0f2744', border: '1px solid rgba(201,169,97,0.15)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chương tiếp →</span>
                  <span style={{ fontSize: '0.875rem', color: '#FEF7E6', fontWeight: 500, lineHeight: 1.35 }}>{nextChapter.chapterTitle}</span>
                </Link>
              ) : (
                <Link
                  href="/tang-kinh-cac/dashboard"
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'right',
                    textDecoration: 'none', flex: 1,
                    padding: '0.875rem 1rem', borderRadius: '0.5rem',
                    background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.3)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: '#C9A961', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hoàn thành ✓</span>
                  <span style={{ fontSize: '0.875rem', color: '#FEF7E6', fontWeight: 600 }}>Về Dashboard →</span>
                </Link>
              )}
            </nav>
          </div>
        </main>
      </div>

      {/* Mobile bottom chapter nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#040e1c', borderTop: '1px solid rgba(201,169,97,0.15)',
        padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '0.75rem', zIndex: 30,
      }} className="tkc-mobile-nav">
        {prevChapter ? (
          <Link href={`/tang-kinh-cac/khoa-hoc/${params.slug}/${prevChapter.id}`}
            style={{ color: '#a09070', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 0.875rem', borderRadius: '0.375rem', background: 'rgba(255,255,255,0.05)' }}>
            ← Trước
          </Link>
        ) : <div />}

        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: '#a09070' }}>
            {currentIdx + 1} / {chapters.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#FEF7E6', fontWeight: 500, marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {chapter.chapterTitle}
          </div>
        </div>

        {nextChapter ? (
          <Link href={`/tang-kinh-cac/khoa-hoc/${params.slug}/${nextChapter.id}`}
            style={{ color: '#C9A961', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 0.875rem', borderRadius: '0.375rem', background: 'rgba(201,169,97,0.1)' }}>
            Tiếp →
          </Link>
        ) : (
          <Link href="/tang-kinh-cac/dashboard"
            style={{ color: '#C9A961', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, padding: '0.5rem 0.875rem', borderRadius: '0.375rem', background: 'rgba(201,169,97,0.1)' }}>
            Xong ✓
          </Link>
        )}
      </div>

      {/* Layer 1: Sticky bottom upsell bar */}
      {showUpsell && <KQUpsellStickyBar chapterIndex={currentIdx} />}

      {/* Zalo group floating button — khau-quyet course only */}
      {isKQ && <ZaloGroupButton chapterId={chapter.id} slug={params.slug} />}

      {/* Affiliate float button — mobile only, paid KQ members */}
      {isKQ && showAffiliateWidget && (
        <AffiliateFloatButton chapterId={chapter.id} slug={params.slug} />
      )}

      {/* Copy detector toast — khau-quyet only */}
      {isKQ && <AffiliateCopyToast chapterId={chapter.id} />}

      <style>{`
        @media (min-width: 768px) {
          .tkc-sidebar { display: flex !important; flex-direction: column; }
          .tkc-mobile-nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}
