'use client'
import { useState } from 'react'
import Link from 'next/link'
import StickyMobileCTA from './StickyMobileCTA'
import { LeadCounterHero, LeadCounterForm } from './LeadCounter'

const ARCHETYPES = [
  {
    icon: '🔬',
    title: 'KHÁCH "PHÂN TÍCH GIA"',
    need: 'Cần dữ liệu, sợ sai lầm',
    summary: 'So sánh từng chi tiết, hỏi rất nhiều câu kỹ thuật, không quyết được nếu thiếu số liệu.',
  },
  {
    icon: '🛡️',
    title: 'KHÁCH "THẬN TRỌNG"',
    need: 'Cần thời gian, sợ áp lực',
    summary: 'Im lặng nhiều, ngại bị thúc, dễ "để em suy nghĩ thêm" và biến mất.',
  },
  {
    icon: '⚡',
    title: 'KHÁCH "QUYẾT NHANH"',
    need: 'Cần urgency, sợ phức tạp',
    summary: 'Thích đi thẳng vào kết quả, ghét nghe giải thích dài, chốt nhanh nếu đúng thời điểm.',
  },
  {
    icon: '🔍',
    title: 'KHÁCH "HOÀI NGHI"',
    need: 'Cần proof, sợ bị lừa',
    summary: 'Hỏi review, hỏi case thật, soi từng lời cam kết. Bán lợi ích không xi-nhê.',
  },
]

const TESTIMONIALS = [
  {
    quote: '"Đọc xong em nhận ra mình đang dùng 1 cách cho mọi khách. Đổi cách theo loại → conversion tăng gấp đôi tuần đầu."',
    name: 'Anh Đức',
    role: 'Sales BĐS',
  },
  {
    quote: '"Tài liệu free mà chất hơn nhiều khoá học 5tr em từng học. Cảm ơn sư phụ."',
    name: 'Chị Linh',
    role: 'Sales mỹ phẩm',
  },
  {
    quote: '"Quiz 5 câu cực hay. Em đã test với 10 khách → đoán đúng 9 loại."',
    name: 'Anh Tuấn',
    role: 'Sales bảo hiểm',
  },
]

const FAQS = [
  {
    q: 'Tại sao miễn phí?',
    a: 'Em muốn anh/chị thử văn phong và chất lượng nội dung của Tàng Kinh Các trước. Nếu hợp, anh/chị có thể tham khảo các bộ chuyên sâu sau. Không hợp cũng không sao — bản đồ này tự nó đã đủ giá trị.',
  },
  {
    q: 'Có bán thông tin email không?',
    a: 'Không. Email của anh/chị chỉ để em gửi PDF và email tuần "Bí Kíp Tàng Kinh Các". Anh/chị unsubscribe bất cứ lúc nào, em không bán cho bên thứ ba.',
  },
  {
    q: 'Nội dung có dùng được không?',
    a: '4 archetype trong bản đồ chính là 4 nhóm khách em đã thấy lặp lại HÀNG NGÀY suốt 3 năm CEO 100 telesale. Mỗi loại có cách tiếp cận khác nhau — anh/chị áp dụng được ngay vào cuộc gọi/tin nhắn kế tiếp.',
  },
  {
    q: 'Khác gì với khoá Khẩu Quyết 199k?',
    a: 'Bản đồ giúp anh/chị HIỂU khách (nhận diện loại + tâm lý gốc). Khẩu Quyết giúp anh/chị XỬ LÝ khách (10 câu mẫu phá 10 phản đối kinh điển). Bổ trợ nhau — đọc Bản đồ trước cho dễ ngấm.',
  },
]

