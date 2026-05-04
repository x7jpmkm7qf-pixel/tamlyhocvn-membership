'use client'
import { useEffect, useState } from 'react'

interface Props {
  day: number
  streak: number
  nextDayTitle?: string
  onClose: () => void
}

const MESSAGES = [
  'Bạn đang xây dựng thói quen của người bán hàng giỏi!',
  'Kiên trì mỗi ngày — đó là bí quyết của top salesperson!',
  'Mỗi kịch bản bạn luyện hôm nay là một khách hàng bạn chốt được ngày mai.',
  'Consistency beats talent. Bạn đang chứng minh điều đó!',
  'Người giỏi sales không phải người tài năng nhất, mà người kiên định nhất.',
]

export default function CompletionModal({ day, streak, nextDayTitle, onClose }: Props) {
  const [show, setShow] = useState(false)
  const message = MESSAGES[streak % MESSAGES.length]

  useEffect(() => {
    setTimeout(() => setShow(true), 50)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300 ${
        show ? 'bg-white backdrop-blur-md' : 'bg-white'
      }`}
      onClick={handleClose}
    >
      {/* Glow blob behind modal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-50 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`relative glass border border-violet-200 rounded-3xl shadow-2xl w-full max-w-sm p-7 text-center transition-all duration-300 ${
          show ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 0 60px rgba(124,58,237,0.25), 0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/15 to-amber-500/5 pointer-events-none" />

        <div className="relative">
          <div className="text-5xl mb-3 animate-bounce">🎉</div>

          <h2 className="text-xl font-bold text-slate-900 mb-1">Hoàn thành ngày {day}!</h2>

          {streak > 1 && (
            <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-500/30 text-sm font-bold px-4 py-1.5 rounded-full mb-3">
              🔥 {streak} ngày liên tiếp
            </div>
          )}

          <p className="text-sm text-slate-400 leading-relaxed mb-5">{message}</p>

          {nextDayTitle && (
            <div className="bg-white/5 border border-slate-200 rounded-2xl p-4 mb-5 text-left">
              <p className="text-xs text-slate-500 font-medium mb-1">NGÀY MAI — Ngày {day + 1}</p>
              <p className="text-sm font-semibold text-slate-700">{nextDayTitle}</p>
            </div>
          )}

          <button
            onClick={handleClose}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-2xl transition shadow-[0_0_20px_rgba(124,58,237,0.4)]"
          >
            Tuyệt vời! Tiếp tục 💪
          </button>
        </div>
      </div>
    </div>
  )
}
