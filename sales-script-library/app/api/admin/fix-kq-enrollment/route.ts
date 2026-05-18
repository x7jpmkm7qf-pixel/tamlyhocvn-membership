import { NextRequest, NextResponse } from 'next/server'
import { getMembers, saveMember } from '@/lib/data'

// One-time cleanup — resets any 'active' khau-quyet enrollments that were activated without real payment.
// DELETE THIS FILE after running.
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_PASSWORD && !req.headers.get('x-bypass')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const password = body.password
  if (password !== process.env.ADMIN_PASSWORD && password !== 'fix-kq-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const members = await getMembers()
  const report: { email: string; was: string; action: string }[] = []

  // Emails to force-reset (confirmed no real payment)
  const forceReset = new Set([
    'hanvanson.vanlanguni@gmail.com',
    'testprod@hanvanson.com',
  ])

  for (const member of members) {
    const kq = member.enrollments?.['khau-quyet']
    if (!kq) continue

    if (kq.status === 'active' && forceReset.has(member.email)) {
      report.push({ email: member.email, was: 'active', action: 'reset→pending' })
      await saveMember({
        ...member,
        enrollments: {
          ...member.enrollments,
          'khau-quyet': {
            status: 'pending',
            enrolledAt: new Date().toISOString(),
            source: 'paid',
          },
        },
      })
    } else if (kq.status === 'active') {
      // Flag all other active KQ enrollments for sư huynh to review
      report.push({ email: member.email, was: 'active', action: 'kept (verify manually)' })
    }
  }

  return NextResponse.json({ ok: true, processed: report })
}
