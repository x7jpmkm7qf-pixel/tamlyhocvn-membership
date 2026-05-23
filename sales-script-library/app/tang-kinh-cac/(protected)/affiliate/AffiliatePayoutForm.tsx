'use client'
import { useState } from 'react'

interface Props {
  availableTotal: number
  minWithdrawal: number
}

const gold = '#C9A961'
const dark = '#040e1c'
const mid  = '#0f2744'
const text = '#FEF7E6'
const muted = '#a09070'

export default function AffiliatePayoutForm({ availableTotal, minWithdrawal }: Props) {
  const [open, setOpen]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]   = useState('')
  const [form, setForm] = useState({ bank_name: '', bank_account: '', account_holder: '' })

  const canWithdraw = availableTotal >= minWithdrawal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.bank_name || !form.bank_account || !form.account_holder) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/tang-kinh-cac/affiliate/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Lỗi kết nối, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    if (!canWithdraw) {
      return (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
          background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.15)',
          borderRadius: '0.75rem', padding: '1rem 1.125rem',
        }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
          <p style={{ color: muted, fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
            Cần đủ <span style={{ color: '#FEF7E6', fontWeight: 700 }}>{minWithdrawal.toLocaleString('vi-VN')}đ</span> trong ví để rút.
            Hãy bắt đầu giới thiệu để kiếm hoa hồng!
          </p>
        </div>
      )
    }
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: gold, color: dark, fontWeight: 700, fontSize: '0.9375rem',
          padding: '0.875rem 2rem', borderRadius: '0.5rem', border: 'none',
          cursor: 'pointer', width: '100%',
        }}
      >
        💰 Rút {availableTotal.toLocaleString('vi-VN')}đ ngay
      </button>
    )
  }

  if (success) {
    return (
      <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
        <div style={{ color: '#6ee7b7', fontWeight: 700, marginBottom: '0.5rem' }}>Yêu cầu rút tiền đã được gửi!</div>
        <p style={{ color: muted, fontSize: '0.875rem' }}>
          Admin sẽ xử lý trong 1–3 ngày làm việc.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: mid, border: `1px solid rgba(201,169,97,0.2)`, borderRadius: '0.75rem', padding: '1.5rem' }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 700, color: text, marginBottom: '1.25rem' }}>
        Thông tin nhận tiền — {availableTotal.toLocaleString('vi-VN')}đ
      </div>

      {[
        { key: 'bank_name',      label: 'Tên ngân hàng',    placeholder: 'VD: MB Bank, Techcombank...' },
        { key: 'bank_account',   label: 'Số tài khoản',     placeholder: 'Số tài khoản' },
        { key: 'account_holder', label: 'Chủ tài khoản',    placeholder: 'NGUYEN VAN A (viết hoa)' },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
            {f.label}
          </label>
          <input
            type="text"
            value={form[f.key as keyof typeof form]}
            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            style={{
              width: '100%',
              background: dark,
              border: '1px solid rgba(201,169,97,0.2)',
              borderRadius: '0.5rem',
              padding: '0.625rem 0.875rem',
              color: text,
              fontSize: '0.9375rem',
              boxSizing: 'border-box',
            }}
          />
        </div>
      ))}

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{ flex: 1, background: 'transparent', border: '1px solid rgba(201,169,97,0.3)', borderRadius: '0.5rem', padding: '0.625rem', color: muted, cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Huỷ
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{ flex: 2, background: gold, color: dark, fontWeight: 700, borderRadius: '0.5rem', padding: '0.625rem 1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9375rem' }}
        >
          {loading ? 'Đang gửi...' : 'Xác nhận rút tiền'}
        </button>
      </div>
    </form>
  )
}
