import Link from 'next/link'

export default function MentoringSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden text-center">
        <div className="bg-gradient-to-r from-amber-500 to-violet-700 px-6 py-10">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-2xl font-black text-white mb-1">Chào mừng Mentee mới!</h1>
          <p className="text-amber-100 text-sm">Hành trình 90 ngày của anh/chị chính thức bắt đầu</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-bold text-amber-800">Bước tiếp theo:</p>
            <p className="text-sm text-amber-700 leading-relaxed">
              1. Sơn sẽ liên hệ trong <strong>24h</strong> để lên lịch buổi đầu<br />
              2. Buổi 1: <strong>Audit & Battle Plan</strong> — Sơn phân tích toàn bộ approach hiện tại<br />
              3. Chuẩn bị: ghi âm 1 cuộc gọi bán hàng gần nhất nếu có
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-xs text-slate-600">
              Liên hệ trực tiếp:{' '}
              <a href="tel:0961588227" className="font-bold text-amber-600">0961 588 227</a>{' '}
              · Zalo: <strong>Hán Văn Sơn</strong>
            </p>
          </div>
          <Link href="/" className="block w-full border border-slate-300 text-slate-600 font-semibold py-3 rounded-xl transition hover:bg-slate-50 text-sm">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
