import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getMembers } from '@/lib/data'

export const dynamic = 'force-dynamic'

const BASE_FLOOR = 500

const getLeadCount = unstable_cache(
  async () => {
    const members = await getMembers()
    const leads = members.filter(m => m.enrollments?.['ban-do'])
    const raw = leads.length
    const total = raw < BASE_FLOOR ? BASE_FLOOR : raw

    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    const thisWeek = leads.filter(m => {
      const at = m.enrollments?.['ban-do']?.enrolledAt
      return at && new Date(at).getTime() > cutoff
    }).length

    return { total, this_week: thisWeek }
  },
  ['lead-count'],
  { revalidate: 3600 },
)

export async function GET() {
  try {
    const data = await getLeadCount()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60' },
    })
  } catch {
    return NextResponse.json({ total: BASE_FLOOR, this_week: 0 }, { status: 500 })
  }
}
