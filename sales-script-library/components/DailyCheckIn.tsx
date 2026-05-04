'use client'
import { useState } from 'react'
import Link from 'next/link'
import { completeDay, getStreak } from '@/lib/progress'
import CompletionModal from './CompletionModal'

interface RoadmapDay {
  day: number
  title: string
  scriptId: string | null
  psychPrinciple: string
  challenge: string
  tip: string
}

interface Props {
  day: RoadmapDay
  todayDay: number
  nextDayTitle?: string
  alreadyDone: boolean
  onComplete: () => void
}

const STEPS = ['LEARN', 'PREPARE', 'APPLY', 'REFLECT'] as const
type Step = typeof STEPS[number]

const STEP_META: Record<Step, { icon: string; label: string; desc: string }> = {
  LEARN:   { icon: '📖', label: 'Học',      desc: 'Đọc và hiểu kịch bản hôm nay' },
  PREPARE: { icon: '✍️',  label: 'Chuẩn bị', desc: 'Ghi nhớ các điểm chốt quan trọng' },
  APPLY:   { icon: '💬', label: 'Áp dụng',  desc: 'Thực hành với khách hàng thật' },
  REFLECT: { icon: '🪞', label: 'Đánh giá', desc: 'Ghi nhật ký & đánh dấu hoàn thành' },
}

