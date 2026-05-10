import { cookies } from 'next/headers'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2024'
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-secret-change-me-in-production'
const MEMBER_COOKIE = 'ssl_member'
const ADMIN_COOKIE = 'ssl_admin'

export interface SessionMember {
  id: string
  name: string
  email: string
}

export function getAdminPassword() {
  return ADMIN_PASSWORD
}

// ── Cookie signing (HMAC-SHA256) ────────────────────────────────────────────

function sign(payload: string): string {
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

export function getMemberSession(): SessionMember | null {
  try {
    const store = cookies()
    const raw = store.get(MEMBER_COOKIE)?.value
    if (!raw) return null
    const dot = raw.lastIndexOf('.')
    if (dot < 0) return null  // legacy unsigned cookie → reject
    const payload = raw.slice(0, dot)
    const sig = raw.slice(dot + 1)
    if (!safeEqual(sig, sign(payload))) return null
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as SessionMember
  } catch {
    return null
  }
}

export function getAdminSession(): boolean {
  try {
    const store = cookies()
    const raw = store.get(ADMIN_COOKIE)?.value
    if (!raw) return false
    const dot = raw.lastIndexOf('.')
    if (dot < 0) return false
    const payload = raw.slice(0, dot)
    const sig = raw.slice(dot + 1)
    if (!safeEqual(sig, sign(payload))) return false
    return Buffer.from(payload, 'base64url').toString('utf-8') === 'admin'
  } catch {
    return false
  }
}

export function setMemberCookie(member: SessionMember): string {
  const payload = Buffer.from(JSON.stringify(member)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function setAdminCookieValue(): string {
  const payload = Buffer.from('admin').toString('base64url')
  return `${payload}.${sign(payload)}`
}

// ── Password hashing (bcrypt) ───────────────────────────────────────────────

const BCRYPT_PREFIX = /^\$2[aby]\$/

export function isHashedPassword(s: string): boolean {
  return BCRYPT_PREFIX.test(s)
}

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, 10)
}

export async function verifyPassword(plaintext: string, stored: string): Promise<boolean> {
  if (isHashedPassword(stored)) return bcrypt.compare(plaintext, stored)
  return plaintext === stored  // legacy plaintext — caller should re-hash on success
}

// ── Admin password override via Redis ─────────────────────────────────────
// Cho phép user đổi password qua admin panel (không cần redeploy).
// Logic verify: nếu Redis có hash → dùng Redis (ưu tiên).
// Nếu Redis trống → fallback ADMIN_PASSWORD env var.
//
// Khi user đổi password lần đầu → hash bcrypt được lưu Redis,
// từ đó env var không còn quan trọng (nhưng giữ làm fallback).

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const ADMIN_PWD_KEY = 'msl:admin_password_hash'

async function redisGet<T>(key: string): Promise<T | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null
  try {
    const res = await fetch(REDIS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['GET', key]),
      cache: 'no-store',
    })
    const json = await res.json()
    const result = json.result
    if (result === null || result === undefined) return null
    return (typeof result === 'string' ? JSON.parse(result) : result) as T
  } catch {
    return null
  }
}

async function redisSet(key: string, value: unknown): Promise<boolean> {
  if (!REDIS_URL || !REDIS_TOKEN) return false
  try {
    await fetch(REDIS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', key, JSON.stringify(value)]),
      cache: 'no-store',
    })
    return true
  } catch {
    return false
  }
}

/** Verify admin password — check Redis hash first, fallback env var */
export async function verifyAdminPassword(plaintext: string): Promise<boolean> {
  const redisHash = await redisGet<string>(ADMIN_PWD_KEY)
  if (redisHash && typeof redisHash === 'string') {
    return bcrypt.compare(plaintext, redisHash)
  }
  // Fallback env var (lần đầu chưa đổi password, hoặc Redis lỗi)
  return plaintext === ADMIN_PASSWORD
}

/** Set new admin password — bcrypt hash stored in Redis */
export async function setAdminPasswordHash(plaintext: string): Promise<boolean> {
  const hash = await bcrypt.hash(plaintext, 10)
  return redisSet(ADMIN_PWD_KEY, hash)
}

/** Validate password strength — 12+ chars, có cả chữ + số */
export function validatePasswordStrength(plaintext: string): { ok: boolean; reason?: string } {
  if (plaintext.length < 12) return { ok: false, reason: 'Mật khẩu phải có ít nhất 12 ký tự' }
  if (!/[A-Za-z]/.test(plaintext)) return { ok: false, reason: 'Phải có ít nhất 1 chữ cái' }
  if (!/[0-9]/.test(plaintext)) return { ok: false, reason: 'Phải có ít nhất 1 chữ số' }
  // Check không phải mật khẩu phổ biến
  const COMMON = ['admin2024', '12345678', 'password', 'admin1234', 'tamlyhocvn']
  if (COMMON.some(c => plaintext.toLowerCase().includes(c))) {
    return { ok: false, reason: 'Mật khẩu quá phổ biến — vui lòng chọn mật khẩu khác' }
  }
  return { ok: true }
}

export const MEMBER_COOKIE_NAME = MEMBER_COOKIE
export const ADMIN_COOKIE_NAME = ADMIN_COOKIE
