'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const params    = useSearchParams()
  const orderCode = params.get('orderCode')
  const [dots, setDots] = useState('.')

  // Animated dots while waiting
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-10 flex items-center gap-2 font-bold text-lg">
        <span className="text-2xl">🧠</span>
        <span className="bg-gradient-to-r from-violet-700 to-amber-600 bg-clip-text text-transparent font-extrabold">
          Mind Sales Lab
        </span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden text-center">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8">
          <div className="text-6xl mb-3">✅</div>
          <h1 className="text-xl font-black text-white">Thanh toán thành công!</h1>
          <p className="text-emerald-100 text-sm mt-1">Cảm ơn anh/chị đã tin tưởng Mind Sales Lab</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-700 mb-2">⚡ Kích hoạt tự động đang xử lý{dots}</p>
            <p className="text-xs text-amber-800 leading-relaxed">
              PayOS đang xác nhận thanh toán và tự động mở khoá tài khoản cho anh/chị.
              Thường hoàn thành trong <strong>vài giây đến 1 phút</strong>.
            </p>
          </div>

          {orderCode && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-0.5">Mã đơn hàng của anh/chị</p>
              <p className="text-sm font-bold text-slate-800 font-mono">{orderCode}</p>
            </div>
          )}

          <div className="space-y-2 text-left">
            {[
              { icon: '📧', text: 'Tài khoản được kích hoạt với email anh/chị đã đăng ký' },
              { icon: '🔑', text: 'Đăng nhập bằng email và mật khẩu đã tạo' },
              { icon: '📚', text: 'Truy cập toàn bộ 18+ kịch bản và lộ trình 30 ngày' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                <span className="shrink-0 mt-0.5">{s.icon}</span>
                <span>{s.text}</span>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="block w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md shadow-violet-200"
          >
            Đăng nhập ngay →
          </Link>

          <p className="text-xs text-slate-400">
            Nếu sau 5 phút vẫn chưa đăng nhập được, liên hệ{' '}
            <a href="tel:0961588227" className="text-violet-600 font-semibold">0961 588 227</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
