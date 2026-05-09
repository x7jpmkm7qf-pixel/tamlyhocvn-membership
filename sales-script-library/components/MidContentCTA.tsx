'use client'

import Link from 'next/link'

interface Props {
  emoji: string
  headline: React.ReactNode
  body: React.ReactNode
  ctaText: string
  /** Variant: violet/amber/emerald — phối với màu của script section */
  variant?: 'violet' | 'amber' | 'emerald'
  /** Highlight bonus offer (chỉ dùng cho CTA cuối) */
  showBonus?: boolean
}

const VARIANT_CLASSES = {
  violet: {
    bg: 'from-violet-900/40 to-slate-800/40',
    border: 'border-violet-700/40',
    accent: 'text-violet-300',
    btn: 'from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 shadow-violet-900/40',
  },
  amber: {
    bg: 'from-amber-900/40 to-slate-800/40',
    border: 'border-amber-700/40',
    accent: 'text-amber-300',
    btn: 'from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-900/40',
  },
  emerald: {
    bg: 'from-emerald-900/40 to-slate-800/40',
    border: 'border-emerald-700/40',
    accent: 'text-emerald-300',
    btn: 'from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-900/40',
  },
}

/**
 * Mid-content upsell card — chèn giữa 3 scripts để bắt user khi đang đọc.
 * Tự ẩn khi print PDF.
 */
export default function MidContentCTA({
  emoji,
  headline,
  body,
  ctaText,
  variant = 'violet',
  showBonus = false,
}: Props) {
  const v = VARIANT_CLASSES[variant]

  return (
    <div className={`my-8 bg-gradient-to-br ${v.bg} border ${v.border} rounded-2xl p-5 sm:p-6 print:hidden`}>
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl flex-shrink-0">{emoji}</span>
        <div>
          <h3 className="font-black text-white text-base sm:text-lg leading-tight mb-1.5">
            {headline}
          </h3>
          <p className={`text-sm ${v.accent} leading-relaxed`}>{body}</p>
        </div>
      </div>

      {showBonus && (
        <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-600/40 rounded-xl px-4 py-3 mb-4 text-sm">
          <p className="text-amber-200 leading-relaxed">
            🎁 <strong className="text-amber-100">Mua hôm nay được tặng kèm:</strong>{' '}
            <span className="text-white">30 phút audit 1-1 Zalo với sư phụ Sơn</span>{' '}
            <span className="text-amber-300/70 line-through">(giá 1.000.000đ)</span> — em phân tích
            1 case của anh đang stuck rồi cho kịch bản custom.
          </p>
        </div>
      )}

      <Link
        href="/register"
        className={`block w-full text-center bg-gradient-to-r ${v.btn} text-white font-bold py-3 sm:py-3.5 rounded-xl transition text-sm sm:text-base shadow-lg`}
      >
        {ctaText}
      </Link>
    </div>
  )
}
