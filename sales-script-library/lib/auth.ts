import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2024'
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

export function getMemberSession(): SessionMember | null {
  try {
    const store = cookies()
    const raw = store.get(MEMBER_COOKIE)?.value
    if (!raw) return null
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')) as SessionMember
  } catch {
    return null
  }
}

export function getAdminSession(): boolean {
  try {
    const store = cookies()
    const val = store.get(ADMIN_COOKIE)?.value
    return val === 'true'
  } catch {
    return false
  }
}

export function setMemberCookie(member: SessionMember): string {
  const encoded = Buffer.from(JSON.stringify(member)).toString('base64')
  return encoded
}

export const MEMBER_COOKIE_NAME = MEMBER_COOKIE
export const ADMIN_COOKIE_NAME = ADMIN_COOKIE
