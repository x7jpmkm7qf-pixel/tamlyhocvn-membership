'use client'
import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TrackEventOnMount from '@/components/TrackEventOnMount'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️  CẤU HÌNH NGÂN HÀNG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BANK = {
  code:    process.env.NEXT_PUBLIC_BANK_CODE    || 'MB',
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || 'PENDING_MB_ACCOUNT',
  name:    process.env.NEXT_PUBLIC_BANK_NAME    || 'HAN VAN SON',
}

// Product config — keyed by `from` query param.
// transferPrefix distinguishes the 2 products at webhook time so 99k from one
// doesn't accidentally activate the other.
const PRODUCTS = {
  'khau-quyet': {
    amount: 199000,
    amountLabel: '199.000đ',
    productName: 'Khẩu Quyết Phá Phản Đối',
    productSubtitle: 'Bí kíp Ngoại Môn — 10 khẩu quyết',
    sku: 'khauquyet-199k',
    transferPrefix: 'KQ',
  },
  default: {
    amount: 99000,
    amountLabel: '99.000đ',
    productName: 'Mind Sales Lab Membership',
    productSubtitle: 'Gói thành viên Mind Sales Lab — 1 tháng',
    sku: 'msl-register',
    transferPrefix: 'MSL',
  },
} as const

function getVietQR(content: string, amount: number) {
  const p = new URLSearchParams({
    amount:      String(amount),
    addInfo:     content,
    accountName: BANK.name,
  })
  return `https://img.vietqr.io/image/${BANK.code}-${BANK.account}-compact2.jpg?${p}`
}

function StepDot({ n, label, active, done }: {
  n: string; label: string; active?: boolean; done?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        done   ? 'bg-emerald-500 text-white' :
        active ? 'bg-violet-600 text-white'  :
                 'bg-slate-200 text-slate-500'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`text-xs font-semibold ${
        done ? 'text-emerald-600' : active ? 'text-violet-600' : 'text-slate-400'
      }`}>{label}</span>
    </div>
  )
}

