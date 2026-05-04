'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const INDUSTRIES = ['Bất động sản', 'Bảo hiểm nhân thọ', 'Mỹ phẩm / Làm đẹp', 'Thực phẩm chức năng', 'Xe hơi', 'Tài chính / Ngân hàng', 'Xây dựng / Nội thất', 'Khác']

const STACK = [
  { icon: '🎯', name: '8 Buổi Zoom 1:1 Với Sơn (90 ngày)', desc: '60 phút/buổi — 2 tuần 1 lần. Sơn tập trung 100% vào tình huống thực tế của anh/chị, không có ai khác trong phòng.', value: '24.000.000đ' },
  { icon: '📝', name: 'Custom Script Library — Kịch Bản Độc Quyền', desc: 'Sơn viết riêng 10-15 kịch bản cho đúng ngành, đúng tình huống của anh/chị. Không phải template dùng chung — đây là vũ khí chỉ anh/chị có.', value: '8.000.000đ' },
  { icon: '🎤', name: 'Sales Call Audit — 5 Buổi Review Thực Chiến', desc: 'Ghi âm cuộc gọi hoặc chụp màn hình tin nhắn thật → Sơn phân tích từng điểm yếu, chỉ ra chính xác cần thay đổi gì.', value: '5.000.000đ' },
  { icon: '💬', name: 'Zalo/WhatsApp Direct Access (90 ngày)', desc: 'Hỏi bất cứ lúc nào — gặp tình huống khó với khách, nhắn ngay cho Sơn. Phản hồi trong 4h trong giờ làm việc.', value: '4.000.000đ' },
  { icon: '🚀', name: 'Mind Sales Lab PRO Membership (6 tháng)', desc: 'Truy cập toàn bộ nội dung PRO trong suốt hành trình đồng hành 6 tháng.', value: '1.800.000đ' },
  { icon: '⚡', name: '"Tăng Tốc 30 Ngày" Sprint (Fast-Action)', desc: 'Tuần đầu tiên: Sơn audit toàn bộ approach hiện tại và đưa ra battle plan chi tiết. Chỉ 5 người đầu tiên mỗi tháng.', value: '4.500.000đ' },
]

const JOURNEY = [
  { phase: 'Tuần 1-2', title: 'Audit & Battle Plan', desc: 'Sơn phân tích toàn bộ cách anh/chị đang bán — từ cách tiếp cận đến cách xử lý từ chối. Đưa ra roadmap cá nhân 90 ngày.' },
  { phase: 'Tuần 3-6', title: 'Xây Hệ Thống Cốt Lõi', desc: 'Viết custom scripts cho ngành. Review call thực chiến. Anh/chị áp dụng → Sơn điều chỉnh theo phản hồi thực tế.' },
  { phase: 'Tuần 7-10', title: 'Tối Ưu & Nhân Rộng', desc: 'Tinh chỉnh những gì đang hoạt động tốt. Xây thêm kịch bản cho các tình huống phức tạp hơn.' },
  { phase: 'Tuần 11-12', title: 'Hệ Thống Hoàn Chỉnh', desc: 'Tổng kết toàn bộ playbook cá nhân. Anh/chị có 1 hệ thống bán hàng độc lập, không cần phụ thuộc vào ai nữa.' },
]

const FAQS = [
  { q: 'Ai phù hợp với chương trình này?', a: 'Nhân viên sales ngành BĐS/bảo hiểm muốn vào top 10%. Chủ doanh nghiệp SME muốn xây team sales bài bản. Người vừa chuyển sang bán hàng và muốn có hệ thống từ đầu thật nhanh.' },
  { q: 'Sơn có nhận tất cả mọi người không?', a: 'Không. Sơn chỉ nhận tối đa 5 người/tháng để đảm bảo chất lượng đồng hành. Sau khi anh/chị điền form, Sơn sẽ liên hệ trong 24h để trao đổi ngắn 15 phút — xem có phù hợp không trước khi xác nhận.' },
  { q: 'Có thể học nếu chưa có kinh nghiệm bán hàng không?', a: 'Được. Thực ra người chưa có kinh nghiệm đôi khi tiến bộ nhanh hơn vì không có thói quen xấu cần phải sửa. Quan trọng là anh/chị cam kết thực hành.' },
  { q: 'Nếu không cải thiện thì sao?', a: 'Nếu sau 90 ngày đồng hành đầy đủ (8 buổi, đủ bài tập), anh/chị không thấy sự thay đổi rõ ràng — Sơn đồng hành thêm 30 ngày hoàn toàn miễn phí. Không điều kiện.' },
  { q: 'Thanh toán như thế nào?', a: 'Sau buổi trao đổi 15 phút, nếu hai bên phù hợp, Sơn sẽ gửi thông tin thanh toán. Có thể trả 1 lần (6.997k) hoặc chia 3 đợt. Sơn linh hoạt theo từng trường hợp.' },
]

