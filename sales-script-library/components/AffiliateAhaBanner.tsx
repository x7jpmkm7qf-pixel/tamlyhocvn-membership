'use client'
import { useEffect, useState, useRef } from 'react'
import { usePostHog } from 'posthog-js/react'

interface Props {
  chapterTitle: string
  chapterId: string
  totalActiveAffiliates: number
  chaptersReadCount: number
}

const DISMISS_KEY = 'tkc_aha_banner_dismissed'

export default function AffiliateAhaBanner({ chapterTitle, chapterId, totalActiveAffiliates, chaptersReadCount }: Props) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const triggered = useRef(false)
  const posthog = usePostHog()

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true)
      return
    }

    const onScroll = () => {
      if (triggered.current) return
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (scrolled / total >= 0.65) {
        triggered.current = true
        setVisible(true)
        posthog?.capture('aha_banner_shown', { current_chapter: chapterId, chapters_read: chaptersReadCount })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // check immediately in case page is already scrolled
    return () => window.removeEventListener('scroll', onScroll)
  }, [chapterId, chaptersReadCount]) // posthog excluded — stable enough, avoids re-registration

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  const handleCTA = () => {
    posthog?.capture('aha_banner_clicked', { current_chapter: chapterId, chapters_read: chaptersReadCount })
  }

  if (dismissed || !visible) return null

  return (
    <>
      <style>{`
        @keyframes tkc-aha-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tkc-aha-banner { animation: tkc-aha-in 0.4s ease-out both; }
      `}</style>
      <div
        className="tkc-aha-banner"
        style={{
          background: '#0a1e35',
          border: '1px solid rgba(201,169,97,0.35)',
          borderRadius: '0.875rem',
          padding: '1.25rem 1.25rem 1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C9A961', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>💡</span>
            <span>Vừa học xong {chapterTitle}</span>
          </div>
          <button
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', color: '#a09070', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 0.25rem', flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#a09070', lineHeight: 1.6, marginBottom: '0.625rem' }}>
          Cảm thấy giá trị? Huynh đệ làm sales của huynh chắc cũng cần bí kíp này.
        </p>

        <div style={{ fontSize: '0.875rem', color: '#FEF7E6', marginBottom: '0.375rem' }}>
          🎁 Giới thiệu 1 huynh đệ → nhận <strong style={{ color: '#C9A961' }}>101.000đ tiền mặt</strong>
        </div>

        {totalActiveAffiliates > 0 && (
          <div style={{ fontSize: '0.75rem', color: '#a09070', marginBottom: '1rem', fontStyle: 'italic' }}>
            (đã có {totalActiveAffiliates} huynh đệ kiếm được hoa hồng)
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="/tang-kinh-cac/affiliate"
            onClick={handleCTA}
            style={{
              display: 'inline-block',
              background: '#C9A961', color: '#040e1c',
              fontWeight: 700, fontSize: '0.875rem',
              padding: '0.5rem 1.125rem', borderRadius: '0.375rem',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            Lấy link giới thiệu →
          </a>
          <button
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', color: '#a09070', fontSize: '0.8125rem', cursor: 'pointer', padding: '0.5rem 0' }}
          >
            Để sau
          </button>
        </div>
      </div>
    </>
  )
}