export default function BanDoLandingPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', consent: false })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [consentError, setConsentError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPhoneError('')
    setConsentError('')

    const phoneRegex = /^(0|\+84)[0-9]{9}$/
    if (!phoneRegex.test(form.phone.trim())) {
      setPhoneError('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0 hoặc +84)')
      setLoading(false)
      return
    }

    if (!form.consent) {
      setConsentError('Vui lòng đồng ý điều khoản để tiếp tục')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/leads/ban-do-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone.trim(), consent: form.consent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định')
      setSent(true)
      return
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối, thử lại nhé')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-[#FEF7E6] text-[#1C1917]"
      style={{ fontFamily: '"Be Vietnam Pro", system-ui, -apple-system, sans-serif' }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Noto+Serif:wght@600;700;800&display=swap"
      />

      {/* ============ NAV ============ */}
      <nav className="fixed top-0 w-full bg-[#FEF7E6]/95 backdrop-blur border-b border-[#7C2D12]/15 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <span
              className="font-bold text-[#7C2D12] text-lg"
              style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
            >
              Tàng Kinh Các
            </span>
          </Link>
          <a
            href="#cta-form"
            className="bg-[#7C2D12] text-[#FEF7E6] px-4 sm:px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#5C1A0A] transition"
          >
            Nhận bản đồ →
          </a>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, #7C2D12 0%, transparent 40%), radial-gradient(circle at 70% 80%, #C9A961 0%, transparent 40%)',
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="mb-6">
            <span
              className="inline-block px-4 py-1 border-2 border-[#7C2D12] text-[#7C2D12] text-sm font-bold"
              style={{
                fontFamily: '"Noto Serif", serif',
                letterSpacing: '0.05em',
                transform: 'rotate(-2deg)',
              }}
            >
              📜 TÀNG KINH CÁC — BÍ KÍP MIỄN PHÍ
            </span>
          </div>

          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C1917] leading-tight mb-6"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Bản Đồ 4 Loại Khách Hàng
            <span className="block text-[#7C2D12] mt-2">Sales Việt</span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-700 max-w-2xl mx-auto mb-4 font-medium">
            Hiểu loại khách → Biết chốt đúng cách. Tài liệu{' '}
            <span className="underline decoration-[#C9A961] decoration-2 underline-offset-4">
              MIỄN PHÍ — 20 trang
            </span>
            , đọc trong 30 phút, dùng cả đời.
          </p>

          <p className="text-sm text-stone-600 max-w-xl mx-auto mb-4">
            Phân loại khách hàng theo tâm lý hành vi từ 3 năm CEO 100 telesale + Khoa học hành vi (Cialdini, Kahneman).
          </p>

          <LeadCounterHero />

          {/* 3 bullets */}
          <div className="grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-10 text-left">
            {[
              'Nhận diện 4 archetype khách hàng phổ biến nhất Việt Nam',
              'Hiểu tâm lý gốc đằng sau mỗi loại (khoa học hành vi)',
              '5 câu hỏi quiz tự chẩn đoán loại khách trong 60 giây',
            ].map((b, i) => (
              <div
                key={i}
                className="bg-white/60 border border-[#C9A961]/40 rounded-md p-4 flex gap-2 items-start"
              >
                <span className="text-[#7C2D12] font-bold shrink-0">✓</span>
                <span className="text-sm text-stone-700 leading-relaxed">{b}</span>
              </div>
            ))}
          </div>

          {/* Hero CTA button → scroll to form */}
          <a
            id="hero-cta"
            href="#cta-form"
            className="inline-flex items-center gap-2 bg-[#C9A961] hover:bg-[#A48A4A] text-[#1C1917] px-10 py-4 rounded-md font-bold transition shadow-lg"
          >
            <span>📩 Nhận bản đồ ngay</span>
          </a>
        </div>
      </section>

      <Divider />

      {/* ============ PROBLEM ============ */}
      <section className="py-16 px-4 sm:px-6 bg-[#F5EAD2]/40">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#7C2D12] text-center mb-8"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Vì sao 80% sales chốt sai cách?
          </h2>

          <p className="text-lg text-stone-700 leading-relaxed mb-6">
            Đa số sales dùng <strong>MỘT cách tiếp cận</strong> cho{' '}
            <strong>TẤT CẢ khách hàng</strong>.
          </p>

          <div className="space-y-3 mb-8">
            {[
              { type: 'Phân Tích Gia', need: 'cần dữ liệu', wrong: 'bạn lại nói cảm xúc' },
              { type: 'Quyết Nhanh', need: 'cần urgency', wrong: 'bạn lại giải thích chi tiết' },
              { type: 'Hoài Nghi', need: 'cần proof', wrong: 'bạn lại bán lợi ích' },
            ].map((r, i) => (
              <div
                key={i}
                className="bg-white border-l-4 border-[#7C2D12] p-4 rounded-r-md text-stone-700"
              >
                Khách <strong>&quot;{r.type}&quot;</strong> {r.need} —{' '}
                <span className="text-[#7C2D12]">{r.wrong}</span> → mất deal.
              </div>
            ))}
          </div>

          <div className="bg-[#7C2D12] text-[#FEF7E6] p-6 rounded-md text-center">
            <p className="text-lg leading-relaxed mb-2">
              Không phải sản phẩm bạn tệ. Không phải bạn nói chưa hay.
            </p>
            <p
              className="text-xl sm:text-2xl font-extrabold"
              style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
            >
              Vấn đề: BẠN ĐANG CHỐT SAI LOẠI KHÁCH HÀNG.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* ============ WHAT'S INSIDE ============ */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#7C2D12] text-center mb-3"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Trong Bản Đồ này có gì?
          </h2>
          <p className="text-center text-stone-600 mb-10 max-w-2xl mx-auto">
            4 archetype khách hàng Việt Nam — mỗi loại có chân dung tâm lý, dấu hiệu nhận biết và cách tiếp cận chuyên biệt.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {ARCHETYPES.map((a, i) => (
              <div
                key={i}
                className="bg-white border border-[#C9A961]/40 rounded-lg p-6 hover:border-[#7C2D12]/40 transition"
              >
                <div className="text-4xl mb-3">{a.icon}</div>
                <h3
                  className="text-lg font-bold text-[#1C1917] mb-1"
                  style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
                >
                  {a.title}
                </h3>
                <p className="text-sm text-[#7C2D12] font-semibold mb-3">{a.need}</p>
                <p className="text-sm text-stone-600 leading-relaxed mb-4">{a.summary}</p>
                <span className="inline-block text-xs text-[#7C2D12] font-semibold border border-[#7C2D12]/30 rounded px-2 py-1">
                  Đọc trong PDF →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ============ AUTHORITY ============ */}
      <section className="py-16 px-4 sm:px-6 bg-[#F5EAD2]/40">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#7C2D12] text-center mb-10"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Ai viết bản đồ này?
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/han-van-son-portrait.jpg"
              alt="Hán Văn Sơn"
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-[#C9A961] shadow-lg shrink-0"
            />
            <div className="text-stone-700 leading-relaxed">
              <p className="mb-3">
                <strong
                  className="text-[#7C2D12] text-lg"
                  style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
                >
                  Hán Văn Sơn
                </strong>{' '}
                — Cựu CEO 100 telesale ngành sức khỏe nhập khẩu châu Âu.
              </p>
              <p className="mb-3 text-sm">
                3 năm điều hành, em đã thấy <strong>4 loại khách này lặp lại HÀNG NGÀY</strong> trong hàng triệu phút gọi của 100 nhân viên.
              </p>
              <p className="mb-3 text-sm">
                Sau đó em đào sâu khoa học hành vi (<em>Cialdini, Kahneman, Berridge</em>) để giải mã VÌ SAO 4 loại này hành xử khác nhau.
              </p>
              <p className="text-sm">
                Bản đồ này là chắt lọc <strong>3 năm kinh nghiệm + khoa học gốc</strong> — gói trong 20 trang.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ============ SOCIAL PROOF ============ */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#7C2D12] text-center mb-10"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Đệ tử nói gì sau khi đọc
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-white border border-[#C9A961]/40 rounded-lg p-5"
              >
                <div className="text-[#C9A961] text-3xl leading-none mb-2">&ldquo;</div>
                <p className="text-sm text-stone-700 italic leading-relaxed mb-4">
                  {t.quote.replace(/^"|"$/g, '')}
                </p>
                <p className="text-sm font-bold text-[#7C2D12]">
                  {t.name}
                  <span className="text-stone-500 font-normal"> · {t.role}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ============ WHAT YOU GET ============ */}
      <section className="py-16 px-4 sm:px-6 bg-[#F5EAD2]/40">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#7C2D12] text-center mb-8"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Anh/chị nhận được gì?
          </h2>

          <ul className="space-y-3 mb-6">
            {[
              <span key="1">
                PDF <strong>&quot;Bản Đồ 4 Loại Khách Hàng&quot;</strong> — 20 trang
              </span>,
              <span key="2">
                Quiz <strong>&quot;Đoán loại khách trong 60 giây&quot;</strong> — 5 câu chẩn đoán
              </span>,
              <span key="3">
                <strong>Bảng tổng hợp 1 trang</strong> — in ra dùng khi gọi điện
              </span>,
              <span key="4">
                <strong>BONUS:</strong> Email tuần &quot;Bí Kíp Tàng Kinh Các&quot; — mỗi tuần 1 insight sales psychology
              </span>,
            ].map((node, i) => (
              <li
                key={i}
                className="flex gap-3 items-start bg-white border border-[#C9A961]/30 rounded-md p-4"
              >
                <span className="text-[#7C2D12] font-bold shrink-0">✅</span>
                <span className="text-stone-700 text-sm leading-relaxed">{node}</span>
              </li>
            ))}
          </ul>

          <p className="text-center text-stone-600">
            Tất cả <strong className="text-[#7C2D12]">MIỄN PHÍ</strong> — chỉ cần email.
          </p>
        </div>
      </section>

      {/* ============ FORM (CTA chính) ============ */}
      <section id="cta-form" className="py-16 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-md mx-auto">
          {sent ? (
            <div className="bg-white border-2 border-[#7C2D12] rounded-lg p-6 sm:p-8 shadow-xl text-center">
              <div className="text-5xl mb-4">📩</div>
              <h2 className="text-2xl font-extrabold text-[#7C2D12] mb-3" style={{ fontFamily: '"Noto Serif", Georgia, serif' }}>
                Kiểm tra email ngay!
              </h2>
              <p className="text-sm text-stone-700 leading-relaxed mb-4">
                Em đã gửi link đọc Bản Đồ vào <strong>{form.email}</strong>. Bấm vào link trong email là vào ngay — không cần mật khẩu.
              </p>
              <p className="text-xs text-stone-500">Không thấy email? Kiểm tra hộp thư Spam hoặc Promotions.</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#7C2D12] rounded-lg p-6 sm:p-8 shadow-xl">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📩</div>
                <h2
                  className="text-2xl font-extrabold text-[#7C2D12] mb-2"
                  style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
                >
                  Nhận Bản Đồ Ngay
                </h2>
                <p className="text-sm text-stone-600">
                  Em gửi link đọc bản đồ qua email — bấm 1 lần là vào, không cần nhớ mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Họ và tên *"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#FEF7E6] border border-[#C9A961] rounded-md px-4 py-3 text-sm text-[#1C1917] placeholder-stone-500 focus:outline-none focus:border-[#7C2D12] transition"
                />
                <input
                  type="email"
                  required
                  placeholder="Email của anh/chị *"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-[#FEF7E6] border border-[#C9A961] rounded-md px-4 py-3 text-sm text-[#1C1917] placeholder-stone-500 focus:outline-none focus:border-[#7C2D12] transition"
                />
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại * (VD: 0901234567)"
                    value={form.phone}
                    onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); setPhoneError('') }}
                    className={`w-full bg-[#FEF7E6] border rounded-md px-4 py-3 text-sm text-[#1C1917] placeholder-stone-500 focus:outline-none focus:border-[#7C2D12] transition ${phoneError ? 'border-red-400' : 'border-[#C9A961]'}`}
                  />
                  {phoneError && (
                    <p className="text-red-700 text-xs mt-1 px-1">{phoneError}</p>
                  )}
                  <p className="text-xs text-stone-400 mt-1 px-1">
                    Số điện thoại sẽ được dùng để tư vấn qua Zalo. Chúng tôi không chia sẻ thông tin của bạn cho bên thứ ba.
                  </p>
                </div>

                {error && (
                  <p className="text-red-700 text-xs text-center bg-red-50 border border-red-200 rounded p-2">
                    {error}
                  </p>
                )}

                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => { setForm((f) => ({ ...f, consent: e.target.checked })); setConsentError('') }}
                      className="mt-0.5 shrink-0 accent-[#7C2D12] w-4 h-4"
                    />
                    <span className="text-xs text-stone-600 leading-relaxed">
                      Tôi đồng ý nhận tư vấn qua Zalo/điện thoại từ tamlyhocvn
                    </span>
                  </label>
                  {consentError && (
                    <p className="text-red-700 text-xs mt-1">{consentError}</p>
                  )}
                </div>

                <LeadCounterForm />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7C2D12] hover:bg-[#5C1A0A] disabled:opacity-60 text-[#FEF7E6] font-bold py-4 rounded-md transition text-base shadow-lg"
                >
                  {loading ? 'Đang xử lý...' : '🗝️ NHẬN BẢN ĐỒ VÀ ĐỌC NGAY'}
                </button>
              </form>

              <p className="text-center text-xs text-stone-500 mt-4">
                🔒 Bảo mật. Không spam. Link hiệu lực 7 ngày.
              </p>
            </div>
          )}
        </div>
      </section>

      <Divider />

      {/* ============ FAQ ============ */}
      <section className="py-16 px-4 sm:px-6 bg-[#F5EAD2]/40">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#7C2D12] text-center mb-10"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Câu hỏi thường gặp
          </h2>

          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="bg-white border border-[#C9A961]/40 rounded-md p-5 group"
              >
                <summary
                  className="font-bold text-[#1C1917] cursor-pointer list-none flex justify-between items-center"
                  style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
                >
                  <span>{f.q}</span>
                  <span className="text-[#7C2D12] group-open:rotate-45 transition">+</span>
                </summary>
                <p className="text-sm text-stone-700 mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ============ SOFT CTA → Khẩu Quyết ============ */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#7C2D12] mb-6"
            style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
          >
            Sau khi đọc Bản đồ, anh/chị sẽ thấy...
          </h2>

          <p className="text-stone-700 leading-relaxed mb-3">
            Hiểu được loại khách là <strong>bước 1</strong>.
            Có CÂU TRẢ LỜI cụ thể cho từng phản đối là <strong>bước 2</strong>.
          </p>

          <p className="text-stone-700 leading-relaxed mb-8">
            Nếu anh/chị muốn đi tiếp bước 2 sau khi đọc Bản đồ — em có sẵn{' '}
            <strong className="text-[#7C2D12]">10 Khẩu Quyết Phá Phản Đối</strong>.
          </p>

          <Link
            href="/khau-quyet"
            className="inline-flex items-center gap-2 text-[#7C2D12] hover:text-[#5C1A0A] font-semibold border-b-2 border-[#C9A961] hover:border-[#7C2D12] transition pb-1"
          >
            📜 Tìm hiểu Khẩu Quyết Phá Phản Đối →
          </Link>
        </div>
      </section>

      <StickyMobileCTA />

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[#7C2D12]/15 py-8 px-4 text-center text-xs text-stone-500">
        <p
          className="text-[#7C2D12] font-bold mb-1"
          style={{ fontFamily: '"Noto Serif", Georgia, serif' }}
        >
          📜 TÀNG KINH CÁC
        </p>
        <p>tamlyhocvn.club — Hán Văn Sơn</p>
      </footer>
    </div>
  )
}

function Divider() {
  return (
    <div
      className="h-[2px] max-w-2xl mx-auto opacity-30"
      style={{
        background:
          'linear-gradient(90deg, transparent, #7C2D12 20%, #7C2D12 80%, transparent)',
      }}
    />
  )
}
