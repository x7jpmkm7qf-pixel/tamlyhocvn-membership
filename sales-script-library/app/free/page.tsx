'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function FreeScriptsPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ name: '', email: '', phone: '', industry: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/leads/free', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lỗi không xác định')
      router.push(`/free/download?name=${encodeURIComponent(form.name)}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối, thử lại nhé')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* Nav */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <span className="bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent font-extrabold text-sm">
            Mind Sales Lab
          </span>
        </Link>
        <span className="text-xs text-slate-500">Tài liệu miễn phí</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
            🎁 Miễn phí — 100%
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-black text-center leading-tight mb-4">
          3 Kịch Bản Chốt Đơn{' '}
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Cấp Tốc
          </span>
          <br />Khi Khách Sắp Bỏ Đi
        </h1>

        <p className="text-slate-400 text-center text-base mb-8 leading-relaxed">
          Word-for-word scripts đã được kiểm chứng bởi <strong className="text-white">500+ sales VN</strong> —
          xử lý 3 objection phổ biến nhất mà không cần giảm giá, không cần van xin khách.
        </p>

        {/* What you get */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Anh/chị sẽ nhận được:</p>
          <div className="space-y-3">
            {[
              { icon: '💬', title: 'Kịch Bản 1:', desc: 'Xử lý "Để suy nghĩ thêm" — câu cửa miệng phổ biến nhất của khách' },
              { icon: '💰', title: 'Kịch Bản 2:', desc: 'Xử lý "Đắt quá" — reframe giá trị không cần giảm xu nào' },
              { icon: '👫', title: 'Kịch Bản 3:', desc: 'Xử lý "Cần hỏi vợ/chồng" — include người quyết định ngay tại chỗ' },
              { icon: '🧠', title: 'Bonus:', desc: 'Giải thích tâm lý học đằng sau mỗi câu — hiểu WHY để tự biến tấu' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <span className="text-amber-400 font-bold text-sm">{item.title}</span>
                  <span className="text-slate-300 text-sm ml-1">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof mini */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { stat: '500+', label: 'Sales đang dùng' },
            { stat: '3×',   label: 'Tỷ lệ chốt tăng' },
            { stat: '0đ',   label: 'Chi phí hôm nay' },
          ].map((s, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-amber-400">{s.stat}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Opt-in Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
          <p className="text-center font-bold text-white mb-1">Nhận 3 kịch bản ngay — miễn phí</p>
          <p className="text-center text-xs text-slate-400 mb-5">Điền thông tin bên dưới, truy cập ngay lập tức</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Họ và tên *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
            />
            <input
              type="email"
              required
              placeholder="Email của anh/chị *"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
            />
            <input
              type="tel"
              placeholder="Số điện thoại (để Sơn hỗ trợ thêm)"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
            />

            <div>
              <select
                value={form.industry}
                onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition appearance-none"
              >
                <option value="">— Anh/chị đang sales ngành gì? (giúp tư vấn đúng) —</option>
                <option value="Bất động sản">🏢 Bất động sản</option>
                <option value="Bảo hiểm">🛡 Bảo hiểm</option>
                <option value="Mỹ phẩm">💄 Mỹ phẩm / Skincare</option>
                <option value="Thực phẩm chức năng">💊 Thực phẩm chức năng / Dược</option>
                <option value="F&B / Nhà hàng">🍽 F&B / Nhà hàng / Cà phê</option>
                <option value="Ô tô">🚗 Ô tô / Xe máy</option>
                <option value="Tài chính / Ngân hàng">💰 Tài chính / Ngân hàng / Vay</option>
                <option value="Giáo dục / Khóa học">📚 Giáo dục / Khóa học</option>
                <option value="Du lịch / Khách sạn">✈️ Du lịch / Khách sạn</option>
                <option value="Coaching / Tư vấn">🎯 Coaching / Tư vấn</option>
                <option value="Bán lẻ online (Shopee, Tiki...)">🛒 Bán lẻ online (Shopee, Tiki, FB)</option>
                <option value="MLM / Đa cấp">🔄 MLM / Đa cấp</option>
                <option value="B2B / Doanh nghiệp">🏭 B2B / Doanh nghiệp</option>
                <option value="Khác">❓ Khác (Sơn sẽ tư vấn riêng)</option>
              </select>
              {form.industry === 'Khác' && (
                <input
                  type="text"
                  placeholder="Mô tả ngắn ngành của anh/chị..."
                  onChange={e => setForm(f => ({ ...f, industry: 'Khác — ' + e.target.value }))}
                  className="mt-2 w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
                />
              )}
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-white font-black py-4 rounded-xl transition text-base shadow-lg shadow-amber-900/30"
            >
              {loading ? 'Đang xử lý...' : '🎁 Gửi Tôi 3 Kịch Bản Ngay →'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-3">
            🔒 Không spam. Không bán thông tin. Hủy bất kỳ lúc nào.
          </p>
        </div>

        {/* Mini testimonials */}
        <div className="space-y-3 mb-8">
          {[
            {
              quote: '"Dùng kịch bản số 1 xong, khách hàng chốt luôn tại cuộc họp — khỏi cần follow up."',
              name: 'Minh T.',
              role: 'Sales bảo hiểm Hà Nội',
            },
            {
              quote: '"Kỹ thuật xử lý giá mà không giảm xu nào — game changer cho mảng BĐS của em."',
              name: 'Hương N.',
              role: 'Môi giới bất động sản TP.HCM',
            },
          ].map((t, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
              <p className="text-slate-300 text-sm italic leading-relaxed mb-2">{t.quote}</p>
              <p className="text-amber-400 text-xs font-bold">{t.name} · <span className="text-slate-500 font-normal">{t.role}</span></p>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-gradient-to-br from-violet-900/40 to-slate-800/40 border border-violet-800/40 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Tài liệu này được tổng hợp từ kinh nghiệm thực chiến của{' '}
            <strong className="text-white">Hán Văn Sơn</strong> — người đã đào tạo
            500+ sales professionals trên toàn quốc qua nền tảng{' '}
            <strong className="text-violet-400">Mind Sales Lab</strong>.
          </p>
        </div>

      </div>
    </div>
  )
}
