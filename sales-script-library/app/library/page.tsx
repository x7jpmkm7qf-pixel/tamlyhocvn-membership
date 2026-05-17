'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import KhauQuyetPaywall from '@/components/KhauQuyetPaywall'
import { INDUSTRY_LABELS, SITUATION_LABELS, INDUSTRY_COLORS, SITUATION_COLORS } from '@/lib/constants'

interface Script {
  id: string
  title: string
  industry: string
  situation: string
  preview: string
  createdAt: string
}

const ALL_INDUSTRIES = [
  { value: '', label: 'Tất cả ngành' },
  { value: 'bds', label: 'Bất động sản' },
  { value: 'bao-hiem', label: 'Bảo hiểm' },
  { value: 'my-pham', label: 'Mỹ phẩm' },
  { value: 'fb', label: 'F&B' },
  { value: 'khac', label: 'Khác' },
]

const ALL_SITUATIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'chot-sale', label: 'Chốt sale' },
  { value: 'xu-ly-tu-choi', label: 'Từ chối' },
  { value: 'khach-che-dat', label: 'Chê đắt' },
  { value: 'khach-im-lang', label: 'Im lặng' },
  { value: 'follow-up', label: 'Follow-up' },
]

export default function LibraryPage() {
  const router = useRouter()
  const [scripts, setScripts] = useState<Script[]>([])
  const [industry, setIndustry] = useState('')
  const [situation, setSituation] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [gated, setGated] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.member && !data.isAdmin) {
          router.push('/login')
          return
        }
        // Khẩu Quyết buyers (not yet upgraded to Nội Môn) — show paywall instead of library
        const m = data.member
        if (m && m.product === 'khauquyet' && m.tier !== 'noimon' && !data.isAdmin) {
          setGated({ email: m.email })
          setAuthed(true)
          return
        }
        setAuthed(true)
        fetch('/api/scripts')
          .then(r => r.json())
          .then(data => { setScripts(data); setLoading(false) })
      })
  }, [])

  const filtered = useMemo(() => {
    return scripts.filter(s => {
      if (industry && s.industry !== industry) return false
      if (situation && s.situation !== situation) return false
      if (search) {
        const q = search.toLowerCase()
        return s.title.toLowerCase().includes(q) || s.preview.toLowerCase().includes(q)
      }
      return true
    })
  }, [scripts, industry, situation, search])

  if (authed === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (gated) {
    return <KhauQuyetPaywall email={gated.email} />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="relative py-12 px-4 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            🧠 Tâm lý học ứng dụng trong bán hàng
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 text-slate-900">
            <span className="bg-gradient-to-r from-violet-700 to-amber-600 bg-clip-text text-transparent">Thư viện Kịch bản</span>
            {' '}Sales Chuyên Nghiệp
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Kịch bản được thiết kế dựa trên tâm lý học hành vi — tối ưu hóa từng phản ứng của khách hàng
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Tìm kịch bản theo tình huống, ngành..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-violet-500 focus:ring-3 focus:ring-violet-100 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition shadow-sm"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-14 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <div className="flex gap-1.5 shrink-0">
              {ALL_INDUSTRIES.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setIndustry(opt.value)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-semibold transition ${
                    industry === opt.value
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-violet-400 hover:text-violet-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="w-px bg-slate-200 shrink-0 mx-1" />
            <div className="flex gap-1.5 shrink-0">
              {ALL_SITUATIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSituation(opt.value)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-semibold transition ${
                    situation === opt.value
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-amber-400 hover:text-amber-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  <div className="h-5 w-24 bg-slate-200 rounded-full" />
                </div>
                <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded" />
                  <div className="h-3 w-2/3 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold text-slate-800">Không tìm thấy kịch bản phù hợp</p>
            <p className="text-sm text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-5">
              Hiển thị <span className="font-semibold text-violet-600">{filtered.length}</span> kịch bản
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(script => (
                <Link key={script.id} href={`/scripts/${script.id}`}>
                  <div className="bg-white border border-slate-200 hover:border-violet-300 hover:shadow-lg rounded-2xl p-5 cursor-pointer h-full flex flex-col transition">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${INDUSTRY_COLORS[script.industry as keyof typeof INDUSTRY_COLORS]}`}>
                        {INDUSTRY_LABELS[script.industry as keyof typeof INDUSTRY_LABELS]}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${SITUATION_COLORS[script.situation as keyof typeof SITUATION_COLORS]}`}>
                        {SITUATION_LABELS[script.situation as keyof typeof SITUATION_LABELS]}
                      </span>
                    </div>
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base mb-2 line-clamp-2 flex-1">
                      {script.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {script.preview}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        {new Date(script.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="text-xs font-semibold text-violet-600 flex items-center gap-1">
                        Xem kịch bản
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
