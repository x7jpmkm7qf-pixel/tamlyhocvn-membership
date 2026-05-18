#!/usr/bin/env node
/**
 * Mock script: set enrollments['khau-quyet'] = active cho 1 email test.
 * Dùng để test Flow 2 trên staging TRƯỚC khi seed production.
 *
 * Chạy:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... node scripts/mock-kq-active.mjs your@email.com
 *
 * Hoặc với env file:
 *   node -r dotenv/config scripts/mock-kq-active.mjs dotenv_config_path=.env.local your@email.com
 */

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const targetEmail = process.argv[2]

if (!REDIS_URL || !REDIS_TOKEN) {
  console.error('❌ Cần UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN')
  process.exit(1)
}
if (!targetEmail) {
  console.error('❌ Usage: node scripts/mock-kq-active.mjs <email>')
  process.exit(1)
}

async function rget(key) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['GET', key]),
  })
  const { result } = await res.json()
  if (!result) return null
  return typeof result === 'string' ? JSON.parse(result) : result
}

async function rset(key, value) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, JSON.stringify(value)]),
  })
  return (await res.json()).result
}

async function main() {
  const members = await rget('msl:members') || []
  const idx = members.findIndex(m => m.email.toLowerCase() === targetEmail.toLowerCase())

  if (idx < 0) {
    console.error(`❌ Không tìm thấy member với email: ${targetEmail}`)
    console.log('\n📋 Danh sách email hiện có:')
    members.forEach(m => console.log(`   - ${m.email} (${m.status})`))
    process.exit(1)
  }

  const member = members[idx]
  console.log(`✅ Tìm thấy: ${member.name} <${member.email}> — status: ${member.status}`)

  // Set KQ enrollment active
  members[idx] = {
    ...member,
    enrollments: {
      ...(member.enrollments || {}),
      'khau-quyet': {
        status: 'active',
        enrolledAt: new Date().toISOString(),
        source: 'paid',
        activatedAt: new Date().toISOString(),
        referenceCode: 'MOCK-TEST-001',
      },
    },
  }

  await rset('msl:members', members)
  console.log(`✅ Đã set enrollments['khau-quyet'] = active cho ${member.email}`)
  console.log('\n📋 Trạng thái enrollments mới:')
  console.log(JSON.stringify(members[idx].enrollments, null, 2))
  console.log('\n→ Login vào staging và test Flow 2 ngay.')
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