export default function DailyCheckIn({ day, todayDay, nextDayTitle, alreadyDone, onComplete }: Props) {
  const [step, setStep] = useState<Step>('LEARN')
  const [journal, setJournal] = useState({ q1: '', q2: '', q3: '' })
  const [showModal, setShowModal] = useState(false)
  const [streak, setStreak] = useState(0)
  const stepIdx = STEPS.indexOf(step)

  const handleComplete = () => {
    completeDay(todayDay, journal)
    const s = getStreak(todayDay)
    setStreak(s)
    setShowModal(true)
  }

  if (alreadyDone) {
    return (
      <div className="glass rounded-2xl p-5 flex items-center gap-4 border border-emerald-500/25 bg-emerald-500/5">
        <span className="text-3xl">✅</span>
        <div>
          <p className="font-bold text-emerald-600">Đã hoàn thành hôm nay!</p>
          <p className="text-sm text-slate-400">Bạn đã thực hành kịch bản ngày {todayDay}. Hẹn gặp lại ngày mai!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {showModal && (
        <CompletionModal
          day={todayDay}
          streak={streak}
          nextDayTitle={nextDayTitle}
          onClose={() => { setShowModal(false); onComplete() }}
        />
      )}

      <div className="glass rounded-2xl overflow-hidden">
        {/* Step progress bar */}
        <div className="flex border-b border-slate-200">
          {STEPS.map((s, i) => {
            const meta = STEP_META[s]
            const done = i < stepIdx
            const active = s === step
            return (
              <button
                key={s}
                onClick={() => i <= stepIdx && setStep(s)}
                className={`flex-1 py-3 px-1 flex flex-col items-center gap-0.5 transition text-xs ${
                  active ? 'bg-violet-600/40 text-violet-700 border-b-2 border-violet-500' :
                  done ? 'bg-emerald-50 text-emerald-600 cursor-pointer' :
                  'text-slate-600 cursor-default'
                }`}
              >
                <span className="text-base">{done ? '✅' : meta.icon}</span>
                <span className="font-semibold hidden sm:block">{meta.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
            Bước {stepIdx + 1}/4 — {STEP_META[step].label}: {STEP_META[step].desc}
          </p>

          {step === 'LEARN' && (
            <div className="space-y-4">
              <div className="bg-violet-50 border border-violet-500/25 rounded-xl p-4">
                <p className="text-xs font-bold text-violet-600 mb-2">🧠 TÂM LÝ HỌC ÁP DỤNG HÔM NAY</p>
                <p className="text-sm font-semibold text-violet-700">{day.psychPrinciple}</p>
              </div>
              {day.scriptId && (
                <Link
                  href={`/scripts/${day.scriptId}`}
                  className="block w-full bg-violet-600 hover:bg-violet-500 text-slate-900 text-center font-semibold py-3 rounded-xl transition text-sm shadow-[0_0_16px_rgba(124,58,237,0.35)]"
                >
                  📖 Đọc kịch bản đầy đủ →
                </Link>
              )}
              <button
                onClick={() => setStep('PREPARE')}
                className="w-full border border-violet-300 text-violet-600 font-semibold py-3 rounded-xl hover:bg-violet-600 hover:text-slate-900 hover:border-transparent transition text-sm"
              >
                Đã đọc xong → Chuẩn bị
              </button>
            </div>
          )}

          {step === 'PREPARE' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-500/25 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-600 mb-1">💡 TIP TÂM LÝ</p>
                <p className="text-sm text-amber-700 leading-relaxed">{day.tip}</p>
              </div>
              <div className="bg-white/5 border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-400 mb-2">GHI NHỚ 3 ĐIỂM CHỐT:</p>
                <ol className="space-y-1.5 text-sm text-slate-600">
                  <li>1. Tên kỹ thuật: <span className="font-semibold text-violet-600">{day.psychPrinciple.split('(')[0].trim()}</span></li>
                  <li>2. Mục tiêu: Xử lý tình huống khách hàng bằng tâm lý, không bằng lý lẽ</li>
                  <li>3. Lưu ý: Giọng điệu bình tĩnh, tự tin — không vội vàng</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('LEARN')} className="flex-1 border border-slate-200 text-slate-400 font-medium py-2.5 rounded-xl hover:bg-white/5 transition text-sm">← Quay lại</button>
                <button onClick={() => setStep('APPLY')} className="flex-2 flex-grow bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition text-sm">Sẵn sàng áp dụng →</button>
              </div>
            </div>
          )}

          {step === 'APPLY' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-400 mb-2">BÀI TẬP THỰC HÀNH HÔM NAY</p>
                <p className="text-sm text-blue-700 leading-relaxed">{day.challenge}</p>
              </div>
              <div className="bg-white/5 border border-slate-200 rounded-xl p-4 text-sm text-slate-400 space-y-2">
                <p className="font-semibold text-slate-600">Cách thực hiện:</p>
                <p>1. Chọn ít nhất 1 khách hàng thực tế để áp dụng hôm nay</p>
                <p>2. Dùng kịch bản như khung sườn, điều chỉnh theo hoàn cảnh</p>
                <p>3. Sau cuộc trò chuyện, quay lại đây ghi nhật ký</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('PREPARE')} className="flex-1 border border-slate-200 text-slate-400 font-medium py-2.5 rounded-xl hover:bg-white/5 transition text-sm">← Quay lại</button>
                <button onClick={() => setStep('REFLECT')} className="flex-2 flex-grow bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition text-sm">Đã thực hành → Ghi nhật ký</button>
              </div>
            </div>
          )}

          {step === 'REFLECT' && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Nhật ký thực hành hôm nay</p>
              {[
                { key: 'q1' as const, label: '1. Bạn đã áp dụng kịch bản với ai / tình huống nào?', placeholder: 'VD: Gọi điện cho khách hàng chê đắt sáng nay...' },
                { key: 'q2' as const, label: '2. Khách hàng phản ứng như thế nào?', placeholder: 'VD: Ban đầu phòng thủ, sau đó bắt đầu hỏi thêm...' },
                { key: 'q3' as const, label: '3. Bạn học được gì / sẽ điều chỉnh gì lần sau?', placeholder: 'VD: Cần làm chậm lại ở bước 2...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-400 block mb-1.5">{label}</label>
                  <textarea
                    value={journal[key]}
                    onChange={e => setJournal(j => ({ ...j, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={2}
                    className="w-full bg-white/5 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-slate-600"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setStep('APPLY')} className="flex-1 border border-slate-200 text-slate-400 font-medium py-2.5 rounded-xl hover:bg-white/5 transition text-sm">← Quay lại</button>
                <button
                  onClick={handleComplete}
                  className="flex-2 flex-grow bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-[0_0_16px_rgba(5,150,105,0.35)]"
                >
                  ✅ Hoàn thành ngày {todayDay}!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
