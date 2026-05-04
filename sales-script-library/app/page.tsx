'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const BENEFITS = [
  {
    icon: '📚',
    title: '18+ Kịch Bản Sales Thực Chiến',
    desc: 'Kịch bản theo từng ngành: BĐS, bảo hiểm, mỹ phẩm, F&B — được viết dựa trên tâm lý học hành vi.',
  },
  {
    icon: '🗺️',
    title: 'Lộ Trình 30 Ngày Bài Bản',
    desc: 'Mỗi ngày 1 bài học tâm lý + 1 bài tập thực hành. Sau 30 ngày bạn sẽ có nền tảng vững chắc.',
  },
  {
    icon: '✅',
    title: 'Bài Tập Hằng Ngày Có Check-in',
    desc: 'Theo dõi tiến độ, ghi nhận streak, nhận badge hoàn thành — giúp bạn duy trì kỷ luật thực hành.',
  },
  {
    icon: '🧠',
    title: 'Phân Tích Tâm Lý Học Chuyên Sâu',
    desc: 'Mỗi kịch bản đi kèm phân tích nguyên tắc tâm lý nào đang được áp dụng và tại sao nó hoạt động.',
  },
  {
    icon: '💬',
    title: 'Tin Nhắn Mẫu Đa Nền Tảng',
    desc: 'Template cho Zalo, Facebook Messenger và giao tiếp trực tiếp — copy & paste, điều chỉnh và dùng ngay.',
  },
  {
    icon: '🔄',
    title: 'Cập Nhật Liên Tục',
    desc: 'Kịch bản mới được thêm thường xuyên. Một lần đăng ký, nhận mãi nội dung mới nhất.',
  },
]

const PREVIEWS = [
  { title: 'Kịch Bản Phá Băng Khách Im Lặng — BĐS', tag: 'Bất động sản', color: 'bg-blue-100 text-blue-700' },
  { title: 'Xử Lý "Đắt Quá" Trong Bảo Hiểm Nhân Thọ', tag: 'Bảo hiểm', color: 'bg-emerald-100 text-emerald-700' },
  { title: 'Follow-up Không Làm Phiền — Mỹ Phẩm', tag: 'Mỹ phẩm', color: 'bg-pink-100 text-pink-700' },
  { title: 'Chốt Sale Cuối Tháng — Tạo Cảm Giác Khan Hiếm', tag: 'Chốt sale', color: 'bg-violet-100 text-violet-700' },
  { title: 'Kịch Bản Gọi Điện Cold Call Không Bị Cúp Máy', tag: 'F&B', color: 'bg-orange-100 text-orange-700' },
  { title: 'Phục Hồi Khách Hàng Đã Từ Chối', tag: 'Từ chối', color: 'bg-red-100 text-red-700' },
]

