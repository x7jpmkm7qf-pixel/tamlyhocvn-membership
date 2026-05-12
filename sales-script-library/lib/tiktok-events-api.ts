/**
 * TikTok Events API — server-side conversion tracking.
 *
 * Tại sao cần Server CAPI:
 * - Bypass ad-blockers (~30% user block 3rd-party scripts)
 * - Tracking ổn định khi browser block client pixel
 * - iOS 14.5+ ATT compliant
 * - Match quality cao hơn (server có IP, UA, hashed email/phone)
 *
 * Dedupe với client Pixel:
 * - Truyền cùng `event_id` từ cả client (`ttq.track(..., { event_id })`)
 *   và server (field `event_id` trong payload)
 * - TikTok tự dedupe events trùng event_id trong 7 ngày
 *
 * Docs: https://business-api.tiktok.com/portal/docs?id=1771101303285761
 */

import crypto from 'crypto'
import { TIKTOK_PIXEL_ID } from './tiktok-pixel'

const ACCESS_TOKEN = process.env.TIKTOK_EVENTS_API_TOKEN
const API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'
const TEST_EVENT_CODE = process.env.TIKTOK_TEST_EVENT_CODE

function sha256(input?: string | null): string | undefined {
  if (!input) return undefined
  return crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex')
}

/** Normalize VN phone về dạng E.164 (+84...) — TikTok yêu cầu format này */
function normalizePhoneE164(phone?: string | null): string | undefined {
  if (!phone) return undefined
  let n = phone.replace(/[^0-9]/g, '')
  if (n.startsWith('0')) n = '84' + n.slice(1)
  else if (!n.startsWith('84') && n.length === 9) n = '84' + n
  if (!n) return undefined
  return '+' + n
}

export interface TTUserData {
  email?: string | null
  phone?: string | null
  ip?: string | null
  userAgent?: string | null
  externalId?: string | null  // member.id (sẽ hash)
  ttp?: string | null         // _ttp cookie (collected từ client)
  ttclid?: string | null      // ttclid query param (collected từ client/cookie)
}

export interface TTPurchaseOptions {
  user: TTUserData
  amount: number
  currency?: string
  sku: string
  productName?: string
  /** event_id PHẢI khớp với client Pixel để TikTok dedupe */
  eventId: string
  eventSourceUrl?: string
}

function buildUserData(user: TTUserData): Record<string, unknown> {
  const ud: Record<string, unknown> = {}
  if (user.email) ud.email = sha256(user.email)
  const phone = normalizePhoneE164(user.phone)
  if (phone) ud.phone = sha256(phone)
  if (user.externalId) ud.external_id = sha256(user.externalId)
  if (user.ttp) ud.ttp = user.ttp
  if (user.ttclid) ud.ttclid = user.ttclid
  if (user.ip) ud.ip = user.ip
  if (user.userAgent) ud.user_agent = user.userAgent
  return ud
}

export async function sendTikTokPurchaseEvent(
  opts: TTPurchaseOptions
): Promise<{ ok: boolean; reason?: string }> {
  if (!ACCESS_TOKEN) {
    console.warn('[TikTok CAPI] TIKTOK_EVENTS_API_TOKEN chưa set — bỏ qua')
    return { ok: false, reason: 'no_token' }
  }

  const payload = {
    event_source: 'web',
    event_source_id: TIKTOK_PIXEL_ID,
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
    data: [
      {
        event: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: opts.eventId,
        user: buildUserData(opts.user),
        properties: {
          currency: opts.currency || 'VND',
          value: opts.amount,
          contents: [
            {
              content_id: opts.sku,
              content_type: 'product',
              content_name: opts.productName || opts.sku,
              quantity: 1,
              price: opts.amount,
            },
          ],
        },
        page: {
          url: opts.eventSourceUrl || 'https://www.tamlyhocvn.club',
        },
      },
    ],
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': ACCESS_TOKEN,
      },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))

    if (!res.ok || json?.code !== 0) {
      console.error(
        '[TikTok CAPI] Error:',
        res.status,
        JSON.stringify({ code: json?.code, message: json?.message, request_id: json?.request_id })
      )
      return { ok: false, reason: `code_${json?.code || res.status}` }
    }

    console.log(
      '[TikTok CAPI] ✅ Purchase sent:',
      JSON.stringify({
        event_id: opts.eventId,
        amount: opts.amount,
        sku: opts.sku,
        events_received: json?.data?.events_received,
        request_id: json?.request_id,
      })
    )
    return { ok: true }
  } catch (e) {
    console.error('[TikTok CAPI] Network error:', e instanceof Error ? e.message : e)
    return { ok: false, reason: 'network_error' }
  }
}
