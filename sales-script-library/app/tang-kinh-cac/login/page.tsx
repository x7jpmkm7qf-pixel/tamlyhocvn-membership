'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function TKCLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/tang-kinh-cac/dashboard'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      router.push(from)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #040e1c 0%, #091b30 60%, #0f2744 100%)' }}
    >
      <style>{`
        .tkc-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,169,97,0.25);
          color: #FEF7E6;
          border-radius: 0.5rem;
          padding: 0.625rem 0.875rem;
          width: 100%;
          font-size: 0.9375rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .tkc-input::placeholder { color: rgba(160,144,112,0.6); }
        .tkc-input:focus { border-color: #C9A961; }
        .tkc-input:-webkit-autofill,
        .tkc-input:-webkit-autofill:hover,
        .tkc-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #FEF7E6;
          -webkit-box-shadow: 0 0 0 1000px #0f2744 inset;
        }
      `}</style>

      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#C9A961', fontSize: '1.75rem', marginBottom: '0.25rem' }}>⚜</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 700, color: '#FEF7E6', lineHeight: 1 }}>
          Tàng Kinh Các
        </div>
        <div style={{ fontSize: '0.7rem', color: '#a09070', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
          Thư viện Kịch bản Sales
        </div>
      </Link>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          background: 'rgba(15,39,68,0.8)',
          border: '1px solid rgba(201,169,97,0.2)',
          borderRadius: '0.875rem',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.375rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.25rem' }}>
          Đăng nhập
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#a09070', marginBottom: '1.5rem' }}>
          Truy cập bí kíp của sư huynh
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="tkc-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="tkc-input"
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.8125rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'rgba(201,169,97,0.4)' : '#C9A961',
              color: '#040e1c',
              fontWeight: 700,
              fontSize: '0.9375rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Vào Tàng Kinh Các →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(201,169,97,0.1)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#a09070' }}>
            Chưa có tài khoản?{' '}
            <Link href="/ban-do" style={{ color: '#C9A961', textDecoration: 'none', fontWeight: 600 }}>
              Nhận Bản Đồ miễn phí →
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link href="/login" style={{ fontSize: '0.75rem', color: 'rgba(160,144,112,0.5)', textDecoration: 'none' }}>
          Đăng nhập Khẩu Quyết / tài khoản cũ →
        </Link>
      </div>
    </div>
  )
}

export default function TKCLoginPage() {
  return (
    <Suspense>
      <TKCLoginForm />
    </Suspense>
  )
}
