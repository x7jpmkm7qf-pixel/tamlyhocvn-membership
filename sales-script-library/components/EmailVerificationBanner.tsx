'use client'
import { useState } from 'react'

export default function EmailVerificationBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  if (dismissed) return null

  const send = async () => {
    setSending(true)
    setMsg(null)
    try {
      const r = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = await r.json()
      if (r.ok) {
        setMsg({ ok: true, text: 'Đã gửi! Kiểm tra hộp thư (kể cả Spam).' })
      } else {
        setMsg({ ok: false, text: d.error || 'Không gửi được' })
      }
    } catch {
      setMsg({ ok: false, text: 'Lỗi kết nối — thử lại sau' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
      <div className="text-2xl shrink-0">📧</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900 mb-0.5">Vui lòng xác minh email</p>
        <p className="text-xs text-amber-700/80 leading-relaxed mb-2">
          Xác minh email <strong>{email}</strong> để nhận thông báo, hóa đơn, và khôi phục tài khoản khi cần.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={send}
            disabled={sending}
            className="text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-lg transition"
          >
            {sending ? 'Đang gửi...' : 'Gửi lại email xác minh'}
          </button>
          {msg && (
            <span className={`text-xs ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>
              {msg.text}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Đóng"
        className="shrink-0 text-amber-600/60 hover:text-amber-700 transition p-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
