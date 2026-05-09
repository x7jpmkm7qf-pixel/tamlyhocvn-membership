'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'tlh_freedl_offer_start'
const DURATION_MS = 24 * 60 * 60 * 1000 // 24h

interface Props {
  /** Render UI cho countdown — gọi với { hh, mm, ss, expired } */
  children: (state: { hh: string; mm: string; ss: string; expired: boolean }) => React.ReactNode
  /** Callback khi expire (optional) */
  onExpire?: () => void
}

/**
 * 24h countdown timer cho first-time visitor offer.
 * - Lưu start time vào localStorage → khách đóng tab quay lại vẫn cùng 1 timer
 * - Tự update mỗi giây
 * - Khi hết hạn → state.expired = true
 */
export default function CountdownTimer({ children, onExpire }: Props) {
  const [now, setNow] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let start: number
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed)) {
          start = parsed
        } else {
          start = Date.now()
          localStorage.setItem(STORAGE_KEY, String(start))
        }
      } else {
        start = Date.now()
        localStorage.setItem(STORAGE_KEY, String(start))
      }
    } catch {
      start = Date.now()
    }
    setStartedAt(start)
    setNow(Date.now())

    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Đợi mounted (tránh hydration mismatch)
  if (now === null || startedAt === null) {
    return <>{children({ hh: '24', mm: '00', ss: '00', expired: false })}</>
  }

  const elapsed = now - startedAt
  const remaining = DURATION_MS - elapsed
  const expired = remaining <= 0

  if (expired && onExpire) {
    onExpire()
  }

  const totalSec = Math.max(0, Math.floor(remaining / 1000))
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0')
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')

  return <>{children({ hh, mm, ss, expired })}</>
}
