'use client'
import { useEffect, useRef, useState } from 'react'

const PAGES = [
  { src: '/pdf-page-1.png', label: 'Trang 1', teaser: false },
  { src: '/pdf-page-2.png', label: 'Trang 2', teaser: true },
  { src: '/pdf-page-3.png', label: 'Trang 3', teaser: true },
]

export default function PDFPreview() {
  const [active, setActive] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    intervalRef.current = setInterval(
      () => setActive(i => (i + 1) % PAGES.length),
      4000,
    )
  }
  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => {
    start()
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (i: number) => {
    setActive(i)
    stop()
    start()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 3D Book mockup */}
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pdf-mockup-3d.png"
          alt="Bản Đồ 4 Loại Khách Hàng — preview"
          style={{
            width: 'clamp(240px, 28vw, 320px)',
            height: 'clamp(300px, 35vw, 400px)',
            objectFit: 'contain',
            transform: 'rotate(-5deg)',
            filter: 'drop-shadow(0 16px 32px rgba(28,25,23,0.22)) drop-shadow(0 4px 8px rgba(28,25,23,0.12))',
            display: 'block',
          }}
        />
        <p className="text-xs text-stone-500 text-center mt-5">
          📖 20 trang — in được — đọc lại được trên web
        </p>
      </div>

      {/* Carousel */}
      <div className="flex flex-col items-center gap-3">
        {/* Frame */}
        <div
          className="relative rounded-lg overflow-hidden shadow-md bg-stone-100"
          style={{ width: 'clamp(160px, 20vw, 210px)', aspectRatio: '3/4' }}
          onMouseEnter={stop}
          onMouseLeave={start}
        >
          {PAGES.map((page, i) => (
            <div
              key={page.src}
              aria-hidden={i !== active}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: i === active ? 1 : 0,
                transition: 'opacity 0.45s ease',
                pointerEvents: i === active ? 'auto' : 'none',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.src}
                alt={page.label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Teaser gradient + blur overlay for pages 2 & 3 */}
              {page.teaser && (
                <>
                  {/* Blur layer clipped to bottom 60% */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      top: '40%',
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                      maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%)',
                    }}
                  />
                  {/* Gradient fade to background */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to bottom, transparent 38%, rgba(254,247,230,0.55) 58%, rgba(254,247,230,0.92) 78%, #FEF7E6 95%)',
                    }}
                  />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Sample pages">
          {PAGES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              aria-label={`Xem trang mẫu ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                width: i === active ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === active ? '#7C2D12' : '#C9A961',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
