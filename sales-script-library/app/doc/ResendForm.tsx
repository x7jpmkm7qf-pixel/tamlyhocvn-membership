'use client'
import { useState } from 'react'

export default function ResendForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi gửi email')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center bg-white border border-[#C9A961] rounded-lg p-6">
        <div className="text-3xl mb-2">📩</div>
        <p className="text-sm text-stone-700 font-medium">Em đã gửi link vào <strong>{email}</strong></p>
        <p className="text-xs text-stone-500 mt-2">Kiểm tra hộp thư Spam nếu không thấy.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="email"
        required
        placeholder="Email anh/chị đã đăng ký"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full bg-white border border-[#C9A961] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#7C2D12] transition"
      />
      {error && <p className="text-red-700 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#7C2D12] hover:bg-[#5C1A0A] disabled:opacity-60 text-[#FEF7E6] font-bold py-3 rounded-md transition text-sm"
      >
        {loading ? 'Đang gửi...' : '📩 Gửi link đăng nhập'}
      </button>
    </form>
  )
}
