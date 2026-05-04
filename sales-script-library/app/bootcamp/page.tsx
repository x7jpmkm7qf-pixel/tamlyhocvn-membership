'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const INDUSTRIES = ['Bất động sản', 'Bảo hiểm nhân thọ', 'Mỹ phẩm / Làm đẹp', 'Thực phẩm chức năng', 'Xe hơi', 'Tài chính / Ngân hàng', 'Khác']

const STACK = [
  { icon: '🎓', name: '4 Buổi Live Zoom Với Sơn', desc: '90 phút/buổi — hỏi đáp thực tế, phân tích tình huống của anh/chị', value: '6.000.000đ' },
  { icon: '📋', name: 'Kịch Bản Theo Ngành Custom Pack', desc: '30 kịch bản được Sơn điều chỉnh riêng cho ngành anh/chị đang bán', value: '1.500.000đ' },
  { icon: '🎤', name: 'Roleplay & Review Recording', desc: 'Ghi âm thực hành → Sơn review từng điểm yếu, hướng dẫn cách sửa', value: '2.000.000đ' },
  { icon: '💬', name: 'Private Telegram Group (6 tháng)', desc: 'Cộng đồng PRO — hỏi đáp nhanh, chia sẻ kịch bản, accountability', value: '1.200.000đ' },
  { icon: '⚡', name: 'Tư Vấn Riêng 30 Phút (Fast-Action)', desc: 'Đặt lịch 1:1 với Sơn — chỉ 10 người đăng ký đầu tiên mỗi cohort', value: '1.500.000đ' },
]

