'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Status = 'loading' | 'success' | 'already_verified' | 'expired' | 'invalid' | 'missing'

function VerifyEmailInner() {
  const params = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<Status>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('missing')
      return
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ data }) => {
        setEmail(data.email || null)
        if (data.status === 'success') setStatus('success')
        else if (data.status === 'already_verified') setStatus('already_verified')
        else if (data.status === 'expired') setStatus('expired')
        else setStatus('invalid')
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  const resend = async () => {
    if (!email) return
    setResending(true)
    setResendMsg('')
    try {
      const r = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = await r.json()
      if (r.ok) setResendMsg('Đã gửi lại email — vui lòng kiểm tra hộp thư (kể cả Spam).')
      else setResendMsg(d.error || 'Không gửi được. Vui lòng thử lại.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-6 flex items-center gap-2 font-bold text-lg">
        <span className="text-2xl">🧠</span>
        <span className="bg-gradient-to-r from-violet-700 to-amber-600 bg-clip-text text-transparent font-extrabold">Mind Sales Lab</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-8 shadow-sm text-center">
        {status === 'loading' && (
          <>
            <div className="w-10 h-10 mx-auto mb-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Đang xác minh email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center text-3xl">✅</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Xác minh thành công!</h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Email <strong className="text-slate-700">{email}</strong> đã được xác minh. Giờ bạn có thể nhận thông báo, hóa đơn và khôi phục tài khoản qua email.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-violet-200 text-sm"
            >
              Vào Dashboard →
            </Link>
          </>
        )}

        {status === 'already_verified' && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center text-3xl">👍</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Email đã được xác minh trước đó</h1>
            <p className="text-sm text-slate-500 mb-6">Không cần xác minh lại. Bạn có thể đăng nhập bình thường.</p>
            <Link
              href="/login"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-violet-200 text-sm"
            >
              Đăng nhập →
            </Link>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 bg-amber-50 rounded-full flex items-center justify-center text-3xl">⏰</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Link đã hết hạn</h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Link xác minh chỉ có hiệu lực trong 24 giờ. Nhấn nút bên dưới để chúng tôi gửi lại link mới.
            </p>
            <button
              onClick={resend}
              disabled={resending}
              className="inline-block bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-violet-200 text-sm"
            >
              {resending ? 'Đang gửi...' : 'Gửi lại email xác minh'}
            </button>
            {resendMsg && <p className="text-xs text-slate-500 mt-4">{resendMsg}</p>}
          </>
        )}

        {(status === 'invalid' || status === 'missing') && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-3xl">❌</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Link không hợp lệ</h1>
            <p className="text-sm text-slate-500 mb-6">
              Link bạn truy cập không đúng hoặc đã được sử dụng. Vui lòng đăng nhập và yêu cầu gửi lại link xác minh.
            </p>
            <Link
              href="/login"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md shadow-violet-200 text-sm"
            >
              Về trang đăng nhập
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <VerifyEmailInner />
    </Suspense>
  )
}
