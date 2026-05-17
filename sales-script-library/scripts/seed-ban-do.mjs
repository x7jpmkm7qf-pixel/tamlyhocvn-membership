#!/usr/bin/env node
/**
 * Seed script: ghi dữ liệu Bản Đồ vào Upstash Redis trực tiếp.
 * Chạy: UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... node scripts/seed-ban-do.mjs
 *
 * Hoặc với vercel env: vercel env pull .env.seed --environment=production && node -r dotenv/config scripts/seed-ban-do.mjs dotenv_config_path=.env.seed
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

if (!REDIS_URL || !REDIS_TOKEN) {
  console.error('❌ Cần UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN')
  console.error('   Chạy: UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... node scripts/seed-ban-do.mjs')
  process.exit(1)
}

async function rset(key, value) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, JSON.stringify(value)]),
  })
  const json = await res.json()
  return json.result
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

async function main() {
  const seedFile = path.join(ROOT, 'data', 'courses', 'ban-do.json')
  const { course, chapters } = JSON.parse(readFileSync(seedFile, 'utf-8'))

  console.log(`📚 Seeding: ${course.title}`)
  console.log(`   Chapters: ${chapters.length}`)

  // Upsert course into msl:courses
  let courses = await rget('msl:courses') || []
  const idx = courses.findIndex(c => c.id === course.id)
  if (idx >= 0) courses[idx] = course
  else courses.push(course)
  await rset('msl:courses', courses)
  console.log(`✅ msl:courses updated (${courses.length} total)`)

  // Set chapters
  await rset(`msl:course_content:${course.slug}`, chapters)
  console.log(`✅ msl:course_content:${course.slug} set (${chapters.length} chapters)`)

  console.log('\n🎉 Seed hoàn thành!')
  console.log(`   Seed ID: ${course.id}`)
  console.log(`   Slug: ${course.slug}`)
}

main().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