const FAQS = [
  {
    q: 'Sau khi chuyển khoản, tôi truy cập ngay được không?',
    a: 'Có! Hệ thống tự động kích hoạt tài khoản ngay sau khi nhận được chuyển khoản — không cần chờ Admin duyệt. Bạn có thể đăng nhập và sử dụng ngay lập tức.',
  },
  {
    q: 'Nội dung dành cho ai?',
    a: 'Dành cho nhân viên kinh doanh, freelancer, chủ shop, nhân viên bảo hiểm/BĐS — bất kỳ ai cần thuyết phục người khác để tạo ra doanh thu.',
  },
  {
    q: 'Tôi có thể hủy bất cứ lúc nào không?',
    a: 'Gói 99k là theo tháng, không tự động gia hạn. Bạn có thể chọn không gia hạn khi hết hạn mà không cần thông báo.',
  },
  {
    q: 'Có bảo hành không?',
    a: 'Nếu trong 7 ngày đầu bạn không hài lòng, liên hệ trực tiếp với Admin để được hoàn tiền 100% — không hỏi lý do.',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [session, setSession] = useState<{ member: { name: string } | null; isAdmin: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      setSession(data)
      if (data.member || data.isAdmin) router.push('/dashboard')
    })
  }, [])

  // Show minimal loading while checking auth
  if (session === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── HERO ─────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-amber-50 pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            🧠 Tâm lý học ứng dụng trong bán hàng
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight text-slate-900">
            Tại Sao Khách Nói{' '}
            <span className="bg-gradient-to-r from-violet-700 to-amber-500 bg-clip-text text-transparent">
              "Để Suy Nghĩ Thêm"
            </span>
            <br />
            Và Cách Chốt Họ Ngay Hôm Đó
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            18+ kịch bản sales thực chiến + lộ trình 30 ngày xây dựng trên tâm lý học hành vi.
            Copy &amp; paste, áp dụng ngay từ ngày mai — không cần kinh nghiệm.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-base px-8 py-4 rounded-2xl transition shadow-xl shadow-violet-200"
            >
              Đăng ký ngay — 99.000đ/tháng
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 font-semibold text-sm px-6 py-4 transition"
            >
              Đã có tài khoản? Đăng nhập →
            </Link>
          </div>

          <p className="text-xs text-slate-400">✓ Kích hoạt tức thì sau thanh toán &nbsp;·&nbsp; ✓ Hoàn tiền 7 ngày nếu không hài lòng &nbsp;·&nbsp; ✓ Không tự động gia hạn</p>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────── */}
      <section className="bg-white border-y border-slate-200 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-violet-600 font-black text-lg">500+</span> thành viên đang học
          </div>
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-violet-600 font-black text-lg">18+</span> kịch bản thực chiến
          </div>
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-amber-500 font-black text-lg">30</span> ngày lộ trình có bài tập
          </div>
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-rose-500 font-black text-lg">99k</span> /tháng
          </div>
        </div>
      </section>

      {/* ── WHAT'S INSIDE (PREVIEW LOCKED) ───── */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-violet-600 font-bold uppercase tracking-widest mb-2">Bên trong cộng đồng</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Kịch bản sales được xây dựng bài bản
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
            Mỗi kịch bản có phân tích tâm lý, ví dụ áp dụng và tin nhắn mẫu sẵn dùng
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {PREVIEWS.map((item, i) => (
            <div key={i} className="relative bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden">
              {/* Lock overlay */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-2xl">
                <span className="text-2xl mb-1">🔒</span>
                <span className="text-xs font-bold text-slate-600">Dành cho thành viên</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${item.color} mb-3 inline-block`}>
                {item.tag}
              </span>
              <h3 className="font-bold text-slate-900 text-sm leading-snug mb-3 blur-[3px] select-none">
                {item.title}
              </h3>
              <div className="space-y-1.5 blur-[3px] select-none">
                <div className="h-2.5 bg-slate-200 rounded w-full" />
                <div className="h-2.5 bg-slate-200 rounded w-4/5" />
                <div className="h-2.5 bg-slate-200 rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-violet-200 text-sm"
          >
            Mở khóa toàn bộ kịch bản →
          </Link>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────── */}
      <section className="bg-white border-y border-slate-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-2">Quyền lợi thành viên</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Bạn nhận được gì khi tham gia?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-violet-300 hover:shadow-md transition">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">{b.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 30-DAY ROADMAP PREVIEW ───────────── */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs text-violet-600 font-bold uppercase tracking-widest mb-2">Lộ trình 30 ngày</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Mỗi ngày một bước tiến rõ ràng
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
            Không phải học lý thuyết — mà là thực hành có hướng dẫn, có bài tập, có đánh giá tiến độ hàng ngày
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Week headers */}
          {[
            { week: 'Tuần 1', theme: 'Nền Tảng Tâm Lý & Kết Nối', color: 'bg-violet-50 border-violet-200 text-violet-700' },
            { week: 'Tuần 2', theme: 'Xây Dựng Niềm Tin & Uy Tín', color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { week: 'Tuần 3', theme: 'Xử Lý Từ Chối & Tạo Khan Hiếm', color: 'bg-amber-50 border-amber-200 text-amber-700' },
            { week: 'Tuần 4', theme: 'Chốt Sale & Giữ Chân Khách Hàng', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          ].map((w, i) => (
            <div key={i} className={`flex items-center justify-between px-5 py-3.5 border-b last:border-0 ${w.color} border`}>
              <div className="flex items-center gap-3">
                <span className="font-black text-sm">{w.week}</span>
                <span className="text-sm font-medium opacity-80">{w.theme}</span>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, d) => (
                  <div key={d} className="w-2 h-2 rounded-full bg-current opacity-30" />
                ))}
              </div>
            </div>
          ))}
          <div className="px-5 py-4 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">🔒 Xem chi tiết từng ngày sau khi đăng ký</p>
            <Link href="/register" className="text-xs font-bold text-violet-600 hover:text-violet-700 transition">
              Tham gia ngay →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────── */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-violet-600 font-bold uppercase tracking-widest mb-2">Thành viên nói gì</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Kết quả thực tế từ cộng đồng
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                quote: 'Tuần đầu áp dụng kịch bản xử lý từ chối, mình chốt được 2 hợp đồng bảo hiểm mà trước đó khách đã nói không.',
                name: 'Minh T.',
                role: 'Nhân viên Manulife',
                emoji: '🏆',
              },
              {
                quote: 'Cái hay nhất là có phân tích tâm lý — giờ mình hiểu TẠI SAO khách phản ứng vậy, không chỉ biết NÓI GÌ.',
                name: 'Hương N.',
                role: 'Sales BĐS — 3 năm kinh nghiệm',
                emoji: '🧠',
              },
              {
                quote: '99k mà được nhiều vậy, ban đầu mình cũng nghi ngờ. Nhưng sau 2 tuần thì mình gia hạn ngay không cần nghĩ.',
                name: 'Bình D.',
                role: 'Chủ shop mỹ phẩm online',
                emoji: '💬',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <p className="text-2xl">{t.emoji}</p>
                <p className="text-slate-700 text-sm leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-slate-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────── */}
      <section className="bg-gradient-to-br from-violet-600 to-violet-800 py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-violet-300 text-xs font-bold uppercase tracking-widest mb-3">Giá thành viên</p>
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-8 mb-6">
            <div className="mb-5">
              <p className="text-violet-300 text-xs line-through mb-1">Một buổi coaching 1-1: từ 500.000đ</p>
              <div className="text-5xl font-black text-white mb-1">99.000đ</div>
              <div className="text-violet-200 text-sm">/tháng · không tự động gia hạn</div>
            </div>
            <ul className="space-y-2.5 text-left mb-6">
              {[
                '✓ Toàn bộ 18+ kịch bản sales',
                '✓ Lộ trình 30 ngày có hướng dẫn',
                '✓ Bài tập thực hành hằng ngày',
                '✓ Phân tích tâm lý học chuyên sâu',
                '✓ Tin nhắn mẫu Zalo/FB/Trực tiếp',
                '✓ Cập nhật nội dung miễn phí',
                '✓ Hoàn tiền 7 ngày nếu không hài lòng',
              ].map((item, i) => (
                <li key={i} className="text-sm text-white flex items-center gap-2">
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-base py-4 rounded-2xl transition shadow-lg"
            >
              Đăng ký ngay — 99.000đ/tháng
            </Link>
            <p className="text-violet-300 text-xs mt-3">⚡ Kích hoạt tức thì sau khi chuyển khoản</p>
          </div>
          <p className="text-violet-200 text-xs">
            Câu hỏi? Liên hệ{' '}
            <a href="tel:0961588227" className="text-white font-bold underline">0961 588 227</a>
            {' '}— Hán Văn Sơn
          </p>
        </div>
      </section>

      {/* ── AUTHOR ───────────────────────────── */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center text-xl font-black text-white shrink-0">
            HVS
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Về tác giả</p>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hán Văn Sơn</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Chuyên gia tâm lý học ứng dụng trong kinh doanh. Đã dành nhiều năm nghiên cứu hành vi người mua
              và xây dựng hệ thống kịch bản bán hàng dựa trên khoa học — không phải cảm tính.
              Triết lý: <em className="text-slate-800 not-italic font-semibold">&quot;Hiểu người là nền tảng của mọi thành công.&quot;</em>
            </p>
            <div className="flex items-center gap-4">
              <a href="tel:0961588227" className="text-sm font-bold text-violet-600 hover:text-violet-700 transition">
                📞 0961 588 227
              </a>
              <Link href="/mon-qua" className="text-sm text-slate-500 hover:text-violet-600 transition">
                🎁 Đọc tài liệu miễn phí →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <section className="bg-slate-100 border-t border-slate-200 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-extrabold text-slate-900">Câu hỏi thường gặp</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <p className="font-bold text-slate-900 text-sm mb-2">{faq.q}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────── */}
      <section className="py-14 px-4 text-center bg-white border-t border-slate-200">
        <div className="max-w-xl mx-auto">
          <div className="text-4xl mb-4">🧠</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
            Mỗi Tháng Trễ = Thêm Bao Nhiêu Deal Bị Bỏ Lỡ?
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            99.000đ — ít hơn 1 buổi cà phê với khách — để có công cụ tâm lý học
            giúp anh/chị chốt sale tốt hơn ngay từ ngày mai.
            Kích hoạt tức thì. Hoàn tiền 100% trong 7 ngày nếu không hài lòng.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-base px-8 py-4 rounded-2xl transition shadow-xl shadow-violet-200"
          >
            Mở Khóa Ngay — 99.000đ/tháng
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="text-xs text-slate-400 mt-3">⚡ Kích hoạt tức thì · Không cần chờ Admin</p>
        </div>
      </section>

      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-4 text-center">
        <p className="text-xs text-slate-400">
          © 2025 Mind Sales Lab · Hán Văn Sơn · tamlyhocvn.club
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link href="/mon-qua" className="text-xs text-slate-400 hover:text-violet-600 transition">Tài liệu miễn phí</Link>
          <Link href="/login" className="text-xs text-slate-400 hover:text-violet-600 transition">Đăng nhập</Link>
          <Link href="/register" className="text-xs text-slate-400 hover:text-violet-600 transition">Đăng ký</Link>
        </div>
      </footer>
    </div>
  )
}
