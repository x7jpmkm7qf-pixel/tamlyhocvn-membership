'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BANK = {
  code:    process.env.NEXT_PUBLIC_BANK_CODE    || 'MB',
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || '',
  name:    process.env.NEXT_PUBLIC_BANK_NAME    || 'HAN VAN SON',
}
const BANK_CONFIGURED = BANK.account.length > 0

const AMOUNT = 199000
const AMOUNT_LABEL = '199.000đ'
const PREFIX = 'KQ'
const PRODUCT_SLUG = 'khau-quyet'

function normalizeEmail(email: string) {
  return email.toLowerCase().replace(/[@.]/g, '')
}

function getVietQR(content: string) {
  const p = new URLSearchParams({ amount: String(AMOUNT), addInfo: content, accountName: BANK.name })
  return `https://img.vietqr.io/image/${BANK.code}-${BANK.account}-compact2.jpg?${p}`
}

export default function TKCCheckoutClient({ email, name }: { email: string; name: string }) {
  const router = useRouter()
  const emailNorm = normalizeEmail(email)
  const transferContent = `${PREFIX} ${emailNorm}`
  const qrUrl = getVietQR(transferContent)

  const [qrLoaded, setQrLoaded]       = useState(false)
  const [status, setStatus]           = useState<'waiting' | 'success' | 'already_owned'>('waiting')
  const [countdown, setCountdown]     = useState(3)
  const [pollCount, setPollCount]     = useState(0)
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Preload QR image
  useEffect(() => {
    const img = new Image()
    img.onload  = () => setQrLoaded(true)
    img.onerror = () => setQrLoaded(true)
    img.src = qrUrl
  }, [qrUrl])

  // Polling check-status
  useEffect(() => {
    const poll = async () => {
      try {
        setPollCount(c => c + 1)
        const res  = await fetch(
          `/api/auth/check-status?email=${encodeURIComponent(email)}&expectedAmount=${AMOUNT}&prefix=${PREFIX}&product=${PRODUCT_SLUG}&t=${Date.now()}`,
          { cache: 'no-store' }
        )
        const data = await res.json()
        if (data.status === 'active') {
          setStatus(data.alreadyOwned ? 'already_owned' : 'success')
          if (intervalRef.current) clearInterval(intervalRef.current)
          let count = 3
          setCountdown(count)
          countdownRef.current = setInterval(() => {
            count -= 1
            setCountdown(count)
            if (count <= 0) {
              if (countdownRef.current) clearInterval(countdownRef.current)
              router.push('/tang-kinh-cac/khoa-hoc/khau-quyet')
            }
          }, 1000)
        }
      } catch { /* ignore transient errors */ }
    }

    poll()
    intervalRef.current = setInterval(poll, 2000)
    const onVisible = () => { if (document.visibilityState === 'visible') poll() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      if (intervalRef.current)  clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [email, router])

  // ── Already owned ───────────────────────────────────────────
  if (status === 'already_owned') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.5rem' }}>
          Sư huynh đã sở hữu rồi!
        </div>
        <p style={{ color: '#a09070', marginBottom: '1.5rem' }}>Khẩu Quyết Phá Phản Đối đã được kích hoạt trong tài khoản.</p>
        <Link
          href="/tang-kinh-cac/dashboard"
          style={{ display: 'inline-block', background: '#C9A961', color: '#040e1c', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '0.5rem', textDecoration: 'none' }}
        >
          Vào Tàng Kinh Các →
        </Link>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.5rem' }}>
          Thanh toán thành công!
        </div>
        <p style={{ color: '#a09070', marginBottom: '1rem' }}>
          <strong style={{ color: '#FEF7E6' }}>Khẩu Quyết Phá Phản Đối</strong> đã được kích hoạt. Đang chuyển vào Tàng Kinh Các...
        </p>
        <div style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1.5rem', display: 'inline-block', minWidth: 120 }}>
          <div style={{ fontSize: '0.75rem', color: '#a09070' }}>Chuyển về dashboard sau</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#C9A961' }}>{countdown}s</div>
        </div>
        <br />
        <Link
          href="/tang-kinh-cac/khoa-hoc/khau-quyet"
          style={{ display: 'inline-block', background: '#C9A961', color: '#040e1c', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '0.5rem', textDecoration: 'none' }}
        >
          Bắt đầu đọc ngay →
        </Link>
      </div>
    )
  }

  // ── Waiting / QR display ─────────────────────────────────────
  return (
    <>
      {/* QR code */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Quét QR bằng app ngân hàng bất kỳ
        </p>
        <div style={{ display: 'inline-block', borderRadius: '0.75rem', overflow: 'hidden', border: '2px solid rgba(201,169,97,0.4)', boxShadow: '0 0 24px rgba(201,169,97,0.15)' }}>
          {!BANK_CONFIGURED ? (
            <div style={{ width: 220, height: 220, background: '#040e1c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
              <div style={{ fontSize: '1.5rem' }}>🔧</div>
              <div style={{ fontSize: '0.7rem', color: '#a09070', textAlign: 'center', lineHeight: 1.4 }}>QR khả dụng trên production</div>
            </div>
          ) : qrLoaded ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="QR chuyển khoản" width={220} height={220} style={{ display: 'block' }} />
          ) : (
            <div style={{ width: 220, height: 220, background: '#040e1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, border: '2px solid #C9A961', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
        </div>
      </div>

      {/* Bank info */}
      <div style={{ background: '#040e1c', border: '1px solid rgba(201,169,97,0.15)', borderRadius: '0.625rem', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Thông tin chuyển khoản
        </div>
        {[
          { label: 'Ngân hàng',    value: 'MB Bank' },
          { label: 'Số TK',        value: BANK.account || '—' },
          { label: 'Chủ TK',       value: BANK.name },
          { label: 'Số tiền',      value: AMOUNT_LABEL, gold: true },
          { label: 'Nội dung CK',  value: transferContent, gold: true },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: i < 4 ? '0.5rem' : 0 }}>
            <span style={{ fontSize: '0.8125rem', color: '#a09070', flexShrink: 0 }}>{r.label}:</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: r.gold ? '#C9A961' : '#FEF7E6', textAlign: 'right', wordBreak: 'break-all' }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Transfer content warning */}
      <div style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid rgba(201,169,97,0.25)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#e8dcc8', lineHeight: 1.5 }}>
        ⚠️ Ghi đúng nội dung: <strong style={{ color: '#C9A961' }}>{transferContent}</strong> — hệ thống tự kích hoạt trong 30 giây.
      </div>

      {/* Polling status */}
      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '0.8125rem', color: '#6ee7b7', fontWeight: 600 }}>Đang chờ xác nhận thanh toán...</span>
        </div>
        {pollCount > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'monospace' }}>
            ✓ Giám sát #{pollCount}
          </span>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </>
  )
}
