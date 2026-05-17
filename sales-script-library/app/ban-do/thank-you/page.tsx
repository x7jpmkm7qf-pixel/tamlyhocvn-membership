'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ThankYouContent() {
  const params = useSearchParams()
  const name = params.get('name') || 'sư huynh'
  const email = params.get('email') || ''

  return (
    <div
      className="min-h-screen bg-[#FEF7E6] text-[#1C1917]"
      style={{ fontFamily: '"Be Vietnam Pro", system-ui, -apple-system, sans-serif' }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Noto+Serif:wght@600;700;800&display=swap"
      />

      {/* Nav */}
      <nav className="border-b border-[#7C2D12]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <span
              className="font-bold text-[#7C2D12] text-lg"
              style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
            >
              Tàng Kinh Các
            </span>
          </Link>
          <Link
            href="/khau-quyet"
            className="text-sm text-[#7C2D12] hover:text-[#5C1A0A] font-semibold border-b border-[#C9A961]"
          >
            Khẩu Quyết →
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        {/* Welcome */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">📜</div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold text-[#7C2D12] mb-3"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Cảm ơn {name} đã đăng ký!
          </h1>
          <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
            Bản Đồ 4 Loại Khách Hàng đang trên đường tới hộp thư của anh/chị.
          </p>
        </div>

        {/* Email confirm box */}
        <div className="bg-white border-2 border-[#C9A961] rounded-lg p-6 mb-8 text-center">
          <p className="text-sm text-stone-500 mb-2">📧 Em đã gửi PDF qua email</p>
          <p
            className="text-lg font-bold text-[#7C2D12] break-all"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            {email || 'email của anh/chị'}
          </p>
          <p className="text-sm text-stone-700 mt-4 leading-relaxed">
            Vui lòng check <strong>inbox</strong> — và đừng quên kiểm tra cả hộp <strong>Spam / Promotions</strong> giúp em.
          </p>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            Nếu sau 5 phút chưa thấy email, anh/chị nhắn Zalo <a href="tel:0961588227" className="text-[#7C2D12] font-semibold">0961 588 227</a> em gửi lại ngay.
          </p>
        </div>

        {/* Soft CTA → Khẩu Quyết */}
        <div className="bg-white border border-[#7C2D12]/30 rounded-lg p-6 sm:p-8 text-center shadow-lg">
          <div className="text-4xl mb-3">⚔️</div>
          <h2
            className="text-xl sm:text-2xl font-extrabold text-[#7C2D12] mb-3"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Trong lúc chờ, xem qua 10 Khẩu Quyết Phá Phản Đối
          </h2>
          <p className="text-stone-700 leading-relaxed mb-4 text-sm sm:text-base">
            Câu mẫu <strong>word-for-word</strong> xử lý 10 phản đối kinh điển nhất — đọc đến đâu áp dụng được đến đó.
          </p>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            Bản đồ giúp anh/chị <strong>HIỂU</strong> khách.
            <br />
            Khẩu Quyết giúp anh/chị <strong>XỬ LÝ</strong> khách.
          </p>

          <Link
            href="/khau-quyet"
            className="inline-flex items-center gap-2 bg-[#C9A961] hover:bg-[#A48A4A] text-[#1C1917] px-8 py-3 rounded-md font-bold transition shadow-md text-sm sm:text-base"
          >
            📜 Xem 10 Khẩu Quyết — 199k →
          </Link>

          <p className="text-xs text-stone-500 mt-4">
            Bảo Tín Thất Nhật — hoàn tiền trong 7 ngày nếu không hợp.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-stone-500 mt-10 leading-relaxed">
          Cần hỏi gì cứ nhắn Zalo:{' '}
          <a
            href="tel:0961588227"
            className="text-[#7C2D12] font-semibold hover:text-[#5C1A0A]"
          >
            0961 588 227
          </a>
          {' '}— Hán Văn Sơn
        </p>
      </div>
    </div>
  )
}

export default function BanDoThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FEF7E6] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#7C2D12] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  )
}
