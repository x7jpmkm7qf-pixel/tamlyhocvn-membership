import Link from 'next/link'

export default function BootcampSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden text-center">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-10">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-2xl font-black text-white mb-1">Chào mừng đến PRO Bootcamp!</h1>
          <p className="text-blue-200 text-sm">Suất của anh/chị đã được xác nhận thành công</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm font-bold text-blue-800">Bước tiếp theo:</p>
            <p className="text-sm text-blue-700 leading-relaxed">
              1. Sơn sẽ liên hệ qua Zalo/điện thoại trong <strong>2 tiếng</strong><br />
              2. Nhận link Zoom cho buổi học đầu tiên<br />
              3. Chuẩn bị 1 tình huống thực tế hay bị mắc kẹt nhất
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-800">
              Cần hỗ trợ ngay? Zalo/gọi:{' '}
              <a href="tel:0961588227" className="font-bold text-amber-700">0961 588 227</a>
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
