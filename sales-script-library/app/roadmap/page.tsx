'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface RoadmapDay {
  day: number; title: string; scriptId: string | null
  psychPrinciple: string; challenge: string; tip: string
}
interface RoadmapWeek {
  week: number; theme: string; description: string; days: RoadmapDay[]
}

const WEEK_COLORS = [
  { bg: 'bg-blue-600', glow: 'shadow-[0_0_16px_rgba(37,99,235,0.4)]', light: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600', badge: 'bg-blue-500/20 text-blue-600 border border-blue-500/30' },
  { bg: 'bg-red-600', glow: 'shadow-[0_0_16px_rgba(220,38,38,0.4)]', light: 'bg-red-50', border: 'border-red-500/30', text: 'text-red-300', badge: 'bg-red-50 text-red-300 border border-red-500/30' },
  { bg: 'bg-violet-600', glow: 'shadow-[0_0_16px_rgba(124,58,237,0.4)]', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', badge: 'bg-violet-50 text-violet-600 border border-violet-200' },
  { bg: 'bg-emerald-600', glow: 'shadow-[0_0_16px_rgba(5,150,105,0.4)]', light: 'bg-emerald-50', border: 'border-emerald-500/30', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-600 border border-emerald-500/30' },
]

function getTodayDay() { return ((new Date().getDate() - 1) % 30) + 1 }

export default function RoadmapPage() {
  const router = useRouter()
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const todayDay = getTodayDay()

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.member && !data.isAdmin) { router.push('/login'); return }
      fetch('/api/roadmap').then(r => r.json()).then(d => {
        setRoadmap(d)
        setExpanded(Math.ceil(todayDay / 7))
        setLoading(false)
      })
    })
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-violet-600 text-sm flex items-center gap-1 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Dashboard
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-600 font-medium">Lộ trình 30 ngày</span>
        </div>

        {/* Hero */}
        <div className="relative glass rounded-2xl p-5 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent pointer-events-none rounded-2xl" />
          <div className="relative">
            <h1 className="text-xl font-bold text-slate-900 mb-2">🗺️ Lộ trình 30 ngày Chinh phục Sales</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              4 tuần — từ nền tảng đến nâng cao. Mỗi ngày 1 kịch bản + 1 bài tập thực hành dựa trên tâm lý học.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1 rounded-full">📝 30 ngày học</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1 rounded-full">🧠 Tâm lý học</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1 rounded-full">💪 Thực chiến</span>
            </div>
          </div>
        </div>

        {/* Week nav pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {[1, 2, 3, 4].map(w => {
            const c = WEEK_COLORS[w - 1]
            return (
              <button
                key={w}
                onClick={() => setExpanded(expanded === w ? null : w)}
                className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition ${
                  expanded === w
                    ? `${c.bg} text-slate-900 border-transparent ${c.glow}`
                    : `${c.light} ${c.text} ${c.border} hover:${c.bg} hover:text-slate-900`
                }`}
              >
                Tuần {w}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 glass rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {roadmap.map(week => {
              const c = WEEK_COLORS[week.week - 1]
              const isExpanded = expanded === week.week
              const weekDone = week.days.filter(d => d.day < todayDay).length
              const weekTotal = week.days.length

              return (
                <div key={week.week} className={`glass rounded-2xl overflow-hidden border transition ${isExpanded ? c.border : 'border-slate-200'}`}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : week.week)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${c.bg} text-slate-900 text-xs font-bold px-2.5 py-1 rounded-lg ${c.glow}`}>
                          T{week.week}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{week.theme}</p>
                          <p className="text-xs text-slate-500">
                            Ngày {(week.week - 1) * 7 + 1} – {week.week * 7} • {weekDone}/{weekTotal} hoàn thành
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${c.light} border ${c.border} flex items-center justify-center`}>
                          <span className={`text-xs font-bold ${c.text}`}>{Math.round(weekDone / weekTotal * 100)}%</span>
                        </div>
                        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className={`border-t ${c.border} ${c.light} px-5 pb-2`}>
                      <p className="text-xs text-slate-400 py-3 leading-relaxed">{week.description}</p>
                      <div className="space-y-2 pb-3">
                        {week.days.map(day => {
                          const isToday = day.day === todayDay
                          const isPast = day.day < todayDay
                          return (
                            <div
                              key={day.day}
                              className={`rounded-xl p-3.5 border transition ${
                                isToday ? `${c.bg} text-slate-900 border-transparent ${c.glow}` :
                                isPast ? `bg-white/5 border-slate-200 opacity-70` :
                                'bg-white/3 border-white/8'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-base shrink-0 mt-0.5">
                                  {isPast ? '✅' : isToday ? '▶️' : '⏳'}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`text-xs font-semibold ${isToday ? 'text-slate-900/70' : 'text-slate-500'}`}>Ngày {day.day}</span>
                                    {isToday && <span className="text-xs bg-white/20 text-slate-900 px-2 py-0.5 rounded-full font-medium">Hôm nay</span>}
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${isToday ? 'bg-white/20 text-slate-900 border-white/30' : c.badge}`}>
                                      {day.psychPrinciple.split('(')[0].trim()}
                                    </span>
                                  </div>
                                  <p className={`font-medium text-sm mb-2 ${isToday ? 'text-slate-900' : 'text-slate-700'}`}>{day.title}</p>
                                  <p className={`text-xs leading-relaxed line-clamp-2 mb-2 ${isToday ? 'text-slate-900/80' : 'text-slate-500'}`}>{day.challenge}</p>
                                  {day.scriptId && (
                                    <Link
                                      href={`/scripts/${day.scriptId}`}
                                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                                        isToday
                                          ? 'bg-white text-violet-800 border-transparent hover:bg-slate-100'
                                          : `${c.light} ${c.text} ${c.border} hover:${c.bg} hover:text-slate-900`
                                      }`}
                                    >
                                      📄 Xem kịch bản
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
