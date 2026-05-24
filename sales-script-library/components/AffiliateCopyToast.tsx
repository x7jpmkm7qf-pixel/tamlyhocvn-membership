'use client'
import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'

const COOLDOWN_KEY = 'copy_toast_shown_at'
const COOLDOWN_MS  = 24 * 60 * 60 * 1000
const AUTO_DISMISS = 12000

interface Props {
  chapterId: string
}

export default function AffiliateCopyToast({ chapterId }: Props) {
  const [visible, setVisible] = useState(false)
  const posthog = usePostHog()

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout>

    const show = (copiedLength: number) => {
      setVisible(true)
      posthog?.capture('copy_toast_shown', { current_chapter: chapterId, copied_length: copiedLength })
      dismissTimer = setTimeout(() => setVisible(false), AUTO_DISMISS)
    }

    const onCopy = () => {
      const text = window.getSelection()?.toString() ?? ''
      if (text.length <= 20) return

      const last = localStorage.getItem(COOLDOWN_KEY)
      const now  = Date.now()
      if (last && now - parseInt(last, 10) < COOLDOWN_MS) return

      localStorage.setItem(COOLDOWN_KEY, String(now))
      setTimeout(() => show(text.length), 2000)
    }

    const el = document.querySelector('.tkc-content')
    el?.addEventListener('copy', onCopy)
    return () => {
      el?.removeEventListener('copy', onCopy)
      clearTimeout(dismissTimer)
    }
  }, [chapterId, posthog])

  const handleCTA = () => {
    posthog?.capture('copy_toast_clicked', { current_chapter: chapterId })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes tkc-toast-in {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .tkc-copy-toast { animation: tkc-toast-in 0.35s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>
      <div
        className="tkc-copy-toast"
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '16px',
          width: '100%',
          maxWidth: '320px',
          background: '#0a1929',
          border: '1px solid rgba(201,169,97,0.4)',
          borderRadius: '0.75rem',
          padding: '1rem',
          zIndex: 998,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FEF7E6', display: 'flex', gap: '0.375rem' }}>
            <span>📋</span>
            <span>Đã copy! Huynh đang dùng vào việc thật?</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            style={{ background: 'none', border: 'none', color: '#a09070', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, flexShrink: 0, padding: '0 0.125rem' }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: '#a09070', lineHeight: 1.55, marginBottom: '0.875rem' }}>
          Nếu chốt được deal nhờ bí kíp này — chia sẻ link với huynh đệ →
          nhận <strong style={{ color: '#C9A961' }}>101k/đơn</strong>
        </p>

        <a
          href="/tang-kinh-cac/affiliate"
          onClick={handleCTA}
          style={{
            display: 'inline-block',
            background: 'rgba(201,169,97,0.15)',
            border: '1px solid rgba(201,169,97,0.4)',
            borderRadius: '0.375rem',
            padding: '0.4375rem 0.875rem',
            fontSize: '0.8125rem', fontWeight: 700, color: '#C9A961',
            textDecoration: 'none',
          }}
        >
          Xem chương trình →
        </a>
      </div>
    </>
  )
}
