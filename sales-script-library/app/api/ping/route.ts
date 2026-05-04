/**
 * GET /api/ping — warm-up endpoint
 * Giữ Vercel function luôn warm để webhook xử lý nhanh
 */
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() })
}
