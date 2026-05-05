'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DailyCheckIn from '@/components/DailyCheckIn'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'
import { isDayCompleted, getStreak } from '@/lib/progress'

interface RoadmapDay {
  day: number
  title: string
  scriptId: string | null
  psychPrinciple: string
  challenge: string
  tip: string
}

interface RoadmapWeek {
  week: number
  theme: string
  description: string
  days: RoadmapDay[]
}

interface Session {
  member: { id: string; name: string; email: string; emailVerified?: boolean; expiresAt?: string | null; daysLeft?: number | null } | null
  isAdmin: boolean
}

function getTodayDay(): number {
  return ((new Date().getDate() - 1) % 30) + 1
}

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([])
  const [todayData, setTodayData] = useState<{ week: RoadmapWeek; day: RoadmapDay } | null>(null)
  const [loading, setLoading] = useState(true)
  const [todayDone, setTodayDone] = useState(false)
  const [streak, setStreak] = useState(0)
  const todayDay = getTodayDay()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        setSession(data)
        if (!data.member && !data.isAdmin) {
          router.push('/login')
          return
        }
        // Lock tài khoản hết hạn — admin không bị ảnh hưởng
        if (data.member && data.member.daysLeft !== null && data.member.daysLeft !== undefined && data.member.daysLeft < 0) {
          router.push('/renew')
        }
      })
  }, [])

  useEffect(() => {
    if (!session) return
    if (!session.member && !session.isAdmin) return
    fetch('/api/roadmap')
      .then(r => r.json())
      .then((data: RoadmapWeek[]) => {
        setRoadmap(data)
        for (const week of data) {
          const day = week.days.find(d => d.day === todayDay)
          if (day) { setTodayData({ week, day }); break }
        }
        setTodayDone(isDayCompleted(todayDay))
        setStreak(getStreak(todayDay))
        setLoading(false)
      })
  }, [session])

  const weekOf = (day: number) => Math.ceil(day / 7)
  const currentWeek = roadmap[weekOf(todayDay) - 1]

  const nextDayTitle = (() => {
    for (const week of roadmap) {
      const d = week.days.find(d => d.day === todayDay + 1)
      if (d) return d.title
    }
    return undefined
  })()

  if (loading || !session) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 skeleton rounded w-1/2" />
          <div className="glass rounded-2xl p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-4 skeleton rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  const memberName = session.member?.name?.split(' ').pop() || 'bạn'
  const progressPct = Math.round((todayDay / 30) * 100)

  return (
    <div className="min-h-screen">
      <Navbar />

      {session.member && (
        <div className="watermark-text" aria-hidden="true">{session.member.email}</div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {session.member && !session.member.emailVerified && (
          <EmailVerificationBanner email={session.member.email} />
        )}

        {/* Renewal warning banner — hiển thị khi còn ≤ 7 ngày */}
        {session.member && session.member.daysLeft !== null && session.member.daysLeft !== undefined && session.member.daysLeft >= 0 && session.member.daysLeft <= 7 && (
          <div className={`rounded-2xl px-5 py-4 flex items-center justify-between gap-3 ${
            session.member.daysLeft <= 2
              ? 'bg-red-50 border border-red-200'
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <div>
              <p className={`text-sm font-bold ${session.member.daysLeft <= 2 ? 'text-red-700' : 'text-amber-700'}`}>
                {session.member.daysLeft === 0
                  ? '⛔ Tài khoản hết hạn hôm nay!'
                  : `⚠️ Còn ${session.member.daysLeft} ngày — Tài khoản sắp hết hạn`}
              </p>
              <p className={`text-xs mt-0.5 ${session.member.daysLeft <= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                Gia hạn ngay để không bị gián đoạn truy cập kịch bản
              </p>
            </div>
            <Link
              href="/renew"
              className={`shrink-0 text-xs font-bold px-4 py-2 rounded-xl transition ${
                session.member.daysLeft <= 2
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              Gia hạn 99k →
            </Link>
          </div>
        )}

        {/* Greeting hero */}
        <div className="relative glass rounded-2xl p-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-amber-500/5 pointer-events-none rounded-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <p className="text-slate-400 text-sm">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="flex items-center gap-2">
                {streak > 0 && (
                  <span className="bg-orange-50 text-orange-600 border border-orange-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
                    🔥 {streak} ngày
                  </span>
                )}
                <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                  Ngày {todayDay}/30
                </span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Chào {memberName}! 👋</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {currentWeek ? `Tuần ${currentWeek.week}: ${currentWeek.theme}` : 'Chào mừng đến Mind Sales Lab'}
            </p>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Tiến độ lộ trình 30 ngày</span>
                <span className="text-violet-600 font-semibold">{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #f59e0b)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Today's mission preview */}
        {todayData && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-3 flex items-center gap-2 bg-amber-500/5">
              <span className="text-lg">🎯</span>
              <span className="font-semibold text-amber-600 text-sm">Nhiệm vụ hôm nay</span>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-slate-900 mb-1">{todayData.day.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full font-medium">
                  🧠 {todayData.day.psychPrinciple}
                </span>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-violet-600 mb-1">BÀI TẬP THỰC HÀNH HÔM NAY</p>
                <p className="text-sm text-slate-600 leading-relaxed">{todayData.day.challenge}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-amber-600 mb-1">💡 TIP TÂM LÝ</p>
                <p className="text-sm text-slate-600 leading-relaxed">{todayData.day.tip}</p>
              </div>

              {todayData.day.scriptId ? (
                <Link
                  href={`/scripts/${todayData.day.scriptId}`}
                  className="block w-full bg-violet-600 hover:bg-violet-700 text-white text-center font-semibold py-3 rounded-xl transition shadow-[0_0_16px_rgba(124,58,237,0.35)]"
                >
                  Xem kịch bản ngày {todayData.day.day} →
                </Link>
              ) : (
                <div className="w-full bg-white/5 border border-slate-200 text-slate-400 text-center font-medium py-3 rounded-xl">
                  📝 Ngày ôn tập & tổng kết — không có kịch bản mới
                </div>
              )}
            </div>
          </div>
        )}

        {/* Daily check-in flow */}
        {todayData && (
          <DailyCheckIn
            day={todayData.day}
            todayDay={todayDay}
            nextDayTitle={nextDayTitle}
            alreadyDone={todayDone}
            onComplete={() => {
              setTodayDone(true)
              setStreak(getStreak(todayDay))
            }}
          />
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/roadmap" className="glass glass-hover rounded-2xl p-4">
            <div className="text-2xl mb-2">🗺️</div>
            <p className="font-semibold text-slate-800 text-sm">Lộ trình 30 ngày</p>
            <p className="text-xs text-slate-500 mt-0.5">Xem toàn bộ chương trình</p>
          </Link>
          <Link href="/library" className="glass glass-hover rounded-2xl p-4">
            <div className="text-2xl mb-2">📚</div>
            <p className="font-semibold text-slate-800 text-sm">Thư viện kịch bản</p>
            <p className="text-xs text-slate-500 mt-0.5">18 kịch bản theo ngành</p>
          </Link>
        </div>

        {/* This week overview */}
        {currentWeek && (
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
              <span>📅</span> Tuần {currentWeek.week} — {currentWeek.theme}
            </h3>
            <p className="text-sm text-slate-500 mb-4">{currentWeek.description}</p>
            <div className="space-y-2">
              {currentWeek.days.map(day => (
                <div
                  key={day.day}
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm transition ${
                    day.day === todayDay
                      ? 'bg-violet-100 border border-violet-300 text-slate-900'
                      : day.day < todayDay
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                      : 'bg-white/3 border border-white/8 text-slate-500'
                  }`}
                >
                  <span className="text-base shrink-0">
                    {day.day < todayDay ? '✅' : day.day === todayDay ? '▶️' : '⏳'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">Ngày {day.day}:</span>{' '}
                    <span className="truncate">{day.title}</span>
                  </div>
                  {day.scriptId && day.day <= todayDay && (
                    <Link
                      href={`/scripts/${day.scriptId}`}
                      className={`shrink-0 text-xs px-2 py-1 rounded-lg font-medium transition ${
                        day.day === todayDay
                          ? 'bg-violet-500/30 text-violet-700 hover:bg-violet-500/50'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500/30'
                      }`}
                      onClick={e => e.stopPropagation()}
                    >
                      Xem
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
