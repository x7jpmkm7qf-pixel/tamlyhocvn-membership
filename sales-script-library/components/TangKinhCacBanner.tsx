'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const ZALO_GROUP_LINK = 'https://zalo.me/g/iaa5rn07vkurgl1tiana'
const STORAGE_KEY = 'tangKinhCac_banner_dismissed_v1'

export default function TangKinhCacBanner() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith('/tang-kinh-cac')) return
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) return

    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data?.member) setVisible(true)
      })
      .catch(() => {})
  }, [pathname])

  if (!visible || pathname?.startsWith('/tang-kinh-cac')) return null

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">🗡️</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm sm:text-base truncate">
              Tân đệ tử — Tàng Kinh Các đã mở cửa
            </p>
            <p className="text-xs sm:text-sm text-violet-100 hidden sm:block">
              Đặc quyền khoá 99k: tu luyện 30 ngày + sư huynh giải đáp 1-1 trong nhóm Zalo riêng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={ZALO_GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-violet-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-violet-50 transition whitespace-nowrap"
          >
            Vào nhóm →
          </a>
          <button
            onClick={handleDismiss}
            aria-label="Đóng"
            className="text-violet-200 hover:text-white text-xl px-2 leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
