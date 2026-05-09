'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CountdownTimer from './CountdownTimer'

const DISMISS_KEY = 'tlh_offer_bar_dismissed'

/**
 * Sticky offer bar fixed bottom — chỉ hiện khi user đã scroll đủ sâu.
 * - Mobile: full width
 * - Desktop: bottom với pill style
 * - User dismiss được (lưu localStorage cho session)
 * - Tự ẩn khi countdown expired
 */
export default function StickyOfferBar() {
  const [scrolled, setScrolled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check dismissed
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) {
        setDismissed(true)
      }
    } catch {}

    // Show after scroll 30% page
    const onScroll = () => {
      const scrollY = window.scrollY
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight
      if (pageHeight > 0 && scrollY / pageHeight > 0.2) {
        setScrolled(true)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function dismiss() {
    setDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }

  if (dismissed || !scrolled) return null

  return (
    <CountdownTimer>
      {({ hh, mm, ss, expired }) => (
        <div className="fixed bottom-0 left-0 right-0 z-50 print:hidden animate-slide-up">
          <div className="mx-auto max-w-3xl px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="bg-gradient-to-r from-violet-600 via-violet-700 to-amber-600 rounded-2xl shadow-2xl shadow-violet-900/50 border border-violet-400/30 overflow-hidden">
              <div className="flex items-stretch gap-2 p-2.5 sm:p-3">
                <button
                  onClick={dismiss}
                  aria-label="Đóng"
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm flex items-center justify-center transition self-start mt-1"
                >
                  ×
                </button>

                <div className="flex-1 min-w-0">
                  {expired ? (
                    <>
                      <p className="text-white font-bold text-sm sm:text-base leading-tight">
                        Mở khóa <strong>18+ kịch bản</strong> + lộ trình 30 ngày
                      </p>
                      <p className="text-amber-200 text-xs mt-0.5">99K/tháng — hủy bất kỳ lúc nào</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-bold text-sm sm:text-base leading-tight flex items-center gap-1.5 flex-wrap">
                        <span>🎁</span>
                        <span>Tặng kèm <span className="underline decoration-amber-300 decoration-2 underline-offset-2">audit 1-1 với Sơn</span></span>
                        <span className="text-amber-200 text-xs font-medium">(giá 1tr)</span>
                      </p>
                      <p className="text-amber-200/90 text-xs mt-0.5 flex items-center gap-1">
                        <span className="inline-block">⏱</span>
                        <span className="font-mono font-bold">{hh}:{mm}:{ss}</span>
                        <span>còn lại</span>
                      </p>
                    </>
                  )}
                </div>

                <Link
                  href="/register"
                  className="flex-shrink-0 bg-white hover:bg-amber-50 text-violet-700 font-black text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-lg transition flex items-center gap-1 whitespace-nowrap self-center"
                >
                  <span>99K</span>
                  <span className="hidden sm:inline">→</span>
                </Link>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes slide-up {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-slide-up {
              animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            }
          `}</style>
        </div>
      )}
    </CountdownTimer>
  )
}
