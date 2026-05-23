'use client'
import { useState, useEffect, useRef } from 'react'

export default function AffiliateLinkCopyClient({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showModal) return
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(link, { width: 240, margin: 2, color: { dark: '#040e1c', light: '#FEF7E6' } })
        .then(url => setQrDataUrl(url))
        .catch(() => {})
    })
  }, [showModal, link])

  useEffect(() => {
    if (!showModal) return
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setShowModal(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showModal])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const shareItems = [
    {
      label: 'Chia sẻ qua Zalo',
      icon: '💬',
      href: `https://zalo.me/share/url?url=${encodeURIComponent(link)}`,
    },
    {
      label: 'Chia sẻ Facebook',
      icon: '📘',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    },
    {
      label: 'Chia sẻ Messenger',
      icon: '✉️',
      href: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(link)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(link)}`,
    },
  ]

  const downloadQR = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = 'affiliate-qr.png'
    a.click()
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, background: '#040e1c', border: '1px solid rgba(201,169,97,0.2)',
          borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontFamily: 'monospace',
          fontSize: '0.875rem', color: '#C9A961', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {link}
        </div>
        <button
          onClick={copy}
          style={{
            flexShrink: 0,
            background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(201,169,97,0.15)',
            border: `1px solid ${copied ? 'rgba(52,211,153,0.4)' : 'rgba(201,169,97,0.4)'}`,
            borderRadius: '0.5rem', padding: '0.625rem 1rem',
            color: copied ? '#34d399' : '#C9A961',
            fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ Đã copy' : '📋 Copy'}
        </button>
        <button
          onClick={() => setShowModal(true)}
          style={{
            flexShrink: 0,
            background: 'rgba(201,169,97,0.1)',
            border: '1px solid rgba(201,169,97,0.3)',
            borderRadius: '0.5rem', padding: '0.625rem 1rem',
            color: '#C9A961', fontWeight: 700, fontSize: '0.8125rem',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          📱 Chia sẻ
        </button>
      </div>

      {/* Share modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(4,14,28,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div ref={modalRef} style={{
            background: '#0f2744', border: '1px solid rgba(201,169,97,0.3)',
            borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '360px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 700, color: '#FEF7E6', fontSize: '1rem' }}>Chia sẻ link</span>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#a09070', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            {/* QR code */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" style={{ width: 160, height: 160, borderRadius: '0.5rem' }} />
              ) : (
                <div style={{ width: 160, height: 160, background: '#040e1c', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a09070', fontSize: '0.8rem' }}>
                  Đang tạo QR...
                </div>
              )}
            </div>

            {/* Share buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {shareItems.map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: '#040e1c', border: '1px solid rgba(201,169,97,0.15)',
                    borderRadius: '0.5rem', padding: '0.75rem 1rem',
                    color: '#FEF7E6', textDecoration: 'none', fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
              <button
                onClick={downloadQR}
                disabled={!qrDataUrl}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: '#040e1c', border: '1px solid rgba(201,169,97,0.15)',
                  borderRadius: '0.5rem', padding: '0.75rem 1rem',
                  color: qrDataUrl ? '#FEF7E6' : '#a09070', fontSize: '0.875rem',
                  fontWeight: 600, cursor: qrDataUrl ? 'pointer' : 'default', width: '100%', textAlign: 'left',
                }}
              >
                <span>📥</span>
                <span>Download QR Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
