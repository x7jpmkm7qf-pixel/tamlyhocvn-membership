'use client'
import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TrackEventOnMount from '@/components/TrackEventOnMount'

const BANK = {
  code:    process.env.NEXT_PUBLIC_BANK_CODE    || 'MB',
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0984899999',
  name:    process.env.NEXT_PUBLIC_BANK_NAME    || 'HAN VAN SON',
  amount:  1_497_000,
}

function getVietQR(content: string) {
  const p = new URLSearchParams({
    amount:      String(BANK.amount),
    addInfo:     content,
    accountName: BANK.name,
  })
  return `https://img.vietqr.io/image/${BANK.code}-${BANK.account}-compact2.jpg?${p}`
}

function StepDot({ n, label, active, done }: { n: string; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
      }`}>{done ? '✓' : n}</div>
      <span className={`text-xs font-semibold ${
        done ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-slate-400'
      }`}>{label}</span>
    </div>
  )
}

function PaymentContent() {
  const params = useSearchParams()
  const router = useRouter()
  const email  = params.get('email') || ''
  const name   = params.get('name')  || ''

  // Normalize email: bỏ @ và . để MB Bank không strip mất ký tự
  const emailNorm = email.toLowerCase().replace(/[@.]/g, '')
  const transferContent = `PRO ${emailNorm}`
  const qrUrl = getVietQR(transferContent)

  const [qrLoaded, setQrLoaded]           = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'paid'>('waiting')
  const [countdown, setCountdown]         = useState(3)
  const [pollCount, setPollCount]         = useState(0)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  // Preload QR image
  useEffect(() => {
    if (!email) return
    const img = new Image()
    img.onload  = () => setQrLoaded(true)
    img.onerror = () => setQrLoaded(true)
    img.src = qrUrl
  }, [qrUrl, email])

  // Poll check-status
  useEffect(() => {
    if (!email) return

    const poll = async () => {
      try {
        setPollCount(c => c + 1)
        const res  = await fetch(`/api/bootcamp/check-status?email=${encodeURIComponent(email)}&t=${Date.now()}`, { cache: 'no-store' })
        const data = await res.json()
        if (data.status === 'paid') {
          setPaymentStatus('paid')
          if (intervalRef.current) clearInterval(intervalRef.current)

          let count = 3
          setCountdown(count)
          countdownRef.current = setInterval(() => {
            count -= 1
            setCountdown(count)
            if (count <= 0) {
              if (countdownRef.current) clearInterval(countdownRef.current)
              router.push('/bootcamp/success')
            }
          }, 1000)
        }
      } catch { /* bỏ qua lỗi mạng tạm thời */ }
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

  // Success screen
  if (paymentStatus === 'paid') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden text-center">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-10">
            <div className="text-7xl mb-4 animate-bounce">🎓</div>
            <h1 className="text-2xl font-black text-white mb-1">Thanh toán thành công!</h1>
            <p className="text-blue-100 text-sm">Suất PRO Bootcamp của {name || 'anh/chị'} đã được xác nhận</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 leading-relaxed">
                ✅ Sơn sẽ liên hệ qua <strong>Zalo/điện thoại</strong> trong 2 tiếng để xác nhận suất
                và gửi link Zoom cho buổi học đầu tiên.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Tự động chuyển sau</p>
              <p className="text-3xl font-black text-blue-600">{countdown}s</p>
            </div>
            <Link href="/bootcamp" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-sm">
              Về trang PRO Bootcamp →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Payment page
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <TrackEventOnMount
        event="InitiateCheckout"
        params={{ value: 1497000, currency: 'VND', content_ids: ['msl-bootcamp'], content_name: 'PRO Bootcamp', content_type: 'product' }}
        dedupeKey="checkout_bootcamp"
      />
      <Link href="/bootcamp" className="mb-8 flex items-center gap-2 font-bold text-lg">
        <span className="text-2xl">🧠</span>
        <span className="bg-gradient-to-r from-blue-600 to-violet-700 bg-clip-text text-transparent font-extrabold">
          PRO Bootcamp
        </span>
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <StepDot n="1" label="Đăng ký" done />
        <div className="w-8 h-px bg-slate-300" />
        <StepDot n="2" label="Thanh toán" active />
        <div className="w-8 h-px bg-slate-300" />
        <StepDot n="3" label="Xác nhận suất" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white text-center">
          <div className="text-3xl font-black mb-1">1.497.000đ</div>
          <p className="text-blue-200 text-sm">PRO Bootcamp — 4 tuần · Tối đa 20 người</p>
          {name && <p className="text-white font-semibold text-sm mt-1">Xin chào, {name}! 👋</p>}
        </div>

        <div className="p-6">
          {/* QR Code */}
          <div className="text-center mb-5">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
              Quét QR bằng app ngân hàng bất kỳ
            </p>
            <div className="inline-block rounded-2xl overflow-hidden border-2 border-blue-200 shadow-md" style={{width:240,height:240}}>
              {qrLoaded ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt="QR chuyển khoản PRO" width={240} height={240} className="block" />
              ) : (
                <div className="w-[240px] h-[240px] bg-slate-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Đang tải mã QR...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">Hỗ trợ tất cả ứng dụng ngân hàng Việt Nam</p>
          </div>

          {/* Bank info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 mb-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Thông tin chuyển khoản</p>
            {[
              { label: 'Ngân hàng',     value: 'MB Bank' },
              { label: 'Số tài khoản',  value: BANK.account },
              { label: 'Chủ tài khoản', value: BANK.name },
              { label: 'Số tiền',       value: '1.497.000đ', hl: true },
              { label: 'Nội dung CK',   value: transferContent, hl: true },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 shrink-0">{r.label}:</span>
                <span className={`text-xs font-bold text-right truncate ${r.hl ? 'text-blue-600' : 'text-slate-800'}`}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Important note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              ⚠️ <strong>Nội dung chuyển khoản phải ghi đúng:</strong>{' '}
              <strong className="text-blue-700">{transferContent}</strong>{' '}để hệ thống tự động xác nhận suất.
            </p>
          </div>

          {/* Waiting indicator */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs text-emerald-800 font-semibold">Đang chờ xác nhận thanh toán...</p>
            </div>
            <p className="text-xs text-emerald-700 text-center mt-1">Trang tự động cập nhật khi nhận được tiền</p>
            {pollCount > 0 && (
              <p className="text-xs text-emerald-600 text-center mt-1 font-mono">
                ✓ Đang giám sát #{pollCount}
              </p>
            )}
          </div>

          <a href="tel:0961588227" className="block w-full text-center border border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold py-2.5 rounded-xl transition text-sm">
            Cần hỗ trợ? Gọi 0961 588 227 →
          </a>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 mb-1">Sau khi chuyển khoản, Sơn xác nhận suất trong 2 tiếng</p>
      </div>
    </div>
  )
}

export default function BootcampPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
