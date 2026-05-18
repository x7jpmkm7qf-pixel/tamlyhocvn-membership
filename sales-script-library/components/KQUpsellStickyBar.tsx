'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  chapterIndex: number
}

const DISMISS_KEY = 'tkc_kq_sticky_dismissed_until'

function getMessage(idx: number): { icon: string; text: string } {
  if (idx <= 4) return { icon: '📖', text: '12 chương Khẩu Quyết đang chờ' }
  if (idx <= 6) return { icon: '🔓', text: 'Đệ tử đã đi được nửa đường' }
  return { icon: '🏆', text: 'Sẵn sàng cho Khẩu Quyết?' }
}

export default function KQUpsellStickyBar({ chapterIndex }: Props) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(true) // hidden until localStorage checked
  const [scrollVisible, setScrollVisible] = useState(true)
  const [mounted, setMounted] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    setMounted(true)
    const until = localStorage.getItem(DISMISS_KEY)
    if (until && Date.now() < parseInt(until, 10)) {
      setDismissed(true)
    } else {
      setDismissed(false)
    }
    lastScrollY.current = window.scrollY
  }, [])

  const handleScroll = useCallback(() => {
    const y = window.scrollY
    const delta = y - lastScrollY.current
    if (delta > 8) setScrollVisible(false)
    else if (delta < -8) setScrollVisible(true)
    lastScrollY.current = y
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 24 * 60 * 60 * 1000))
    setDismissed(true)
  }

  if (!mounted || dismissed) return null

  const { icon, text } = getMessage(chapterIndex)
  const isVisible = scrollVisible

  return (
    <>
      <style>{`
        @keyframes tkc-kq-slidein {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .tkc-kq-sticky {
          animation: tkc-kq-slidein 0.3s cubic-bezier(0.16,1,0.3,1);
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s;
        }
        .tkc-kq-sticky.scrollhidden {
          transform: translateY(100%);
          opacity: 0;
          pointer-events: none;
        }
        /* Mobile: sit above the chapter nav bar (~52px tall) */
        @media (max-width: 767px) {
          .tkc-kq-sticky { bottom: 52px !important; height: 56px !important; }
        }
        /* Desktop: sit at very bottom, taller */
        @media (min-width: 768px) {
          .tkc-kq-sticky { bottom: 0 !important; height: 64px !important; }
        }
      `}</style>

      <div
        className={`tkc-kq-sticky${isVisible ? '' : ' scrollhidden'}`}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          background: '#0A1929',
          borderTop: '1px solid rgba(201,169,97,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0 1rem',
          zIndex: 35,
        }}
      >
        <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{icon}</span>

        <span style={{
          flex: 1,
          fontSize: '0.8125rem',
          color: '#FEF7E6',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 500,
        }}>
          {text}
        </span>

        <button
          onClick={() => router.push('/tang-kinh-cac/checkout')}
          style={{
            flexShrink: 0,
            background: '#C9A961',
            color: '#040e1c',
            fontWeight: 700,
            fontSize: '0.8125rem',
            padding: '0.5rem 0.875rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Khai mở 199k →
        </button>

        <button
          onClick={handleDismiss}
          aria-label="Đóng"
          style={{
            flexShrink: 0,
            background: 'transparent',
            border: 'none',
            color: '#6b7a8d',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0.375rem',
            lineHeight: 1,
            borderRadius: '0.25rem',
          }}
        >
          ✕
        </button>
      </div>
    </>
  )
}
