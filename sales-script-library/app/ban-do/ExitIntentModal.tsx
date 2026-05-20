'use client'
import { useEffect, useRef, useState } from 'react'

const SESSION_KEY = 'ban-do-exit-shown'

export default function ExitIntentModal({ formSent }: { formSent: boolean }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const formSentRef = useRef(formSent)
  const triggeredRef = useRef(false)
  const lastScrollYRef = useRef(0)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { formSentRef.current = formSent }, [formSent])

  const trigger = () => {
    if (triggeredRef.current || formSentRef.current) return
    try { if (sessionStorage.getItem(SESSION_KEY)) return } catch {}
    triggeredRef.current = true
    try { sessionStorage.setItem(SESSION_KEY, '1') } catch {}
    setOpen(true)
  }

  useEffect(() => {
    lastScrollYRef.current = window.scrollY

    // Desktop: mouse exits viewport from top edge
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger()
    }

    // Mobile: fast upward scroll detected → start 3s idle timer
    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollYRef.current
      lastScrollYRef.current = currentY

      if (delta < -20) {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        idleTimerRef.current = setTimeout(trigger, 3000)
      } else if (delta > 10 && idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    document.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => setOpen(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/lead-light', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: 'exit_intent' }),
      })
    } catch {}
    setLoading(false)
    setDone(true)
  }

  if (!open) return null

  return (
    <>
      <style>{`@keyframes ei-fade { from { opacity: 0 } to { opacity: 1 } }`}</style>

      {/* Root layer */}
      <div
        className="fixed inset-0 z-[1000]"
        style={{ animation: 'ei-fade 200ms ease' }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(28,25,23,0.55)' }}
          onClick={close}
        />

        {/* Panel: fullscreen on mobile, centered 480px on sm+ */}
        <div
          className="
            absolute inset-0 overflow-y-auto flex flex-col justify-start pt-12
            sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
            sm:w-[480px] sm:max-h-[90vh] sm:rounded-xl sm:pt-8
          "
          style={{ background: '#FEF7E6', padding: '48px 24px 28px', boxSizing: 'border-box' }}
        >
          {/* X button */}
          <button
            onClick={close}
            aria-label="Đóng"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              border: 'none',
              background: 'rgba(28,25,23,0.08)',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: 16,
              color: '#44403C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>

          {done ? (
            <div className="flex flex-col items-center text-center py-10">
              <div className="text-5xl mb-4">📩</div>
              <p
                className="text-xl font-extrabold text-[#7C2D12] mb-2"
                style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
              >
                Xong! Em gửi ngay.
              </p>
              <p className="text-sm text-stone-500">
                Kiểm tra inbox — và thư mục Spam nếu không thấy nhé.
              </p>
            </div>
          ) : (
            <>
              <h2
                className="text-xl font-extrabold text-[#7C2D12] mb-3 leading-snug"
                style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
              >
                Khoan! 📜 Anh/chị có 30 giây không?
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed mb-5">
                Chưa muốn để lại SĐT cũng OK — chỉ Email thôi, em gửi bản tóm tắt
                1 trang của Bản Đồ. Đọc thử trong 5 phút, hợp thì quay lại lấy bản full.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="Email của anh/chị"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#C9A961] rounded-lg px-4 py-3 text-sm text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-[#7C2D12] transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7C2D12] hover:bg-[#5C1A0A] disabled:opacity-60 text-[#FEF7E6] font-bold py-3 rounded-lg transition text-sm"
                >
                  {loading ? 'Đang gửi...' : '📩 Gửi bản tóm tắt cho em'}
                </button>
              </form>

              <p className="text-center text-xs text-stone-400 mt-3">
                Không spam. Bấm ✕ để bỏ qua.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
