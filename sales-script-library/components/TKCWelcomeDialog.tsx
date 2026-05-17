'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TKCWelcomeDialog() {
  const [visible, setVisible] = useState(true)
  const router = useRouter()

  const dismiss = () => {
    setVisible(false)
    // Remove ?welcome=true from URL without navigation
    const url = new URL(window.location.href)
    url.searchParams.delete('welcome')
    window.history.replaceState({}, '', url.toString())
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(4,14,28,0.92)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: '#0f2744', border: '1px solid rgba(201,169,97,0.4)', borderRadius: '1rem',
        padding: '2.5rem', maxWidth: '420px', width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚜</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.75rem' }}>
          Chào mừng Sư Huynh!
        </div>
        <p style={{ color: '#a09070', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '1.75rem' }}>
          Bản đồ đã sẵn sàng. 8 chương — mỗi chương là 1 vũ khí tâm lý để sư huynh nhận diện và chốt đúng loại khách.
        </p>
        <button
          onClick={dismiss}
          style={{
            background: '#C9A961', color: '#040e1c', fontWeight: 700, fontSize: '0.9375rem',
            padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', width: '100%',
          }}
        >
          Bắt đầu đọc →
        </button>
      </div>
    </div>
  )
}
