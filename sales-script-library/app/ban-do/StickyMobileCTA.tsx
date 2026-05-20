'use client'
import { useEffect, useState } from 'react'

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const heroCta = document.querySelector<Element>('#hero-cta')
    const ctaForm = document.querySelector<Element>('#cta-form')
    if (!heroCta || !ctaForm) return

    let heroInView = true
    let formInView = false

    const update = () => setVisible(!heroInView && !formInView)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === heroCta) heroInView = entry.isIntersecting
          if (entry.target === ctaForm) formInView = entry.isIntersecting
        }
        update()
      },
      { threshold: 0 },
    )

    observer.observe(heroCta)
    observer.observe(ctaForm)
    return () => observer.disconnect()
  }, [])

  const scrollToForm = () => {
    document.querySelector('#cta-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        // height grows with safe-area on iPhone notch
        padding: '8px 8px calc(8px + env(safe-area-inset-bottom, 0px))',
        background: '#FEF7E6',
        boxShadow: '0 -2px 12px rgba(28,25,23,0.12)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 200ms ease-out',
        // hide on md+ via media query equivalent
      }}
      className="md:hidden"
    >
      <button
        onClick={scrollToForm}
        className="w-full bg-[#7C2D12] hover:bg-[#5C1A0A] active:bg-[#5C1A0A] text-[#FEF7E6] font-bold rounded-md text-sm transition-colors"
        style={{ height: '40px' }}
      >
        📩 Nhận bản đồ ngay
      </button>
    </div>
  )
}
