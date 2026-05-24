'use client'
import { useEffect, useRef } from 'react'

const MAX = 30

export default function AffiliateProgressBar({ current }: { current: number }) {
  const barRef = useRef<HTMLDivElement>(null)
  const pct = Math.min(100, Math.round((current / MAX) * 100))
  const isPremium = current >= MAX
  const remaining = MAX - current

  useEffect(() => {
    if (!barRef.current) return
    barRef.current.style.width = '0%'
    let inner: number
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        if (barRef.current) barRef.current.style.width = `${pct}%`
      })
    })
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
  }, [pct])

  if (isPremium) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(201,169,97,0.15)', border: '1px solid rgba(201,169,97,0.5)',
        borderRadius: '2rem', padding: '0.5rem 1.25rem',
        fontSize: '0.875rem', fontWeight: 700, color: '#C9A961',
        marginBottom: '1.5rem',
      }}>
        🏆 Premium Affiliate — Đang nhận 150k/đơn
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '1.5rem', background: '#0a1e35', border: '1px solid rgba(201,169,97,0.2)', borderRadius: '0.75rem', padding: '1rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.625rem', letterSpacing: '0.02em' }}>
        Tiến độ lên Premium 👑
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(201,169,97,0.15)' }}>
        <div
          ref={barRef}
          style={{
            height: '100%',
            width: '0%',
            background: 'linear-gradient(90deg, #a07830 0%, #C9A961 60%, #e8c97a 100%)',
            borderRadius: '4px',
            transition: 'width 1s ease-out',
          }}
        />
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#a09070' }}>
        <span style={{ color: '#C9A961', fontWeight: 700 }}>{current}</span>
        <span>/30 đơn — còn </span>
        <span style={{ color: '#FEF7E6', fontWeight: 600 }}>{remaining} đơn</span>
        <span> để lên 150.000đ/đơn</span>
      </div>
    </div>
  )
}
