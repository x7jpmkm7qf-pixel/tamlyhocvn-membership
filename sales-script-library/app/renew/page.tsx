'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BANK = {
  code:    process.env.NEXT_PUBLIC_BANK_CODE    || 'MB',
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0984899999',
  name:    process.env.NEXT_PUBLIC_BANK_NAME    || 'HAN VAN SON',
  amount:  99000,
}

function getVietQR(content: string) {
  const p = new URLSearchParams({ amount: String(BANK.amount), addInfo: content, accountName: BANK.name })
  return `https://img.vietqr.io/image/${BANK.code}-${BANK.account}-compact2.jpg?${p}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function RenewPage() {
  const router = useRouter()

  const [member, setMember]         = useState<{ name: string; email: string; expiresAt: string | null; daysLeft: number | null } | null>(null)
  const [loading, setLoading]       = useState(true)
  const [qrLoaded, setQrLoaded]     = useState(false)
  const [status, setStatus]         = useState<'waiting' | 'renewed'>('waiting')
  const [newExpiry, setNewExpiry]   = useState<string | null>(null)
  const [countdown, setCountdown]   = useState(3)
  const [pollCount, setPollCount]   = useState(0)
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load session
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.member) { router.push('/login'); return }
        setMember(data.member)
        setLoading(false)
      })
  }, [router])

  // Preload QR
  useEffect(() => {
    if (!member?.email) return
    const emailNorm = member.email.toLowerCase().replace(/[@.]/g, '')
    const img = new Image()
    img.onload  = () => setQrLoaded(true)
    img.onerror = () => setQrLoaded(true)
    img.src = getVietQR(`MSL ${emailNorm}`)
  }, [member?.email])

  // Poll renew-status
  useEffect(() => {
    if (!member?.email) return

    const poll = async () => {
      try {
        setPollCount(c => c + 1)
        const res  = await fetch(`/api/auth/renew-status?email=${encodeURIComponent(member.email)}&t=${Date.now()}`, { cache: 'no-store' })
        const data = await res.json()
        if (data.status === 'renewed') {
          setStatus('renewed')
          setNewExpiry(data.expiresAt)
          if (intervalRef.current) clearInterval(intervalRef.current)

          let count = 4
          setCountdown(count)
          countdownRef.current = setInterval(() => {
            count -= 1
            setCountdown(count)
            if (count <= 0) {
              if (countdownRef.current) clearInterval(countdownRef.current)
              router.push('/dashboard')
            }
          }, 1000)
        }
      } catch { /* bỏ qua lỗi mạng */ }
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
  }, [member?.email, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const emailNorm      = (member?.email || '').toLowerCase().replace(/[@.]/g, '')
  const transferContent = `MSL ${emailNorm}`
  const qrUrl          = getVietQR(transferContent)
  const isExpired      = member?.daysLeft !== null && (member?.daysLeft ?? 0) <= 0

  // ── Success screen ──────────────────────────────────────────
  if (status === 'renewed') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden text-center">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-10">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-2xl font-black text-white mb-1">Gia hạn thành công!</h1>
            <p className="text-emerald-100 text-sm">
              Tài khoản của {member?.name?.split(' ').pop() || 'anh/chị'} đã được gia hạn thêm 30 ngày
            </p>
          </div>
          <div className="p-6 space-y-4">
            {newExpiry && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-800">
                  ✅ Tài khoản hiệu lực đến <strong>{formatDate(newExpiry)}</strong>
                </p>
              </div>
            )}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Tự động chuyển về dashboard sau</p>
              <p className="text-3xl font-black text-violet-600">{countdown}s</p>
            </div>
            <Link href="/dashboard" className="block w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition text-sm">
              Vào Dashboard →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Renewal payment page ────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <Link href="/" className="mb-6 flex items-center gap-2">
        <span className="text-2xl">🧠</span>
        <span className="bg-gradient-to-r from-violet-700 to-amber-600 bg-clip-text text-transparent font-extrabold text-lg">
          Mind Sales Lab
        </span>
      </Link>

      {/* Expired notice */}
      {isExpired ? (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-6 text-center max-w-sm w-full">
          <p className="text-red-700 text-sm font-semibold">⛔ Tài khoản đã hết hạn</p>
          <p className="text-red-600 text-xs mt-0.5">Gia hạn để tiếp tục truy cập 18+ kịch bản</p>
        </div>
      ) : member?.daysLeft !== null && (member?.daysLeft ?? 0) <= 7 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-center max-w-sm w-full">
          <p className="text-amber-700 text-sm font-semibold">⚠️ Còn {member?.daysLeft} ngày — Gia hạn sớm để không bị gián đoạn</p>
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-5 text-white text-center">
          <div className="text-3xl font-black mb-1">99.000đ</div>
          <p className="text-violet-200 text-sm">Gia hạn Mind Sales Lab — thêm 30 ngày</p>
          {member?.name && (
            <p className="text-white font-semibold text-sm mt-1">
              Xin chào, {member.name.split(' ').pop()}! 👋
            </p>
          )}
          {member?.expiresAt && !isExpired && (
            <p className="text-violet-200 text-xs mt-1">
              Gia hạn sớm → hiệu lực đến {formatDate(
                new Date(new Date(member.expiresAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
              )}
            </p>
          )}
        </div>

        <div className="p-6">
          {/* QR */}
          <div className="text-center mb-5">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
              Quét QR bằng app ngân hàng bất kỳ
            </p>
            <div className="inline-block rounded-2xl overflow-hidden border-2 border-violet-200 shadow-md" style={{ width: 240, height: 240 }}>
              {qrLoaded ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt="QR gia hạn" width={240} height={240} className="block" />
              ) : (
                <div className="w-[240px] h-[240px] bg-slate-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Đang tải mã QR...</span>
                </div>
              )}
            </div>
          </div>

          {/* Bank info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 mb-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Thông tin chuyển khoản</p>
            {[
              { label: 'Ngân hàng',     value: 'MB Bank' },
              { label: 'Số tài khoản',  value: BANK.account },
              { label: 'Chủ tài khoản', value: BANK.name },
              { label: 'Số tiền',       value: '99.000đ', hl: true },
              { label: 'Nội dung CK',   value: transferContent, hl: true },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 shrink-0">{r.label}:</span>
                <span className={`text-xs font-bold text-right truncate ${r.hl ? 'text-violet-600' : 'text-slate-800'}`}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              ⚠️ <strong>Nội dung CK phải ghi đúng:</strong>{' '}
              <strong className="text-violet-700">{transferContent}</strong>{' '}để hệ thống tự xác nhận.
            </p>
          </div>

          {/* Waiting */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs text-emerald-800 font-semibold">Đang chờ xác nhận gia hạn...</p>
            </div>
            <p className="text-xs text-emerald-700 text-center mt-1">Trang tự động cập nhật khi nhận được tiền</p>
            {pollCount > 0 && (
              <p className="text-xs text-emerald-600 text-center mt-1 font-mono">✓ Đang giám sát #{pollCount}</p>
            )}
          </div>

          <a href="tel:0961588227" className="block w-full text-center border border-violet-300 text-violet-600 hover:bg-violet-50 font-semibold py-2.5 rounded-xl transition text-sm">
            Cần hỗ trợ? Gọi 0961 588 227 →
          </a>
        </div>
      </div>
    </div>
  )
}