export default function MentoringPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', industry: '',
    experience: '', currentProblem: '', goal: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.industry || !form.currentProblem || !form.goal) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/apply/mentoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
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
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-violet-50 pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            🏆 Tối đa 5 người/tháng — Cần ứng tuyển
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight text-slate-900">
            Sơn Ngồi Cạnh Anh/Chị{' '}
            <span className="bg-gradient-to-r from-amber-500 to-violet-600 bg-clip-text text-transparent">
              Xây Hệ Thống
            </span>
            <br />Bán Hàng Riêng Cho Anh/Chị
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Không phải học từ Sơn. Sơn đồng hành 90 ngày — viết kịch bản cho đúng ngành,
            review call thực chiến, hỏi được bất cứ lúc nào. Kết quả: hệ thống bán hàng
            riêng mà chỉ anh/chị có.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base px-8 py-4 rounded-2xl transition shadow-xl shadow-amber-200"
            >
              Ứng tuyển ngay — 6.997.000đ
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <p className="text-xs text-slate-400">
            ✓ Chỉ 5 suất/tháng &nbsp;·&nbsp;
            ✓ Trao đổi 15 phút trước khi xác nhận &nbsp;·&nbsp;
            ✓ Đồng hành thêm 30 ngày miễn phí nếu không thấy kết quả
          </p>
        </div>
      </section>

      {/* ── FOR WHOM ── */}
      <section className="bg-white border-y border-slate-200 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">Chương trình này dành cho ai?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: '🏠', title: 'Sales chuyên nghiệp', desc: 'Đang làm BĐS / Bảo hiểm / Xe hơi và muốn vào top 10% thu nhập ngành.' },
              { emoji: '🏢', title: 'Chủ doanh nghiệp', desc: 'Muốn xây team sales bài bản hoặc tự mình bán tốt hơn để công ty tăng trưởng.' },
              { emoji: '🚀', title: 'Người mới chuyển ngành', desc: 'Vừa bước vào bán hàng và muốn xây hệ thống đúng ngay từ đầu, không mày mò mất thời gian.' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="font-bold text-slate-900 text-sm mb-1.5">{item.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFER STACK ── */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-2">Tất cả anh/chị nhận được</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Offer Stack 1:1 Mentoring</h2>
        </div>
        <div className="space-y-3 mb-8">
          {STACK.map((item, i) => (
            <div key={i} className={`flex items-start gap-4 bg-slate-50 border rounded-xl p-4 ${i === 5 ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
              <div className="text-2xl shrink-0">{item.icon}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-slate-900 text-sm">
                    {i === 5 && <span className="text-amber-600 text-xs font-bold mr-1">⚡ FAST-ACTION —</span>}
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
        <div className="bg-gradient-to-r from-amber-500 to-violet-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-amber-200 text-xs mb-1">Tổng giá trị nhận được</p>
              <p className="text-2xl font-black line-through text-amber-300">47.300.000đ</p>
            </div>
            <div className="text-center">
              <p className="text-amber-200 text-xs mb-1">Tiết kiệm</p>
              <p className="text-2xl font-black text-white">85% OFF</p>
            </div>
            <div className="text-right">
              <p className="text-amber-200 text-xs mb-1">Giá đầu tư</p>
              <p className="text-3xl font-black">6.997.000đ</p>
              <p className="text-amber-200 text-xs">hoặc 3 × 2.497.000đ</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 90-DAY JOURNEY ── */}
      <section className="bg-white border-y border-slate-100 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-2">Hành trình 90 ngày</p>
            <h2 className="text-2xl font-extrabold text-slate-900">Từng giai đoạn được lên kế hoạch rõ ràng</h2>
          </div>
          <div className="space-y-4">
            {JOURNEY.map((j, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center font-black text-amber-700 text-xs shrink-0">{i + 1}</div>
                <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{j.phase}</span>
                    <p className="font-bold text-slate-900 text-sm">{j.title}</p>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{j.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="py-12 px-4 max-w-2xl mx-auto text-center">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Cam Kết Đột Phá Hoặc Làm Tiếp Miễn Phí</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Nếu sau 90 ngày đồng hành đầy đủ, anh/chị không thấy có sự thay đổi rõ ràng trong kỹ năng
            và kết quả bán hàng — Sơn sẽ tiếp tục đồng hành thêm <strong>30 ngày hoàn toàn miễn phí</strong>.
            Không câu hỏi, không điều kiện.
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

      {/* ── APPLICATION FORM ── */}
      <section id="apply" className="py-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-2">Ứng tuyển</p>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Còn <span className="text-amber-600">5 suất</span> tháng này
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Điền form dưới đây. Sơn sẽ liên hệ trong 24h để trao đổi 15 phút
              — xem hai bên có phù hợp không trước khi xác nhận.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-black text-emerald-800 mb-2">Nhận được rồi!</h3>
              <p className="text-emerald-700 text-sm leading-relaxed mb-2">
                Sơn sẽ liên hệ với <strong>{form.name}</strong> trong vòng 24h qua số điện thoại <strong>{form.phone}</strong> để trao đổi ngắn 15 phút.
              </p>
              <p className="text-xs text-emerald-600">
                Vui lòng để ý điện thoại. Nếu sau 24h chưa thấy liên hệ, gọi trực tiếp: 0961 588 227
              </p>
            </div>
          ) : (
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
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0901 234 567"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
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
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngành đang bán <span className="text-red-500">*</span></label>
                  <select
                    value={form.industry}
                    onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-white"
                  >
                    <option value="">Chọn ngành...</option>
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kinh nghiệm bán hàng</label>
                  <select
                    value={form.experience}
                    onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition bg-white"
                  >
                    <option value="">Chọn...</option>
                    <option value="Chưa có kinh nghiệm">Chưa có kinh nghiệm</option>
                    <option value="Dưới 1 năm">Dưới 1 năm</option>
                    <option value="1-3 năm">1-3 năm</option>
                    <option value="3-5 năm">3-5 năm</option>
                    <option value="Trên 5 năm">Trên 5 năm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vấn đề lớn nhất anh/chị đang gặp trong bán hàng <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.currentProblem}
                  onChange={e => setForm(f => ({ ...f, currentProblem: e.target.value }))}
                  placeholder="Mô tả cụ thể tình huống anh/chị hay bị mắc kẹt nhất..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mục tiêu anh/chị muốn đạt được sau 90 ngày <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.goal}
                  onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                  placeholder="Ví dụ: Tăng tỷ lệ chốt từ 20% lên 40%. Hay: Đạt 50 triệu/tháng commission..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-black text-base py-4 rounded-xl transition shadow-lg shadow-amber-200"
              >
                {loading ? 'Đang gửi...' : 'Nộp Đơn Ứng Tuyển →'}
              </button>

              <p className="text-xs text-slate-400 text-center">
                Sơn sẽ liên hệ trong 24h để trao đổi 15 phút. Không có áp lực — nếu không phù hợp, Sơn sẽ gợi ý lựa chọn khác phù hợp hơn.
              </p>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 mb-1">Hoặc liên hệ trực tiếp</p>
            <a href="tel:0961588227" className="text-sm font-bold text-violet-600">📞 0961 588 227 — Hán Văn Sơn</a>
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-4 text-center">
        <p className="text-xs text-slate-400 mb-2">© 2025 Mind Sales Lab · Hán Văn Sơn · tamlyhocvn.club</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="text-xs text-slate-400 hover:text-violet-600 transition">Trang chủ</Link>
          <Link href="/bootcamp" className="text-xs text-slate-400 hover:text-violet-600 transition">PRO Bootcamp</Link>
          <a href="tel:0961588227" className="text-xs text-violet-600 font-bold">📞 0961 588 227</a>
        </div>
      </footer>
    </div>
  )
}
