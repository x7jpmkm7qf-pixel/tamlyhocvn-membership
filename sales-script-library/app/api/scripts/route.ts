import { NextRequest, NextResponse } from 'next/server'
import { getScripts, saveScript, Script } from '@/lib/data'
import { getAdminSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  const scripts = getScripts()
  return NextResponse.json(scripts)
}

export async function POST(req: NextRequest) {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const body = await req.json()
  const script: Script = {
    id: `script-${uuidv4()}`,
    title: body.title,
    industry: body.industry,
    situation: body.situation,
    preview: body.preview,
    content: body.content,
    psychology: body.psychology,
    examples: body.examples,
    createdAt: new Date().toISOString(),
  }

  saveScript(script)
  return NextResponse.json(script, { status: 201 })
}
