'use client'
import { usePostHog } from 'posthog-js/react'

const ZALO_LINK = process.env.NEXT_PUBLIC_ZALO_GROUP_LINK || 'https://zalo.me/g/iaa5rn07vkurgl1tiana'

interface Props {
  chapterId: string
  slug: string
}

export default function ZaloGroupButton({ chapterId, slug }: Props) {
  const posthog = usePostHog()

  const handleClick = () => {
    posthog?.capture('zalo_group_click', { chapter_id: chapterId, slug })
  }

  return (
    <>
      <style>{`
        .zkc-btn {
          position: fixed;
          bottom: 100px;
          right: 20px;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #0068FF 0%, #00A4FF 100%);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          padding: 10px 18px 10px 12px;
          border-radius: 50px;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(0,104,255,0.35);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }
        .zkc-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 32px rgba(0,104,255,0.5);
        }
        .zkc-icon {
          width: 28px;
          height: 28px;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 16px;
        }
        .zkc-pulse {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 12px;
          height: 12px;
          background: #ff3b30;
          border-radius: 50%;
          border: 2px solid #091b30;
          animation: zkc-pulse 2s ease-in-out infinite;
        }
        @keyframes zkc-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        @media (max-width: 640px) {
          .zkc-btn {
            bottom: 76px;
            right: 12px;
            padding: 10px;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            justify-content: center;
          }
          .zkc-label { display: none; }
        }
      `}</style>

      <a
        href={ZALO_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="zkc-btn"
        aria-label="Tham gia nhóm Zalo Tàng Kinh Các"
        title="Tham gia nhóm Zalo Tàng Kinh Các"
        onClick={handleClick}
      >
        <span className="zkc-icon">💬</span>
        <span className="zkc-label">Vào nhóm Zalo</span>
        <span className="zkc-pulse" />
      </a>
    </>
  )
}
