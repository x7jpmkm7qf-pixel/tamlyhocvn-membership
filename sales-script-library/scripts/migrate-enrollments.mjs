#!/usr/bin/env node
/**
 * One-time migration: add member.enrollments based on existing tier/product fields.
 * Run: UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... node scripts/migrate-enrollments.mjs
 */

import { fileURLToPath } from 'url'

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

if (!REDIS_URL || !REDIS_TOKEN) {
  console.error('❌ Cần UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN')
  process.exit(1)
}

async function rget(key) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['GET', key]),
  })
  const json = await res.json()
  const result = json.result
  if (!result) return null
  return typeof result === 'string' ? JSON.parse(result) : result
}

async function rset(key, value) {
  await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, JSON.stringify(value)]),
  })
}

async function main() {
  const members = await rget('msl:members') || []
  console.log(`📋 Tổng members: ${members.length}`)

  let migrated = 0
  const now = new Date().toISOString()

  const updated = members.map(m => {
    if (m.enrollments) {
      // Already migrated
      return m
    }

    const enrollments = {}

    // KQ buyers (ngoaimon with khauquyet product, or tier=ngoaimon with a payment ref)
    if (m.product === 'khauquyet' || (m.tier === 'ngoaimon' && m.lastReferenceCode)) {
      enrollments['khau-quyet'] = {
        status: 'active',
        enrolledAt: m.createdAt || now,
        source: 'paid',
        activatedAt: m.createdAt || now,
        referenceCode: m.lastReferenceCode,
      }
    }

    // Nội Môn buyers
    if (m.tier === 'noimon') {
      enrollments['noi-mon'] = {
        status: 'active',
        enrolledAt: m.upgradedAt || m.createdAt || now,
        source: 'paid',
        activatedAt: m.upgradedAt || m.createdAt || now,
        referenceCode: m.upgradeReferenceCode || m.lastReferenceCode,
      }
      // Nội Môn buyers also previously bought KQ (if not already set)
      if (!enrollments['khau-quyet'] && m.lastReferenceCode) {
        enrollments['khau-quyet'] = {
          status: 'active',
          enrolledAt: m.createdAt || now,
          source: 'paid',
          activatedAt: m.createdAt || now,
          referenceCode: m.lastReferenceCode,
        }
      }
    }

    if (Object.keys(enrollments).length === 0) {
      // Active member with no tier/product → likely free ban-do registration
      // Don't add any paid enrollment — they have no purchase record
      return m
    }

    migrated++
    console.log(`  ✅ ${m.email}: ${Object.keys(enrollments).join(', ')}`)
    return { ...m, enrollments }
  })

  await rset('msl:members', updated)
  console.log(`\n🎉 Migration xong! ${migrated}/${members.length} members đã migrate.`)
  if (migrated === 0) {
    console.log('   (Không có member nào cần migrate, hoặc tất cả đã có enrollments)')
  }
}

main().catch(err => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