const WEEKS = [
  { week: 'Tuần 1', theme: 'Tâm lý học kết nối — Đọc người mua trong 5 phút đầu', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { week: 'Tuần 2', theme: 'Xây dựng niềm tin & uy tín — Kỹ thuật social proof thực chiến', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { week: 'Tuần 3', theme: 'Xử lý từ chối bằng khoa học — Không cãi, không ép', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { week: 'Tuần 4', theme: 'Chốt sale & tái kích hoạt khách cũ — Hệ thống follow-up', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
]

const FAQS = [
  { q: 'Bootcamp học online hay offline?', a: 'Hoàn toàn online qua Zoom. Anh/chị có thể tham gia từ bất kỳ đâu. Toàn bộ buổi học được record lại để xem lại.' },
  { q: 'Nếu không tham dự được 1 buổi live thì sao?', a: 'Anh/chị xem recording và gửi câu hỏi qua Telegram — Sơn sẽ trả lời trong nhóm hoặc video riêng.' },
  { q: 'Khác gì so với gói 99k?', a: 'Gói 99k là tự học với kịch bản có sẵn. PRO Bootcamp có Sơn hướng dẫn trực tiếp, feedback bài tập cá nhân, roleplay thực chiến — học có người đồng hành tốt hơn học một mình.' },
  { q: 'Cohort khai giảng ngày nào?', a: 'Ngày 01 hàng tháng. Đóng nhận đăng ký ngày 28 tháng trước. Anh/chị đăng ký ngay để giữ suất — tối đa 20 người/cohort.' },
  { q: 'Có hoàn tiền không?', a: 'Hoàn tiền 100% nếu sau khi hoàn thành đủ 4 tuần và nộp đủ bài tập, anh/chị không thấy sự cải thiện rõ ràng — không hỏi lý do.' },
]

export default function BootcampPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', industry: '', note: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.industry) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/apply/bootcamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        // Redirect sang trang QR thanh toán
        const params = new URLSearchParams({ name: form.name, email: form.email })
        router.push(`/bootcamp/payment?${params}`)
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ 0961 588 227.')
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ 0961 588 227.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50 pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            🎓 Cohort-based — Tối đa 20 người/tháng
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight text-slate-900">
            Học Bán Hàng Có{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Thầy Đồng Hành
            </span>
            <br />Không Phải Học Một Mình
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            4 tuần live với Sơn · Feedback cá nhân từng bài tập · Kịch bản theo đúng ngành của anh/chị.
            Tăng tỷ lệ chốt sale ít nhất 30% — hoặc hoàn tiền 100%.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <a
              href="#register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-4 rounded-2xl transition shadow-xl shadow-blue-200"
            >
              Đăng ký giữ suất — 1.497.000đ
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <p className="text-xs text-slate-400">
            ✓ Tối đa 20 người/cohort &nbsp;·&nbsp;
            ✓ Khai giảng ngày 01 hàng tháng &nbsp;·&nbsp;
            ✓ Hoàn tiền 100% nếu không hài lòng
          </p>
        </div>
      </section>

      {/* ── SO SÁNH vs 99k ── */}
      <section className="bg-white border-y border-slate-200 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">PRO Bootcamp khác gì gói 99k?</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Gói 99k/tháng', points: ['Tự học theo lộ trình', 'Kịch bản có sẵn dùng chung', 'Không có feedback cá nhân', 'Học một mình'], muted: true },
              { label: 'PRO Bootcamp', points: ['Sơn hướng dẫn trực tiếp', 'Kịch bản theo đúng ngành của anh/chị', 'Feedback từng bài tập trong 24h', 'Cùng 20 người cùng mục tiêu'], muted: false },
            ].map((col, i) => (
              <div key={i} className={`rounded-2xl p-5 border ${col.muted ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`font-bold text-sm mb-3 ${col.muted ? 'text-slate-500' : 'text-blue-700'}`}>{col.label}</p>
                <ul className="space-y-2">
                  {col.points.map((p, j) => (
                    <li key={j} className={`text-xs flex items-start gap-1.5 ${col.muted ? 'text-slate-400' : 'text-slate-700'}`}>
                      <span>{col.muted ? '○' : '✓'}</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4-WEEK ROADMAP ── */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">Chương trình 4 tuần</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Mỗi tuần 1 bước đột phá rõ ràng</h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {WEEKS.map((w, i) => (
            <div key={i} className={`flex items-start gap-4 px-5 py-4 border-b last:border-0 ${w.color} border`}>
              <div className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">{i + 1}</div>
              <div>
                <p className="font-black text-sm">{w.week}</p>
                <p className="text-sm opacity-80 leading-snug">{w.theme}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OFFER STACK ── */}
      <section className="bg-white border-y border-slate-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">Tất cả anh/chị nhận được</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Offer Stack PRO Bootcamp</h2>
          </div>
          <div className="space-y-3 mb-8">
            {STACK.map((item, i) => (
              <div key={i} className={`flex items-start gap-4 bg-slate-50 border rounded-xl p-4 ${i === 4 ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
                <div className="text-2xl shrink-0">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-900 text-sm">
                      {i === 4 && <span className="text-amber-600 text-xs font-bold mr-1">⚡ FAST-ACTION BONUS —</span>}
                      {item.name}
                    </p>
                    <span className="text-xs font-bold text-emerald-600 shrink-0">Trị giá {item.value}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Value summary */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-blue-200 text-xs mb-1">Tổng giá trị nhận được</p>
                <p className="text-2xl font-black line-through text-blue-300">12.200.000đ</p>
              </div>
              <div className="text-center">
                <p className="text-blue-200 text-xs mb-1">Tiết kiệm</p>
                <p className="text-2xl font-black text-amber-300">88% OFF</p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-xs mb-1">Giá đầu tư hôm nay</p>
                <p className="text-3xl font-black">1.497.000đ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="py-12 px-4 max-w-2xl mx-auto text-center">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Cam Kết Kết Quả 30 Ngày</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Nếu sau khi hoàn thành đủ 4 tuần bootcamp và nộp đủ bài tập, anh/chị không thấy
            có sự cải thiện rõ ràng trong kỹ năng bán hàng — hoàn tiền <strong>100%</strong>, không hỏi lý do.
            Anh/chị không thể thua trong tình huống này.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-slate-100 border-t border-slate-200 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-extrabold text-slate-900 text-center mb-6">Câu hỏi thường gặp</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <p className="font-bold text-slate-900 text-sm mb-1.5">{faq.q}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTER FORM ── */}
      <section id="register" className="py-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">Đăng ký giữ suất</p>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Cohort tháng tới — Còn <span className="text-blue-600">20 suất</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">Điền thông tin bên dưới — hệ thống sẽ tạo mã QR thanh toán ngay lập tức.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ & tên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0901 234 567"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngành đang bán <span className="text-red-500">*</span></label>
                <select
                  value={form.industry}
                  onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-white"
                >
                  <option value="">Chọn ngành...</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vấn đề lớn nhất hiện tại (không bắt buộc)</label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Ví dụ: Bị khách nói đắt quá, không biết xử lý. Hay: Follow-up hoài mà khách không phản hồi..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-base py-4 rounded-xl transition shadow-lg shadow-blue-200"
              >
                {loading ? 'Đang gửi...' : 'Đăng Ký Giữ Suất — 1.497.000đ →'}
              </button>

              <p className="text-xs text-slate-400 text-center">
                Sau khi điền form, hệ thống tạo mã QR ngay — quét và thanh toán, suất tự động xác nhận.
              </p>
            </form>
        </div>
      </section>

      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-4 text-center">
        <p className="text-xs text-slate-400 mb-2">© 2025 Mind Sales Lab · Hán Văn Sơn · tamlyhocvn.club</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="text-xs text-slate-400 hover:text-violet-600 transition">Trang chủ</Link>
          <Link href="/mentoring" className="text-xs text-slate-400 hover:text-violet-600 transition">1:1 Mentoring</Link>
          <a href="tel:0961588227" className="text-xs text-violet-600 font-bold">📞 0961 588 227</a>
        </div>
      </footer>
    </div>
  )
}
