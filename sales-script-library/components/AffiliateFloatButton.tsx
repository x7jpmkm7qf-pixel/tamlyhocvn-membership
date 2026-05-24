'use client'
import { usePostHog } from 'posthog-js/react'

interface Props {
  chapterId: string
  slug: string
}

export default function AffiliateFloatButton({ chapterId, slug }: Props) {
  const posthog = usePostHog()

  const handleClick = () => {
    posthog?.capture('affiliate_widget_clicked', { current_chapter: chapterId, slug, source: 'float_button' })
  }

  return (
    <>
      <style>{`
        .tkc-aff-float {
          position: fixed;
          bottom: 76px;
          right: 68px;
          z-index: 998;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a07830 0%, #C9A961 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 16px rgba(201,169,97,0.4);
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .tkc-aff-float:hover { transform: scale(1.08); }
        @media (min-width: 641px) { .tkc-aff-float { display: none !important; } }
      `}</style>
      <a
        href="/tang-kinh-cac/affiliate"
        className="tkc-aff-float"
        aria-label="Chương trình giới thiệu — kiếm hoa hồng"
        title="Chương trình giới thiệu"
        onClick={handleClick}
      >
        💰
      </a>
    </>
  )
}