function PaymentContent() {
  const params = useSearchParams()
  const router = useRouter()
  const email  = params.get('email') || ''
  const name   = params.get('name')  || ''
  const from   = params.get('from')  || ''
  // Khách đến từ /khau-quyet → sau khi kích hoạt, đưa vào upsell Nội Môn (kèm email để QR upsell tự điền)
  const successRedirect = from === 'khau-quyet'
    ? `/khau-quyet/nang-cap?email=${encodeURIComponent(email)}`
    : '/dashboard'

  const product = from === 'khau-quyet' ? PRODUCTS['khau-quyet'] : PRODUCTS.default
  const productSlug = from === 'khau-quyet' ? 'khau-quyet' : null

  // Normalize email: bỏ @ và . để MB Bank không strip mất ký tự
  // VD: "dolphin@gmail.com" → "dolphingmailcom"
  const emailNorm = email.toLowerCase().replace(/[@.]/g, '')
  const transferContent = `${product.transferPrefix} ${emailNorm}`
  const qrUrl = getVietQR(transferContent, product.amount)

  // ── QR image preload ───────────────────────────────────
  const [qrLoaded, setQrLoaded] = useState(false)
  useEffect(() => {
    if (!email) return
    const img = new Image()
    img.onload  = () => setQrLoaded(true)
    img.onerror = () => setQrLoaded(true) // show anyway on error
    img.src = qrUrl
  }, [qrUrl, email])

  // ── Polling state ──────────────────────────────────────
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'success' | 'already_owned' | 'error'>('waiting')
  const [countdown, setCountdown]         = useState(3)
  const [pollCount, setPollCount]         = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!email) return

    const poll = async () => {
      try {
        setPollCount(c => c + 1)
        const res  = await fetch(`/api/auth/check-status?email=${encodeURIComponent(email)}&expectedAmount=${product.amount}&prefix=${product.transferPrefix}${productSlug ? `&product=${productSlug}` : ''}&t=${Date.now()}`, { cache: 'no-store' })
        const data = await res.json()
        if (data.status === 'active') {
          setPaymentStatus(data.alreadyOwned ? 'already_owned' : 'success')
          // Set flag để /cam-on detect tier="khauquyet"
          try { localStorage.setItem('khauquyet_order_id', email) } catch {}
          if (intervalRef.current) clearInterval(intervalRef.current)

          // Đếm ngược 3 giây rồi redirect
          let count = 3
          setCountdown(count)
          countdownRef.current = setInterval(() => {
            count -= 1
            setCountdown(count)
            if (count <= 0) {
              if (countdownRef.current) clearInterval(countdownRef.current)
              router.push(successRedirect)
            }
          }, 1000)
        }
      } catch {
        // Bỏ qua lỗi mạng tạm thời
      }
    }

    // Poll mỗi 2 giây
    poll() // gọi ngay lần đầu
    intervalRef.current = setInterval(poll, 2000)

    // Khi khách quay lại tab → poll ngay lập tức
    const onVisible = () => { if (document.visibilityState === 'visible') poll() }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (intervalRef.current)  clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [email, router, successRedirect])

  // ── Already owned overlay ──────────────────────────────
  if (paymentStatus === 'already_owned') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden text-center">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-10">
            <div className="text-7xl mb-4">📜</div>
            <h1 className="text-2xl font-black text-white mb-1">Bạn đã sở hữu rồi!</h1>
            <p className="text-amber-100 text-sm">Sản phẩm này đã được kích hoạt trong tài khoản của {name || 'anh/chị'}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 leading-relaxed">
                ✅ <strong>{product.productName}</strong> đã được kích hoạt. Kiểm tra email để nhận tài liệu hoặc đăng nhập để truy cập.
              </p>
            </div>
            <Link href={successRedirect} className="block w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3 rounded-xl transition shadow-md text-sm">
              Đi đến sản phẩm →
            </Link>
            <Link href="/tang-kinh-cac/dashboard" className="block w-full text-center text-slate-500 text-sm hover:text-slate-700 transition">
              Về Tàng Kinh Các →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Success overlay ────────────────────────────────────
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden text-center">

          {/* Success header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-10">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-2xl font-black text-white mb-1">Thanh toán thành công!</h1>
            <p className="text-emerald-100 text-sm">Tài khoản của {name || 'anh/chị'} đã được kích hoạt</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800 leading-relaxed">
                ✅ <strong>Kích hoạt thành công!</strong> Anh/chị đã có thể truy cập
                toàn bộ <strong>18+ kịch bản</strong> và lộ trình 30 ngày.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Tự động chuyển đến trang đăng nhập sau</p>
              <p className="text-3xl font-black text-violet-600">{countdown}s</p>
            </div>

            <Link
              href={successRedirect}
              className="block w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-violet-200 text-sm"
            >
              {from === 'khau-quyet' ? 'Xem ưu đãi nâng cấp Nội Môn →' : 'Vào trang chính ngay →'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Normal payment page ────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">

      <TrackEventOnMount
        event="InitiateCheckout"
        params={{ value: product.amount, currency: 'VND', content_ids: [product.sku], content_name: product.productName, content_type: 'product' }}
        dedupeKey={`checkout_${product.sku}`}
      />

      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-lg">
        <span className="text-2xl">🧠</span>
        <span className="bg-gradient-to-r from-violet-700 to-amber-600 bg-clip-text text-transparent font-extrabold">
          Mind Sales Lab
        </span>
      </Link>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        <StepDot n="1" label="Đăng ký" done />
        <div className="w-8 h-px bg-slate-300" />
        <StepDot n="2" label="Thanh toán" active />
        <div className="w-8 h-px bg-slate-300" />
        <StepDot n="3" label="Kích hoạt" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-5 text-white text-center">
          <div className="text-3xl font-black mb-1">{product.amountLabel}</div>
          <p className="text-violet-200 text-sm">{product.productSubtitle}</p>
          {name && <p className="text-white font-semibold text-sm mt-1">Xin chào, {name}! 👋</p>}
        </div>

        <div className="p-6">

          {/* QR Code */}
          <div className="text-center mb-5">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">
              Quét QR bằng app ngân hàng bất kỳ
            </p>
            <div className="inline-block rounded-2xl overflow-hidden border-2 border-violet-200 shadow-md" style={{width:240,height:240}}>
              {qrLoaded ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrUrl}
                  alt="QR chuyển khoản"
                  width={240}
                  height={240}
                  className="block"
                />
              ) : (
                <div className="w-[240px] h-[240px] bg-slate-100 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Đang tải mã QR...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Hỗ trợ tất cả ứng dụng ngân hàng Việt Nam
            </p>
          </div>

          {/* Bank info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 mb-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
              Thông tin chuyển khoản
            </p>
            {[
              { label: 'Ngân hàng',      value: 'MB Bank' },
              { label: 'Số tài khoản',   value: BANK.account },
              { label: 'Chủ tài khoản',  value: BANK.name },
              { label: 'Số tiền',        value: product.amountLabel, hl: true },
              { label: 'Nội dung CK',    value: transferContent, hl: true },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 shrink-0">{r.label}:</span>
                <span className={`text-xs font-bold text-right truncate ${r.hl ? 'text-violet-600' : 'text-slate-800'}`}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>

          {/* Important note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              ⚠️ <strong>Nội dung chuyển khoản phải ghi đúng:</strong>{' '}
              <strong className="text-violet-700">{transferContent}</strong>
              {' '}để hệ thống tự động kích hoạt tài khoản.
            </p>
          </div>

          {/* Waiting indicator */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs text-emerald-800 font-semibold">
                Đang chờ xác nhận thanh toán...
              </p>
            </div>
            <p className="text-xs text-emerald-700 text-center mt-1">
              Trang sẽ tự động chuyển sau khi nhận được tiền
            </p>
            {pollCount > 0 && (
              <p className="text-xs text-emerald-600 text-center mt-1 font-mono">
                ✓ Đang giám sát #{pollCount} — {email ? email.split('@')[0] : '...'}
              </p>
            )}
          </div>

          <Link
            href="/login"
            className="block w-full text-center border border-violet-300 text-violet-600 hover:bg-violet-50 font-semibold py-2.5 rounded-xl transition text-sm"
          >
            Đã chuyển khoản? Đăng nhập thủ công →
          </Link>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 mb-1">Cần hỗ trợ?</p>
        <a href="tel:0961588227" className="text-sm font-bold text-violet-600 hover:text-violet-700 transition">
          📞 0961 588 227 — Hán Văn Sơn
        </a>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
