'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface Session {
  member: { id: string; name: string; email: string } | null
  isAdmin: boolean
}

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setSession)
  }, [pathname])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setSession(null)
    router.push('/')
    router.refresh()
  }

  const isLoggedIn = session?.member || session?.isAdmin

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🧠</span>
            <span className="hidden sm:block bg-gradient-to-r from-violet-700 to-amber-600 bg-clip-text text-transparent font-extrabold tracking-tight">Mind Sales Lab</span>
            <span className="sm:hidden bg-gradient-to-r from-violet-700 to-amber-600 bg-clip-text text-transparent font-extrabold">MSL</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            {session?.member && (
              <>
                <Link href="/dashboard" className="text-sm text-slate-600 hover:text-violet-600 transition font-medium">
                  Dashboard
                </Link>
                <Link href="/library" className="text-sm text-slate-600 hover:text-violet-600 transition font-medium">
                  Thư viện
                </Link>
                <Link href="/roadmap" className="text-sm text-slate-600 hover:text-violet-600 transition font-medium">
                  Lộ trình
                </Link>
              </>
            )}
            {session?.isAdmin && (
              <Link href="/admin" className="text-amber-600 hover:text-amber-700 text-sm font-bold transition">
                Admin
              </Link>
            )}
            {session?.member ? (
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-slate-700 font-medium truncate max-w-[120px]">
                  {session.member.name}
                </span>
                <button
                  onClick={logout}
                  className="text-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition text-slate-700 font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : !session?.isAdmin ? (
              <div className="flex items-center gap-2">
                <Link href="/bootcamp" className="text-sm text-slate-500 hover:text-blue-600 font-medium transition px-2 py-1.5 hidden lg:block">
                  PRO Bootcamp
                </Link>
                <Link href="/mentoring" className="text-sm text-slate-500 hover:text-amber-600 font-medium transition px-2 py-1.5 hidden lg:block">
                  Mentoring
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-slate-600 hover:text-violet-600 font-semibold transition px-3 py-1.5"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition shadow-md shadow-violet-200"
                >
                  Đăng ký — 99k
                </Link>
              </div>
            ) : (
              <button
                onClick={logout}
                className="text-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition text-slate-700 font-medium"
              >
                Đăng xuất Admin
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="sm:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-200 px-4 py-3 space-y-1 bg-white">
          {session?.member && (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-slate-700 py-2 text-sm hover:text-violet-600 font-medium">
                Dashboard
              </Link>
              <Link href="/library" onClick={() => setMenuOpen(false)} className="block text-slate-700 py-2 text-sm hover:text-violet-600 font-medium">
                Thư viện kịch bản
              </Link>
              <Link href="/roadmap" onClick={() => setMenuOpen(false)} className="block text-slate-700 py-2 text-sm hover:text-violet-600 font-medium">
                Lộ trình 30 ngày
              </Link>
            </>
          )}
          {session?.isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="block text-amber-600 py-2 text-sm font-bold">
              Admin Dashboard
            </Link>
          )}
          {session?.member ? (
            <>
              <p className="text-xs text-slate-500 py-1 border-t border-slate-100 mt-1">{session.member.email}</p>
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="block w-full text-left text-sm py-2 text-red-500 font-medium"
              >
                Đăng xuất
              </button>
            </>
          ) : !session?.isAdmin ? (
            <div className="pt-2 space-y-2 border-t border-slate-100">
              <Link href="/bootcamp" onClick={() => setMenuOpen(false)} className="block text-blue-600 py-1.5 text-sm font-semibold">
                🎓 PRO Bootcamp — 1.497.000đ
              </Link>
              <Link href="/mentoring" onClick={() => setMenuOpen(false)} className="block text-amber-600 py-1.5 text-sm font-semibold">
                🏆 1:1 Mentoring — 6.997.000đ
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center border border-violet-300 text-violet-600 text-sm font-semibold px-4 py-2 rounded-lg"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block bg-violet-600 text-center text-white text-sm font-bold px-4 py-2 rounded-lg"
              >
                Đăng ký — 99.000đ/tháng
              </Link>
            </div>
          ) : (
            <button
              onClick={() => { logout(); setMenuOpen(false) }}
              className="block w-full text-left text-sm py-2 text-red-500 font-medium"
            >
              Đăng xuất Admin
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
