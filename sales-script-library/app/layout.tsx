import type { Metadata } from 'next'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'
import MetaPixel from '@/components/MetaPixel'
import TikTokPixel from '@/components/TikTokPixel'
import TangKinhCacBanner from '@/components/TangKinhCacBanner'
import TangKinhCacModal from '@/components/TangKinhCacModal'
import PHProvider from '@/components/PostHogProvider'

export const metadata: Metadata = {
  title: 'Thư viện Kịch bản Sales',
  description: 'Kịch bản sales chuyên nghiệp cho từng ngành và tình huống',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50">
        <MetaPixel />
        <TikTokPixel />
        <PHProvider>
          <TangKinhCacBanner />
          {children}
          <TangKinhCacModal />
          <ChatWidget />
        </PHProvider>
      </body>
    </html>
  )
}
