'use client'
import { useEffect, useState } from 'react'

interface LeadData {
  total: number
  this_week: number
}

// Module-level singleton: deduplicate across both component instances on the same page
let _promise: Promise<LeadData | null> | null = null
let _cacheUntil = 0

function fetchLeadCount(): Promise<LeadData | null> {
  const now = Date.now()
  if (!_promise || now > _cacheUntil) {
    _cacheUntil = now + 5 * 60 * 1000 // 5-min client-side cache
    _promise = fetch('/api/lead-count')
      .then(r => (r.ok ? (r.json() as Promise<LeadData>) : null))
      .catch(() => null)
  }
  return _promise
}

// ── Hero variant ─────────────────────────────────────────────────────────────

export function LeadCounterHero() {
  const [data, setData] = useState<LeadData | null | 'error'>('error') // 'error' = loading initially skipped
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeadCount().then(d => {
      setData(d ?? 'error')
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center mb-4">
        <div className="h-4 w-64 bg-stone-200 rounded-full animate-pulse" />
      </div>
    )
  }

  if (data === 'error' || data === null) {
    return (
      <p className="text-sm text-stone-500 text-center mb-4">
        📊 Hơn 2,800 sale đã tải
      </p>
    )
  }

  return (
    <p className="text-sm text-stone-500 text-center mb-4">
      📊 Đã có{' '}
      <strong className="text-stone-700">
        {data.total.toLocaleString('vi-VN')}
      </strong>{' '}
      sale Việt tải Bản Đồ —{' '}
      <strong className="text-stone-700">{data.this_week}</strong> người tuần này
    </p>
  )
}

// ── Form variant ─────────────────────────────────────────────────────────────

export function LeadCounterForm() {
  const [data, setData] = useState<LeadData | null | 'error'>('error')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeadCount().then(d => {
      setData(d ?? 'error')
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center mb-2">
        <div className="h-3.5 w-52 bg-stone-100 rounded-full animate-pulse" />
      </div>
    )
  }

  if (data === 'error' || data === null) {
    return (
      <p className="text-center text-xs text-stone-400 mb-2">
        Hơn 2,800 sale đã tải
      </p>
    )
  }

  return (
    <p className="text-center text-xs font-medium text-amber-700 mb-2">
      🔥 {data.this_week} sale đã tải tuần này — anh/chị là người tiếp theo?
    </p>
  )
}
