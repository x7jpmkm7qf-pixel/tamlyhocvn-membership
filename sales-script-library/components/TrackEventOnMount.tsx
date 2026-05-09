'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/pixel'

interface Props {
  event: string
  params?: Record<string, unknown>
  /** Optional dedupe key — fire only once per session for this key */
  dedupeKey?: string
}

/**
 * Client-side mount tracker — fires a Pixel event when component mounts.
 * Có thể dùng trong cả server và client component (tự bound vào client side).
 *
 * Vd:
 *   <TrackEventOnMount event="Purchase" params={{ value: 99000, currency: 'VND', content_ids: ['register'] }} dedupeKey="purchase_register" />
 */
export default function TrackEventOnMount({ event, params, dedupeKey }: Props) {
  useEffect(() => {
    if (dedupeKey && typeof window !== 'undefined') {
      const flagKey = `pixel_fired_${dedupeKey}`
      try {
        if (sessionStorage.getItem(flagKey)) return
        sessionStorage.setItem(flagKey, '1')
      } catch {
        // sessionStorage có thể fail (private mode) — vẫn fire để không miss conversion
      }
    }
    trackEvent(event, params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
