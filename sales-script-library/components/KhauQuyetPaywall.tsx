'use client'
import Link from 'next/link'

/**
 * Paywall shown to members who bought Khẩu Quyết (199k) but haven't upgraded to Nội Môn.
 * Khẩu Quyết product gives PDF access via email — library/scripts are Nội Môn-only.
 */
export default function KhauQuyetPaywall({ email }: { email?: string }) {
  const upgradeHref = email
    ? `/khau-quyet/nang-cap?email=${encodeURIComponent(email)}`
    : '/khau-quyet/nang-cap'

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-stone-800/80 backdrop-blur border border-amber-500/30 rounded-3xl shadow-2xl p-8 sm:p-10 text-center">
        <div className="text-6xl mb-5">🏯</div>
        <p className="inline-block bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          Khu vực Nội Môn
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-100 mb-4 leading-snug">
          Thư viện kịch bản chỉ dành cho đệ tử Nội Môn
        </h1>
        <p className="text-stone-300 leading-relaxed mb-2">
          Anh/chị đã sở hữu trọn bộ <strong className="text-amber-300">Khẩu Quyết Phá Phản Đối</strong> —
          PDF đã được gửi qua email cùng 4 bonus.
        </p>
        <p className="text-stone-300 leading-relaxed mb-8">
          Để truy cập <strong className="text-amber-300">thư viện 18+ kịch bản chuyên ngành</strong>,
          live "Mổ Xẻ Deal", nhóm Zalo Nội Môn và lộ trình 30 ngày —
          anh/chị cần nâng cấp lên Tàng Kinh Các Nội Môn.
        </p>

        <div className="bg-stone-900/60 border border-stone-700 rounded-2xl p-5 mb-7">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Ưu đãi nâng cấp</p>
          <div className="flex items-baseline justify-center gap-3 mb-1">
            <span className="text-stone-500 line-through text-lg">499.000đ</span>
            <span className="font-serif font-extrabold text-3xl text-amber-300">300.000đ</span>
          </div>
          <p className="text-xs text-stone-400">Trừ thẳng 199k anh/chị đã đầu tư cho Khẩu Quyết</p>
        </div>

        <Link
          href={upgradeHref}
          className="inline-block bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-4 rounded-xl transition shadow-lg shadow-amber-500/20 mb-4"
        >
          🗝️ Mở khoá Nội Môn ngay →
        </Link>
        <p className="text-xs text-stone-500">
          Cần hỗ trợ? Nhắn{' '}
          <a href="https://zalo.me/0961588227" target="_blank" rel="noopener" className="text-amber-400 hover:underline">
            Zalo Sơn
          </a>
        </p>
      </div>
    </div>
  )
}
