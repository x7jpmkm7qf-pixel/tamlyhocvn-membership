'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/pixel'
import { trackTTEvent } from '@/lib/tiktok-pixel'

interface Props {
  event: string
  params?: Record<string, unknown>
  /** Optional session-level dedupe — fire only once per browser session */
  dedupeKey?: string
  /** eventID dùng để FB + TikTok dedupe với server-side Events API */
  eventID?: string
}

/**
 * Client-side mount tracker — fires Pixel events khi component mount.
 * Fire CẢ Meta (Facebook) Pixel + TikTok Pixel với cùng eventID để dedupe
 * với server-side Conversion API tương ứng.
 *
 * 2 lớp dedupe:
 * - dedupeKey: chỉ fire 1 lần per browser session (chống reload double-count)
 * - eventID:   Meta/TikTok dedupe với server events có cùng eventID
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
    // Fire cả 2 pixel — Meta dùng tên event giống, TikTok dùng tên gần giống
    trackEvent(event, params, eventID)
    trackTTEvent(event, params, eventID)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
