import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getMemberSession, getAdminSession } from '@/lib/auth'

export async function GET() {
  const member = getMemberSession()
  const isAdmin = getAdminSession()
  if (!member && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const file = path.join(process.cwd(), 'data', 'roadmap.json')
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
  return NextResponse.json(data)
}
