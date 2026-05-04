'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/admin')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

      <Link href="/" className="relative mb-8 flex items-center gap-2 font-bold text-lg">
        <span className="text-2xl">🧠</span>
        <span className="gradient-text font-extrabold">Mind Sales Lab</span>
      </Link>

      <div className="relative glass rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🔐</span>
          <h1 className="text-xl font-bold text-slate-900">Admin</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Nhập mật khẩu quản trị viên</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Mật khẩu Admin</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              className="input-dark"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-400 text-sm px-4 py-2.5 rounded-xl border border-red-500/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 shadow-[0_0_16px_rgba(245,158,11,0.30)]"
          >
            {loading ? 'Đang xác thực...' : 'Vào Admin →'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-200 text-center">
          <Link href="/login" className="text-xs text-slate-500 hover:text-slate-400 transition">
            ← Đăng nhập thành viên
          </Link>
        </div>
      </div>

      <p className="relative mt-4 text-xs text-slate-600">
        Mật khẩu mặc định: <code className="bg-slate-50 text-amber-600 px-2 py-0.5 rounded">admin2024</code>
      </p>
    </div>
  )
}
