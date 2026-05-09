/**
 * Facebook (Meta) Conversion API — server-side event tracking
 *
 * Tại sao cần CAPI:
 * - Bypass ad-blockers (~30% user block fbevents.js)
 * - Tracking ổn định khi browser block 3rd-party scripts
 * - iOS 14.5+ ATT compliant
 * - Match quality cao hơn (server có thêm IP, user agent, hashed email/phone)
 *
 * Setup:
 * 1. Vào Events Manager → Pixel `2401396086990381` → Settings → Conversions API
 * 2. Generate Access Token → set vào Vercel env: FB_CAPI_ACCESS_TOKEN
 * 3. (Optional) Test Events tab → copy test_event_code → set FB_CAPI_TEST_EVENT_CODE
 *
 * Dedupe:
 * - Pass cùng event_id từ cả browser Pixel (eventID option) và server (event_id field)
 * - FB tự dedupe events trùng event_id trong 48h
 */

import crypto from 'crypto'
import { PIXEL_ID } from './pixel'

const ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN
const TEST_EVENT_CODE = process.env.FB_CAPI_TEST_EVENT_CODE

function sha256(input?: string | null): string | undefined {
  if (!input) return undefined
  return crypto
    .createHash('sha256')
    .update(input.trim().toLowerCase())
    .digest('hex')
}

/** Normalize VN phone → 84xxxxxxxxx */
function normalizePhone(phone?: string | null): string | undefined {
  if (!phone) return undefined
  let n = phone.replace(/[^0-9]/g, '')
  if (n.startsWith('0')) n = '84' + n.slice(1)
  else if (!n.startsWith('84') && n.length === 9) n = '84' + n
  return n
}

export interface CapiUserData {
  email?: string | null
  phone?: string | null
  name?: string | null
  ip?: string | null
  userAgent?: string | null
  fbp?: string | null   // _fbp cookie
  fbc?: string | null   // fbc (derived from fbclid)
  externalId?: string | null  // member.id
}

export interface CapiPurchaseOptions {
  user: CapiUserData
  amount: number
  currency?: string
  sku: string
  productName?: string
  /** event_id phải KHỚP với client Pixel eventID để dedupe */
  eventId: string
  eventSourceUrl?: string
}

function buildUserData(user: CapiUserData): Record<string, unknown> {
  const ud: Record<string, unknown> = {}

  if (user.email) ud.em = [sha256(user.email)]
  const phone = normalizePhone(user.phone)
  if (phone) ud.ph = [sha256(phone)]

  if (user.name) {
    const parts = user.name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      ud.fn = [sha256(parts.slice(0, -1).join(' '))]
      ud.ln = [sha256(parts[parts.length - 1])]
    } else if (parts.length === 1) {
      ud.fn = [sha256(parts[0])]
    }
  }

  if (user.ip) ud.client_ip_address = user.ip
  if (user.userAgent) ud.client_user_agent = user.userAgent
  if (user.fbp) ud.fbp = user.fbp
  if (user.fbc) ud.fbc = user.fbc
  if (user.externalId) ud.external_id = [sha256(user.externalId)]

  return ud
}

export async function sendPurchaseEvent(
  opts: CapiPurchaseOptions
): Promise<{ ok: boolean; reason?: string }> {
  if (!ACCESS_TOKEN) {
    console.warn('[FB CAPI] FB_CAPI_ACCESS_TOKEN chưa set — bỏ qua server event')
    return { ok: false, reason: 'no_token' }
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId,
        action_source: 'website',
        event_source_url:
          opts.eventSourceUrl || 'https://www.tamlyhocvn.club',
        user_data: buildUserData(opts.user),
        custom_data: {
          currency: opts.currency || 'VND',
          value: opts.amount,
          content_ids: [opts.sku],
          content_type: 'product',
          content_name: opts.productName || opts.sku,
        },
      },
    ],
  }

  if (TEST_EVENT_CODE) {
    payload.test_event_code = TEST_EVENT_CODE
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      console.error('[FB CAPI] Error:', res.status, JSON.stringify(json))
      return { ok: false, reason: `http_${res.status}` }
    }

    console.log(
      '[FB CAPI] ✅ Purchase sent:',
      JSON.stringify({
        event_id: opts.eventId,
        amount: opts.amount,
        sku: opts.sku,
        events_received: json?.events_received,
        fbtrace_id: json?.fbtrace_id,
      })
    )
    return { ok: true }
  } catch (e) {
    console.error('[FB CAPI] Network error:', e instanceof Error ? e.message : e)
    return { ok: false, reason: 'network_error' }
  }
}
