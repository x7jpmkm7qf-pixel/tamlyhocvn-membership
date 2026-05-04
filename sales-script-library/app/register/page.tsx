'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Vui lòng nhập họ tên'); return }
    if (!form.email.trim()) { setError('Vui lòng nhập email'); return }
    if (form.password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự'); return }
    if (form.password !== form.confirm) { setError('Mật khẩu xác nhận không khớp'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      // Redirect to payment page with email
      router.push(`/register/payment?email=${encodeURIComponent(form.email)}&name=${encodeURIComponent(form.name)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Back */}
      <Link href="/" className="mb-6 flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition self-start max-w-sm w-full">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Về trang chính
      </Link>

      {/* Logo */}
      <Link href="/" className="mb-6 flex items-center gap-2 font-bold text-lg">
        <span className="text-2xl">🧠</span>
        <span className="bg-gradient-to-r from-violet-700 to-amber-600 bg-clip-text text-transparent font-extrabold">Mind Sales Lab</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Đăng ký thành viên</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Chỉ <strong className="text-violet-600">99.000đ/tháng</strong> — điền thông tin, chuyển khoản, được kích hoạt trong 4 tiếng.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={update('name')}
              placeholder="Nguyễn Văn A"
              required
              className="w-full bg-white border border-slate-300 focus:border-violet-500 focus:ring-3 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="email@example.com"
              required
              className="w-full bg-white border border-slate-300 focus:border-violet-500 focus:ring-3 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Số điện thoại <span className="text-slate-400 font-normal">(để admin liên hệ nhanh hơn)</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={update('phone')}
              placeholder="0901 234 567"
              className="w-full bg-white border border-slate-300 focus:border-violet-500 focus:ring-3 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="Tối thiểu 6 ký tự"
              required
              className="w-full bg-white border border-slate-300 focus:border-violet-500 focus:ring-3 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={form.confirm}
              onChange={update('confirm')}
              placeholder="Nhập lại mật khẩu"
              required
              className="w-full bg-white border border-slate-300 focus:border-violet-500 focus:ring-3 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-md shadow-violet-200 text-sm"
          >
            {loading ? 'Đang xử lý...' : 'Tiếp theo — Thanh toán →'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-violet-600 font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            Hoặc{' '}
            <Link href="/admin/login" className="text-slate-400 hover:text-slate-600 transition">
              đăng nhập Admin
            </Link>
          </p>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-6 flex items-center gap-6 text-xs text-slate-400">
        <span>🔒 Bảo mật</span>
        <span>✓ Hoàn tiền 7 ngày</span>
        <span>⚡ Kích hoạt &lt;4h</span>
      </div>
    </div>
  )
}
