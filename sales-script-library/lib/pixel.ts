/**
 * Facebook (Meta) Pixel — helper functions cho tracking conversion events
 *
 * Pixel ID được khởi tạo trong components/MetaPixel.tsx (load global vào window.fbq).
 * Các page muốn track event chỉ cần import { trackXxx } từ file này.
 */

export const PIXEL_ID = '2401396086990381'

type FBQ = (action: string, event: string, params?: Record<string, unknown>) => void

function getFbq(): FBQ | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).fbq || null
}

export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  const fbq = getFbq()
  if (!fbq) return
  try {
    fbq('track', name, params)
  } catch (e) {
    console.warn('[pixel] track error:', e)
  }
}

/** Khi user vào trang thanh toán (xem QR / nhập thẻ) — chưa thanh toán */
export function trackInitiateCheckout(
  value: number,
  sku: string,
  contentName?: string
): void {
  trackEvent('InitiateCheckout', {
    value,
    currency: 'VND',
    content_ids: [sku],
    content_type: 'product',
    content_name: contentName || sku,
  })
}

/** Khi thanh toán thành công (đến trang /success) */
export function trackPurchase(
  value: number,
  sku: string,
  contentName?: string
): void {
  trackEvent('Purchase', {
    value,
    currency: 'VND',
    content_ids: [sku],
    content_type: 'product',
    content_name: contentName || sku,
  })
}

/** Lead capture — khi user nhập email vào lead magnet form */
export function trackLead(contentName?: string): void {
  trackEvent('Lead', {
    content_name: contentName,
  })
}

/** Khi user complete đăng ký tài khoản */
export function trackCompleteRegistration(): void {
  trackEvent('CompleteRegistration')
}
