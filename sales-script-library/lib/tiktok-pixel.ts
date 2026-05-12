/**
 * TikTok Pixel — client-side tracking helper.
 *
 * Pixel ID + Events API token được set qua env var:
 * - NEXT_PUBLIC_TIKTOK_PIXEL_ID: public, dùng cho client script
 * - TIKTOK_EVENTS_API_TOKEN: secret, dùng cho server-side Events API
 *
 * Đặt event trên client qua trackTTEvent('Purchase', { value, currency, ... }, eventID)
 * Đặt event trên server qua lib/tiktok-events-api.ts (server CAPI).
 *
 * Dedupe: eventID phải khớp giữa client + server để TikTok merge thành 1 event.
 */

export const TIKTOK_PIXEL_ID =
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'D81A9QRC77UCEH8TBC1G'

type TTQ = {
  track: (event: string, params?: Record<string, unknown>, options?: { event_id?: string }) => void
  page: () => void
  identify: (params?: Record<string, unknown>) => void
}

function getTtq(): TTQ | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).ttq || null
}

/**
 * Fire TikTok Pixel event từ client.
 * @param eventName  vd: 'Purchase' | 'InitiateCheckout' | 'AddToCart' | 'CompleteRegistration'
 * @param params     custom_data vd: { value, currency, contents }
 * @param eventID    dùng để dedupe với server-side Events API
 */
export function trackTTEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventID?: string
): void {
  const ttq = getTtq()
  if (!ttq) return
  try {
    if (eventID) {
      ttq.track(eventName, params, { event_id: eventID })
    } else {
      ttq.track(eventName, params)
    }
  } catch (e) {
    console.warn('[tiktok-pixel] track error:', e)
  }
}
