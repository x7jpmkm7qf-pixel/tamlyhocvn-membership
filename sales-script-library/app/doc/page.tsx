import { getMemberSession } from '@/lib/auth'
import Link from 'next/link'
import ResendForm from './ResendForm'

export default async function DocPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const session = getMemberSession()
  const error = searchParams.error

  if (session) {
    // Authenticated: show PDF reader page
    return (
      <div className="min-h-screen bg-[#FEF7E6]" style={{ fontFamily: '"Be Vietnam Pro", system-ui, sans-serif' }}>
        {/* Header */}
        <header className="border-b border-[#7C2D12]/15 px-4 py-4">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <span className="font-bold text-[#7C2D12]" style={{ fontFamily: '"Noto Serif", Georgia, serif' }}>📜 Tàng Kinh Các</span>
            <span className="text-xs text-stone-500">Xin chào, {session.name.split(' ').pop()}</span>
          </div>
        </header>
        {/* Content */}
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">🗺️</div>
            <h1 className="text-3xl font-extrabold text-[#7C2D12] mb-3" style={{ fontFamily: '"Noto Serif", Georgia, serif' }}>
              Bản Đồ 4 Loại Khách Hàng
            </h1>
            <p className="text-stone-600 text-sm">PDF · 20 trang · Hán Văn Sơn</p>
          </div>

          {/* Download button */}
          <div className="text-center mb-8">
            <a
              href="/files/Ban-Do-4-Loai-Khach-Hang-Sales-Viet.pdf"
              download
              className="inline-flex items-center gap-2 bg-[#7C2D12] hover:bg-[#5C1A0A] text-[#FEF7E6] font-bold px-8 py-4 rounded-md transition shadow-lg text-base"
            >
              ⬇ Tải PDF về máy
            </a>
          </div>

          {/* Read online link */}
          <div className="text-center mb-10">
            <Link
              href="/tang-kinh-cac/khoa-hoc/ban-do/ban-do-ch-00"
              className="text-[#7C2D12] font-semibold hover:underline text-sm border border-[#C9A961] rounded-md px-6 py-3 inline-block"
            >
              📖 Đọc online trong Tàng Kinh Các →
            </Link>
          </div>

          <div className="border-t border-[#C9A961]/30 pt-8 text-center">
            <p className="text-sm text-stone-600 mb-3">Muốn đọc lại lần sau? Dùng link trong email, hoặc nhập email để nhận link mới:</p>
            <ResendForm />
          </div>
        </main>
      </div>
    )
  }

  // Not authenticated: show resend form
  return (
    <div className="min-h-screen bg-[#FEF7E6] flex items-center justify-center px-4" style={{ fontFamily: '"Be Vietnam Pro", system-ui, sans-serif' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📜</div>
          <h1 className="text-2xl font-extrabold text-[#7C2D12] mb-2" style={{ fontFamily: '"Noto Serif", Georgia, serif' }}>
            Tàng Kinh Các
          </h1>
          {error === 'expired' && (
            <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded p-3 mb-3">
              Link đã hết hạn. Nhập email để nhận link mới.
            </p>
          )}
          {error === 'invalid' && (
            <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded p-3 mb-3">
              Link không hợp lệ. Nhập email để nhận link mới.
            </p>
          )}
          <p className="text-stone-600 text-sm">Nhập email để nhận link đọc Bản Đồ</p>
        </div>
        <ResendForm />
        <p className="text-center text-xs text-stone-400 mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/ban-do" className="text-[#7C2D12] hover:underline">Nhận Bản Đồ miễn phí →</Link>
        </p>
      </div>
    </div>
  )
}
