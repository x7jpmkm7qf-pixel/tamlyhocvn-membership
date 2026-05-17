import { NextResponse } from 'next/server'
import { getMemberSession, getAdminSession } from '@/lib/auth'
import { getMember } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = getMemberSession()
  const isAdmin = getAdminSession()

  if (!session) {
    return NextResponse.json({ member: null, isAdmin })
  }

  const stored = await getMember(session.email).catch(() => undefined)
  const emailVerified = stored?.emailVerified === true

  // Compute days remaining on subscription
  const expiresAt = stored?.expiresAt ?? null
  const daysLeft = expiresAt
    ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // Product + tier for client-side gating.
  // Legacy members (product undefined) treated as 'membership' to preserve existing access.
  const product = stored?.product ?? 'membership'
  const tier = stored?.tier ?? 'ngoaimon'

  return NextResponse.json({
    member: { ...session, emailVerified, expiresAt, daysLeft, product, tier },
    isAdmin,
  })
}
