import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getFreeLeads } from '@/lib/free-leads'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  converted: 'Đã chốt 99K',
  lost: 'Mất lead',
}

function csvEscape(v: string | undefined): string {
  if (v === undefined || v === null) return ''
  const s = String(v)
  // RFC 4180: quote if contains comma, quote, or newline
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatVN(iso: string | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
  } catch {
    return ''
  }
}

export async function GET() {
  if (!getAdminSession()) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  const leads = await getFreeLeads()
  leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const headers = [
    'STT',
    'Tên',
    'Email',
    'SĐT',
    'Ngành',
    'Nguồn',
    'Trạng thái',
    'Ngày tải',
    'Ngày liên hệ',
    'Ngày chốt',
    'Ghi chú',
  ]

  const rows = leads.map((l, i) => [
    String(i + 1),
    l.name,
    l.email,
    l.phone || '',
    l.industry || '',
    l.source,
    STATUS_LABEL[l.status] || l.status,
    formatVN(l.createdAt),
    formatVN(l.contactedAt),
    formatVN(l.convertedAt),
    l.note || '',
  ])

  // BOM for Excel UTF-8 detection (so Vietnamese diacritics render properly)
  const csv =
    '﻿' +
    [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n')

  const today = new Date().toISOString().slice(0, 10)
  const filename = `free-leads-${today}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
