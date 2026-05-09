'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/pixel'

interface Props {
  event: string
  params?: Record<string, unknown>
  /** Optional session-level dedupe — fire only once per browser session */
  dedupeKey?: string
  /** eventID dùng để FB dedupe với server-side Conversion API (cross-device, 48h window) */
  eventID?: string
}

/**
 * Client-side mount tracker — fires a Pixel event when component mounts.
 * Có thể dùng trong cả server và client component (tự bound vào client side).
 *
 * 2 lớp dedupe:
 * - dedupeKey: chỉ fire 1 lần per browser session (chống reload double-count)
 * - eventID:   FB tự dedupe với server CAPI events có cùng eventID (cross-device)
 *
 * Vd:
 *   <TrackEventOnMount
 *     event="Purchase"
 *     params={{ value: 99000, currency: 'VND', content_ids: ['register'] }}
 *     dedupeKey="purchase_register_123"
 *     eventID="purchase_register_123"
 *   />
 */
export default function TrackEventOnMount({ event, params, dedupeKey, eventID }: Props) {
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
    trackEvent(event, params, eventID)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
