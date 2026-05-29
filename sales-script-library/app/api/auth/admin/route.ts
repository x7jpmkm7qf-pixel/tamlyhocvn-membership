import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, setAdminCookieValue, ADMIN_COOKIE_NAME, sessionCookieOptions } from '@/lib/auth'
import { notifyAdminLoginSuccess, notifyAdminLoginFailedLockout } from '@/lib/telegram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Rate limit (in-memory) ─────────────────────────────────────────────────
// Theo IP: max 5 fail attempts trong 15 phút → block 1 giờ
// Map<ip, { fails: number[], blockedUntil?: number }>
interface AttemptRecord {
  fails: number[]
  blockedUntil?: number
}
const attempts = new Map<string, AttemptRecord>()

const FAIL_WINDOW_MS = 15 * 60 * 1000  // 15 phút
const MAX_FAILS = 5
const BLOCK_DURATION_MS = 60 * 60 * 1000  // 1 giờ

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anon'
  )
}

function checkRateLimit(ip: string): { allowed: boolean; secondsLeft?: number } {
  const now = Date.now()
  const record = attempts.get(ip)
  if (!record) return { allowed: true }

  // Check block
  if (record.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      secondsLeft: Math.ceil((record.blockedUntil - now) / 1000),
    }
  }

  // Cleanup expired blocks
  if (record.blockedUntil && now >= record.blockedUntil) {
    record.blockedUntil = undefined
    record.fails = []
  }
  return { allowed: true }
}

function recordFail(ip: string, userAgent: string): { blocked: boolean } {
  const now = Date.now()
  const record = attempts.get(ip) || { fails: [] }
  // Filter out fails outside window
  record.fails = record.fails.filter(t => now - t < FAIL_WINDOW_MS)
  record.fails.push(now)

  if (record.fails.length >= MAX_FAILS) {
    record.blockedUntil = now + BLOCK_DURATION_MS
    attempts.set(ip, record)
    // Alert admin về vụ tấn công
    notifyAdminLoginFailedLockout({
      ip,
      userAgent,
      failCount: record.fails.length,
      blockMinutes: Math.round(BLOCK_DURATION_MS / 60000),
    }).catch(console.error)
    return { blocked: true }
  }

  attempts.set(ip, record)
  return { blocked: false }
}

function clearFails(ip: string) {
  attempts.delete(ip)
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const userAgent = req.headers.get('user-agent') || 'unknown'

  // Rate limit check
  const rl = checkRateLimit(ip)
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: `IP của bạn đã bị tạm khóa do nhập sai quá nhiều lần. Thử lại sau ${Math.ceil((rl.secondsLeft || 0) / 60)} phút.`,
      },
      { status: 429 }
    )
  }

  const { password } = await req.json().catch(() => ({}))

  if (!password) {
    return NextResponse.json({ error: 'Vui lòng nhập mật khẩu' }, { status: 400 })
  }

  const ok = await verifyAdminPassword(password)
  if (!ok) {
    const { blocked } = recordFail(ip, userAgent)
    return NextResponse.json(
      {
        error: blocked
          ? 'Đã sai 5 lần — IP bị khóa 1 giờ.'
          : 'Mật khẩu không đúng',
      },
      { status: 401 }
    )
  }

  // ── Login thành công ───────────────────────────────────────────────
  clearFails(ip)

  // Alert admin qua Telegram (await để Vercel không kill)
  try {
    await notifyAdminLoginSuccess({ ip, userAgent })
  } catch (e) {
    console.error('[admin-login] telegram alert failed:', e instanceof Error ? e.message : e)
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE_NAME, setAdminCookieValue(), sessionCookieOptions(60 * 60 * 8))
  return res
}
