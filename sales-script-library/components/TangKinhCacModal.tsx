'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const ZALO_GROUP_LINK = 'https://zalo.me/g/iaa5rn07vkurgl1tiana'
const STORAGE_KEY = 'tangKinhCac_modal_seen_v1'

export default function TangKinhCacModal() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith('/tang-kinh-cac')) return
    const seen = localStorage.getItem(STORAGE_KEY)
    if (seen) return

    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data?.member) {
          const t = setTimeout(() => setOpen(true), 1200)
          return () => clearTimeout(t)
        }
      })
      .catch(() => {})
  }, [pathname])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  const handleJoin = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    window.open(ZALO_GROUP_LINK, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  if (!open || pathname?.startsWith('/tang-kinh-cac')) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-purple-800 px-6 py-8 text-white text-center">
          <div className="text-5xl mb-3">🗡️</div>
          <h2 className="text-2xl font-bold mb-2">Tàng Kinh Các đã mở cửa</h2>
          <p className="text-violet-100 text-sm">
            Đặc quyền tân đệ tử KB Sales 99k
          </p>
        </div>

        <div className="px-6 py-6">
          <p className="text-slate-700 text-sm mb-4 leading-relaxed">
            Nhập <strong>Tàng Kinh Các</strong> — nhóm Zalo riêng của bản môn — để cùng tu luyện 30 ngày:
          </p>

          <ul className="space-y-2 mb-6 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-violet-600 mt-0.5">📿</span>
              <span>Mỗi ngày 1 bí kíp + 1 tình huống thí võ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 mt-0.5">🎙️</span>
              <span>Voice Q&amp;A 1-1 với sư huynh hàng tuần</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 mt-0.5">⚔️</span>
              <span>Thí võ role-play với huynh đệ cùng khoá</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-600 mt-0.5">🏆</span>
              <span>Đặc quyền vào &ldquo;Đại Điện&rdquo; sau 30 ngày</span>
            </li>
          </ul>

          <button
            onClick={handleJoin}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg shadow-lg transition"
          >
            🗡️ Vào Tàng Kinh Các ngay
          </button>

          <button
            onClick={handleClose}
            className="w-full text-slate-500 hover:text-slate-700 text-xs mt-3 py-2 transition"
          >
            Để sau
          </button>
        </div>

        <button
          onClick={handleClose}
          aria-label="Đóng"
          className="absolute top-3 right-3 text-white/70 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition"
        >
          ×
        </button>
      </div>
    </div>
  )
}
