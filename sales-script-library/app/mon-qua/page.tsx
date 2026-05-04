import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tâm Lý Học Thuyết Phục — Món Quà Từ Hán Văn Sơn',
  description: 'Khám phá 6 nguyên tắc tâm lý học thuyết phục của Robert Cialdini + Bonus quy tắc Peak-End. Tặng miễn phí từ Hán Văn Sơn.',
  openGraph: {
    title: 'Tâm Lý Học Thuyết Phục — Món Quà Tặng Bạn',
    description: '6 nguyên tắc thuyết phục cốt lõi giúp bạn bán hàng hiệu quả hơn, xây dựng niềm tin và tạo hành động ngay.',
    type: 'website',
  },
}

export default function MonQuaPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 sm:py-16">

        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Về trang chính
          </Link>
        </div>

        {/* ══════════════════════════════════════════════
            HERO HEADER
        ══════════════════════════════════════════════ */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            🎁 Món quà tặng bạn — Hoàn toàn miễn phí
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-violet-700 to-amber-600 bg-clip-text text-transparent">Tâm Lý Học</span>
            <br />
            <span className="text-slate-900">Thuyết Phục</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
            6 nguyên tắc nền tảng từ Robert Cialdini — bộ công cụ tâm lý mạnh nhất
            để thuyết phục, bán hàng và tạo ảnh hưởng.
          </p>

          {/* Author badge */}
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200 shadow-sm px-5 py-3 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
              HVS
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Hán Văn Sơn</p>
              <p className="text-xs text-slate-500">Tâm lý học ứng dụng trong kinh doanh</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            ĐÔI DÒNG VỀ TÔI
        ══════════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👤</span>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">Đôi Dòng Về Tôi</h2>
          </div>

          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              Xin chào, tôi là <strong className="text-slate-800">Hán Văn Sơn</strong> — một người đã từng thất bại
              nhiều lần trong bán hàng trước khi hiểu ra rằng vấn đề không nằm ở sản phẩm, không nằm ở giá cả,
              mà nằm ở <strong className="text-violet-700">cách con người ra quyết định</strong>.
            </p>
            <p>
              Tôi đã dành nhiều năm nghiên cứu tâm lý học hành vi, đọc hàng trăm cuốn sách, tham gia vô số khóa học
              — và rút ra một kết luận: <strong className="text-slate-800">hầu hết chúng ta bán hàng bằng logic,
              nhưng khách hàng mua bằng cảm xúc.</strong>
            </p>
            <p>
              Cuốn tài liệu nhỏ này là những gì tôi ước mình được đọc từ ngày đầu bước vào nghề.
              Không lý thuyết suông — chỉ là những nguyên tắc thực chiến đã được kiểm chứng qua hàng chục năm
              nghiên cứu và áp dụng thực tế.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            ĐÔI LỜI TỪ TRÁI TIM
        ══════════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-violet-50 to-amber-50 border border-violet-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💌</span>
            <h2 className="text-base font-bold text-violet-700 uppercase tracking-wide">Đôi Lời Từ Trái Tim</h2>
          </div>

          <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <p>
              Bạn thân mến,
            </p>
            <p>
              Khi bạn đang đọc những dòng này, tôi biết bạn là người không bằng lòng với hiện tại —
              bạn muốn bán hàng tốt hơn, muốn được khách hàng tin tưởng hơn, muốn thu nhập của mình
              xứng đáng với công sức bỏ ra.
            </p>
            <p>
              Tôi tặng bạn tài liệu này không phải để bạn "biết thêm một thứ gì đó" rồi để đó.
              Tôi tặng bạn vì tôi tin rằng <strong className="text-violet-700">hiểu người là nền tảng của mọi thành công</strong> —
              trong kinh doanh, trong cuộc sống, trong mọi mối quan hệ.
            </p>
            <p>
              Hãy đọc chậm. Hãy suy ngẫm. Và quan trọng hơn — hãy <strong className="text-slate-800">áp dụng ngay hôm nay</strong>.
              Vì kiến thức không được thực hành chỉ là thông tin vô dụng.
            </p>
            <p className="text-slate-500 italic">
              Chúc bạn thành công và hạnh phúc,<br />
              <strong className="text-slate-700 not-italic">Hán Văn Sơn</strong>
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            LỜI MỞ ĐẦU
        ══════════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-10 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📖</span>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">Lời Mở Đầu</h2>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed mb-5 font-medium">
            Tại sao con người lại dễ bị ảnh hưởng? Có 3 lý do cốt lõi:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-violet-50 border border-violet-200 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <div>
                <p className="text-sm font-bold text-violet-700 mb-1">Não bộ tiết kiệm năng lượng</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Con người xử lý hàng nghìn quyết định mỗi ngày. Não bộ không thể phân tích sâu từng
                  lựa chọn — nó dựa vào <strong className="text-slate-700">các phím tắt tâm lý (mental shortcuts)</strong> để
                  quyết định nhanh. Đây chính là nơi 6 nguyên tắc thuyết phục phát huy sức mạnh.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div>
                <p className="text-sm font-bold text-amber-700 mb-1">Cảm xúc quyết định trước, lý trí giải thích sau</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Nghiên cứu thần kinh học cho thấy quyết định mua hàng được đưa ra ở phần cảm xúc của não
                  trước — rồi phần lý trí mới tìm lý do để <strong className="text-slate-700">hợp lý hóa</strong> quyết định đó.
                  Bán hàng hiệu quả là chạm vào cảm xúc, không phải tranh luận bằng số liệu.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div>
                <p className="text-sm font-bold text-emerald-700 mb-1">Bản năng xã hội ăn sâu từ thời tiền sử</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Hàng nghìn năm tiến hóa đã lập trình con người để <strong className="text-slate-700">sống trong bầy đàn</strong> —
                  có đi có lại, tuân theo thủ lĩnh, làm theo số đông. Những bản năng này vẫn chi phối
                  hành vi mua sắm ngày nay dù chúng ta không nhận ra.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Robert Cialdini</strong> — giáo sư tâm lý học tại Đại học Arizona —
              đã dành <strong className="text-slate-800">35 năm</strong> nghiên cứu để hệ thống hóa những phím tắt tâm lý này
              thành <strong className="text-violet-700">6 nguyên tắc thuyết phục phổ quát</strong>, được ứng dụng rộng rãi
              trong marketing, bán hàng và đàm phán toàn cầu.
            </p>
          </div>
        </div>

        {/* Section header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full">
            6 NGUYÊN TẮC THUYẾT PHỤC CỐT LÕI
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            NGUYÊN TẮC 01: CÓ ĐI CÓ LẠI
        ══════════════════════════════════════════════ */}
        <div className="bg-white border border-violet-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
          {/* Header */}
          <div className="bg-violet-50 border-b border-violet-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center text-lg font-black shrink-0">
                01
              </div>
              <div>
                <p className="text-xs text-violet-500 font-semibold uppercase tracking-wider">Reciprocity</p>
                <h2 className="text-lg font-bold text-violet-700">🎁 Có Đi Có Lại</h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Bản chất */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📌 Bản Chất Nguyên Tắc</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Khi ai đó làm điều gì đó cho chúng ta — dù lớn hay nhỏ — não bộ ngay lập tức tạo ra
                <strong className="text-slate-800"> cảm giác mắc nợ</strong> và thôi thúc chúng ta đáp lại.
                Đây là bản năng xã hội cốt lõi nhất của loài người, có từ hàng nghìn năm trước khi
                cộng đồng cần trao đổi để tồn tại.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">
                Điều đặc biệt: nguyên tắc có đi có lại hoạt động ngay cả khi người cho không mong đợi
                được đáp lại — thậm chí <strong className="text-slate-800">càng không kỳ vọng, phản ứng đáp lại càng mạnh hơn</strong>.
              </p>
            </div>

            {/* Ví dụ kinh điển */}
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-3">🏛️ Ví Dụ Kinh Điển</p>
              <ul className="space-y-2">
                {[
                  'Nhà hàng Mỹ tặng kẹo mint kèm hóa đơn → tiền tip tăng 14%. Tặng 2 viên → tăng 23%.',
                  'Hare Krishna tặng hoa ở sân bay trước khi xin tiền → tỉ lệ đóng góp tăng gấp đôi.',
                  'Supermarket cho thử mẫu miễn phí → doanh số sản phẩm đó tăng 600% trong ngày.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-violet-500 mt-0.5 shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ứng dụng */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">💼 Ứng Dụng Trong Bán Hàng</p>
              <ul className="space-y-2">
                {[
                  'Tặng nội dung giá trị thật sự (tip, hướng dẫn, tư vấn miễn phí) trước khi bán.',
                  'Gửi sample, dùng thử, hoặc quà nhỏ không kèm điều kiện — "không vì lợi nhuận".',
                  'Giúp khách giải quyết vấn đề ngay trong lần đầu gặp → khách nhớ bạn đầu tiên khi cần.',
                  'Chia sẻ case study, bài học thật, kinh nghiệm thực chiến trên mạng xã hội.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tự bảo vệ */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">🛡️ Cách Tự Bảo Vệ</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Khi ai đó tặng bạn thứ gì mà bạn không yêu cầu, hãy tự hỏi: <em>&quot;Đây là quà thật sự
                hay chiến thuật bán hàng?&quot;</em> Bạn không có nghĩa vụ mua hàng chỉ vì đã nhận sample miễn phí.
                Hãy tách biệt lòng biết ơn khỏi quyết định mua hàng lý trí.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            NGUYÊN TẮC 02: CAM KẾT & NHẤT QUÁN
        ══════════════════════════════════════════════ */}
        <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-black shrink-0">
                02
              </div>
              <div>
                <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider">Commitment &amp; Consistency</p>
                <h2 className="text-lg font-bold text-amber-700">📌 Cam Kết &amp; Nhất Quán</h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📌 Bản Chất Nguyên Tắc</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Một khi con người đã cam kết — dù chỉ là một bước nhỏ —  họ sẽ cảm thấy
                <strong className="text-slate-800"> áp lực tâm lý mạnh mẽ để hành động nhất quán</strong> với cam kết đó.
                Sự nhất quán là dấu hiệu của tính cách đáng tin cậy trong mắt xã hội.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">
                Kỹ thuật <strong className="text-slate-800">&quot;Foot-in-the-door&quot;</strong>: bắt đầu bằng yêu cầu nhỏ,
                sau khi được chấp nhận, yêu cầu lớn hơn sẽ dễ được đồng ý hơn nhiều — vì người ta
                muốn nhất quán với hình ảnh &quot;người đã đồng ý&quot; của mình.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">🏛️ Ví Dụ Kinh Điển</p>
              <ul className="space-y-2">
                {[
                  'Thí nghiệm biển hiệu: Nhóm đặt biển nhỏ "Lái xe an toàn" → 3 tuần sau, 76% đồng ý dựng biển lớn ngoài nhà. Nhóm không đặt biển nhỏ: chỉ 17% đồng ý.',
                  'Thử nghiệm thiện nguyện: Đồng ý ký tên nhỏ → sau đó sẵn sàng đóng tiền hơn gấp nhiều lần.',
                  'Amazon "Giao hàng 1 click": Mỗi lần mua nhỏ → xây dựng thói quen mua → khó dừng lại.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-amber-500 mt-0.5 shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">💼 Ứng Dụng Trong Bán Hàng</p>
              <ul className="space-y-2">
                {[
                  'Hỏi câu hỏi "có lợi" nhỏ trước: "Anh/chị có muốn tiết kiệm thời gian không?" → Có → dẫn vào sản phẩm.',
                  'Cho dùng thử miễn phí 7-14 ngày → khách đã "đầu tư thời gian" → tâm lý ngại thay đổi.',
                  'Xác nhận công khai nhỏ: "Anh chị vừa nói muốn tăng doanh thu, đúng không?" → họ sẽ nhất quán với tuyên bố đó.',
                  'Bắt đầu bằng sản phẩm/gói nhỏ nhất → upsell gói lớn hơn sau khi đã có cam kết ban đầu.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">🛡️ Cách Tự Bảo Vệ</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nhận ra khi bạn đang tiếp tục làm điều gì đó chỉ vì &quot;đã lỡ đồng ý rồi&quot;.
                Mỗi quyết định mới cần được đánh giá độc lập dựa trên giá trị thực sự của nó —
                không phải dựa trên việc bạn đã nói gì trước đó.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            NGUYÊN TẮC 03: BẰNG CHỨNG XÃ HỘI
        ══════════════════════════════════════════════ */}
        <div className="bg-white border border-emerald-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-black shrink-0">
                03
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Social Proof</p>
                <h2 className="text-lg font-bold text-emerald-700">👥 Bằng Chứng Xã Hội</h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📌 Bản Chất Nguyên Tắc</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Khi không chắc chắn phải làm gì, con người nhìn vào <strong className="text-slate-800">hành động của người khác</strong> để
                tìm câu trả lời. Đây là cơ chế sinh tồn: nếu nhiều người làm điều đó, có lẽ nó đúng.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">
                Hiệu ứng này mạnh nhất khi: (1) chúng ta không chắc chắn, (2) người khác đó
                <strong className="text-slate-800"> giống chúng ta</strong> (cùng ngành, cùng tình huống, cùng vấn đề).
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">🏛️ Ví Dụ Kinh Điển</p>
              <ul className="space-y-2">
                {[
                  'Bartender &quot;trồng&quot; tiền tip sẵn trong hũ → khách khác tip nhiều hơn vì thấy "người ta đang tip".',
                  'Hotel towel study: "74% khách trong phòng này tái sử dụng khăn" → tỉ lệ tái sử dụng tăng 26%.',
                  'Netflix hiển thị "Trending" và "10 nội dung phổ biến nhất" → lượt xem tăng đột biến.',
                  'Rating 4.8 sao với 2.000 đánh giá thuyết phục hơn quảng cáo triệu đô.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-emerald-500 mt-0.5 shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">💼 Ứng Dụng Trong Bán Hàng</p>
              <ul className="space-y-2">
                {[
                  '"Đã có 500+ khách hàng trong ngành bất động sản đang dùng giải pháp này."',
                  'Đăng screenshot kết quả thực tế của khách cũ — có tên, có ngành nghề cụ thể.',
                  '"Chị Lan ở Quận 7 cũng có cùng vấn đề như mình, sau 3 tháng kết quả là…"',
                  'Số liệu cụ thể + câu chuyện thật = Social Proof mạnh gấp 10 lần quảng cáo.',
                  'Hiển thị logo khách hàng nổi tiếng đã dùng dịch vụ của bạn.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">🛡️ Cách Tự Bảo Vệ</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                &quot;Nhiều người mua&quot; không có nghĩa là &quot;đúng với bạn&quot;. Luôn đánh giá sản phẩm/dịch vụ
                dựa trên nhu cầu và hoàn cảnh thực tế của bản thân, không phải vì số đông đang làm vậy.
                Hãy đọc cả review xấu — chúng thường trung thực hơn.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            NGUYÊN TẮC 04: THIỆN CẢM
        ══════════════════════════════════════════════ */}
        <div className="bg-white border border-rose-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-lg font-black shrink-0">
                04
              </div>
              <div>
                <p className="text-xs text-rose-500 font-semibold uppercase tracking-wider">Liking</p>
                <h2 className="text-lg font-bold text-rose-600">❤️ Thiện Cảm</h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📌 Bản Chất Nguyên Tắc</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Chúng ta dễ bị thuyết phục bởi <strong className="text-slate-800">những người mà chúng ta thích</strong>.
                Và chúng ta thích người: (1) giống mình, (2) khen ngợi mình, (3) quen thuộc/gần gũi,
                (4) hấp dẫn về ngoại hình, (5) liên quan đến thứ ta yêu thích.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">
                Trong bán hàng: <strong className="text-slate-800">người ta mua từ người họ thích, không phải từ sản phẩm tốt nhất.</strong>
                Đây là lý do nhân viên bán hàng giỏi nhất không nhất thiết biết nhiều về sản phẩm nhất.
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3">🏛️ Ví Dụ Kinh Điển</p>
              <ul className="space-y-2">
                {[
                  'Thí nghiệm Tupperware: Bán hàng qua bạn bè thân → doanh số cao hơn bán cho người lạ vì yếu tố thiện cảm cá nhân.',
                  'Điều tra bồi thẩm: Bị cáo hấp dẫn ngoại hình bị phạt nhẹ hơn bị cáo kém hấp dẫn trong cùng tội danh.',
                  'Xe hơi trong quảng cáo kèm người mẫu → người xem đánh giá xe "nhanh hơn, đẹp hơn" dù không nhận ra lý do.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-rose-400 mt-0.5 shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">💼 Ứng Dụng Trong Bán Hàng</p>
              <ul className="space-y-2">
                {[
                  'Tìm điểm chung với khách hàng và đề cập tự nhiên: cùng quê, cùng sở thích, cùng khó khăn.',
                  'Khen thật sự và đúng lúc — không xu nịnh. Khen cụ thể: "Mình rất ấn tượng cách anh xây dựng đội nhóm".',
                  'Chia sẻ câu chuyện cá nhân chân thật — khó khăn, thất bại, bài học — để tạo kết nối con người.',
                  'Đặt tên và nhớ tên khách hàng. Gọi đúng tên là âm thanh ngọt ngào nhất với mỗi người.',
                  'Chăm sóc ngoại hình và phong thái — ấn tượng đầu tiên ảnh hưởng 80% kết quả gặp mặt.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">🛡️ Cách Tự Bảo Vệ</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nhận ra khi bạn đang mua hàng vì thích người bán, không phải vì cần sản phẩm.
                Hỏi bản thân: <em>&quot;Nếu người khác bán sản phẩm này, mình có vẫn mua không?&quot;</em>
                Tách biệt cảm xúc với người bán ra khỏi quyết định mua hàng lý trí.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            NGUYÊN TẮC 05: UY QUYỀN
        ══════════════════════════════════════════════ */}
        <div className="bg-white border border-blue-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-black shrink-0">
                05
              </div>
              <div>
                <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Authority</p>
                <h2 className="text-lg font-bold text-blue-700">🏆 Uy Quyền</h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📌 Bản Chất Nguyên Tắc</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Con người có xu hướng tin tưởng và làm theo <strong className="text-slate-800">những người được coi là chuyên gia
                hoặc có thẩm quyền</strong> trong một lĩnh vực nhất định — dù đôi khi họ thực ra không phải chuyên gia thật sự.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">
                3 dấu hiệu uy quyền mà não bộ nhận diện nhanh nhất: <strong className="text-slate-800">danh hiệu/chứng chỉ,
                trang phục/ngoại hình, và tài sản/địa vị</strong>. Tất cả đều có thể được xây dựng có chủ đích.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">🏛️ Ví Dụ Kinh Điển</p>
              <ul className="space-y-2">
                {[
                  'Thí nghiệm Milgram: 65% người bình thường tuân theo lệnh của "nhà khoa học mặc áo trắng" dù biết lệnh gây hại.',
                  'Bác sĩ mặc áo blouse → bệnh nhân tin ngay, không đặt câu hỏi dù đơn thuốc sai.',
                  'Quảng cáo nha khoa: "9/10 nha sĩ khuyên dùng…" → doanh số tăng hàng chục lần.',
                  'Chuyên gia được TV mời → quan điểm của họ được tin nhiều hơn dù nội dung như nhau.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">💼 Ứng Dụng Trong Bán Hàng</p>
              <ul className="space-y-2">
                {[
                  'Xây dựng thương hiệu cá nhân: viết bài chuyên môn, chia sẻ kiến thức hữu ích thường xuyên.',
                  'Hiển thị rõ ràng: chứng chỉ, giải thưởng, bằng cấp, số năm kinh nghiệm.',
                  'Được trích dẫn, phỏng vấn hoặc đề cập trên báo chí/podcast → uy tín tăng đột biến.',
                  'Mặc đồ phù hợp với lĩnh vực — trang phục là tín hiệu uy quyền không lời.',
                  'Không cần "khoe" — để bằng chứng và kết quả tự nói thay bạn.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">🛡️ Cách Tự Bảo Vệ</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tự hỏi: <em>&quot;Người này có uy quyền thật trong lĩnh vực này không, hay chỉ là bề ngoài?&quot;</em>
                Danh hiệu và áo khoác không đảm bảo năng lực. Hãy luôn đặt câu hỏi phản biện,
                kể cả với chuyên gia — đặc biệt khi quyết định quan trọng đến tài chính và sức khỏe.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            NGUYÊN TẮC 06: KHAN HIẾM
        ══════════════════════════════════════════════ */}
        <div className="bg-white border border-orange-200 rounded-2xl overflow-hidden mb-10 shadow-sm">
          <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center text-lg font-black shrink-0">
                06
              </div>
              <div>
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider">Scarcity</p>
                <h2 className="text-lg font-bold text-orange-600">⏰ Khan Hiếm</h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📌 Bản Chất Nguyên Tắc</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Những thứ <strong className="text-slate-800">khan hiếm, giới hạn số lượng hoặc thời gian</strong> luôn được coi
                trọng hơn. Và quan trọng hơn: <strong className="text-slate-800">nỗi sợ mất mát (loss aversion)
                mạnh hơn niềm vui đạt được khoảng 2,5 lần</strong> — theo nghiên cứu của Kahneman và Tversky.
              </p>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">
                Điều này tạo ra <strong className="text-slate-800">FOMO</strong> (Fear Of Missing Out) — động lực
                hành động mạnh mẽ nhất trong quyết định mua hàng.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">🏛️ Ví Dụ Kinh Điển</p>
              <ul className="space-y-2">
                {[
                  'Thí nghiệm cookie: Bình 10 cookie vs. bình 2 cookie — người ta đánh giá cookie ít hơn ngon hơn dù cùng loại.',
                  'Đợt mở bán iPhone giới hạn → hàng ngàn người xếp hàng qua đêm — khan hiếm tạo giá trị tự thân.',
                  'Booking.com: "Chỉ còn 2 phòng!" → tỉ lệ đặt phòng tăng 30% so với không hiển thị thông tin đó.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-orange-500 mt-0.5 shrink-0">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">💼 Ứng Dụng Trong Bán Hàng</p>
              <ul className="space-y-2">
                {[
                  '"Chỉ nhận 10 khách/tháng để đảm bảo chất lượng tư vấn cá nhân." — giới hạn có lý do.',
                  '"Ưu đãi này áp dụng đến hết ngày hôm nay vì đây là giá ra mắt sản phẩm."',
                  '"Còn 3 suất của đợt này — đợt sau chưa biết khi nào mở lại."',
                  'Phiên bản giới hạn, màu sắc độc quyền, bao bì đặc biệt — khan hiếm có thể được tạo ra một cách sáng tạo.',
                  '⚠️ Quan trọng: Khan hiếm THẬT > khan hiếm giả tạo. Khách ngày nay rất tinh nhạy.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">🛡️ Cách Tự Bảo Vệ</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Khi cảm thấy áp lực &quot;phải quyết định ngay&quot;, hãy dừng lại và hỏi:
                <em>&quot;Nếu bỏ lỡ cơ hội này, mình có thực sự mất điều gì quan trọng không?&quot;</em>
                Deadline giả tạo sẽ biến mất nếu bạn liên hệ lại — còn deadline thật sự thì đáng cân nhắc.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            BONUS: PEAK-END RULE
        ══════════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl overflow-hidden mb-10 shadow-sm">
          <div className="px-6 py-5 border-b border-amber-200">
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
              🌟 BONUS — Quy Tắc Đặc Biệt
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-700">Peak-End Rule</h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Con người nhớ đỉnh cảm xúc và kết thúc — không phải toàn bộ trải nghiệm
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Research base */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📌 Nghiên Cứu Nền Tảng</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Daniel Kahneman — nhà tâm lý học đoạt giải Nobel — phát hiện: não bộ không lưu trữ
                trung bình của toàn bộ trải nghiệm. Nó chỉ nhớ <strong className="text-amber-700">hai điểm</strong>:
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-amber-600 mb-1">🏔️ Peak — Đỉnh Cảm Xúc</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Khoảnh khắc cảm xúc mạnh nhất trong trải nghiệm — có thể là cực tốt hoặc cực tệ.
                    Não ghi nhớ điểm này rõ ràng nhất.
                  </p>
                </div>
                <div className="bg-white border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-amber-600 mb-1">🏁 End — Kết Thúc</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cách trải nghiệm kết thúc có tác động không tỉ lệ đến toàn bộ ký ức về trải nghiệm đó.
                  </p>
                </div>
              </div>
              <div className="mt-3 bg-amber-100 border border-amber-300 rounded-xl p-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Ví dụ:</strong> Thí nghiệm nước lạnh của Kahneman — người chịu 60 giây nước lạnh 14°C,
                  sau đó thêm 30 giây nước 15°C (đỡ lạnh hơn một chút) nhớ trải nghiệm thứ hai là &quot;dễ chịu hơn&quot;
                  — dù tổng thời gian đau dài hơn. Kết thúc tốt hơn → ký ức tốt hơn.
                </p>
              </div>
            </div>

            {/* 5 cách tạo Peak */}
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">🏔️ Phần 1: 5 Cách Tạo Đỉnh Cảm Xúc (Peak)</p>
              <div className="space-y-3">
                {[
                  {
                    n: '1',
                    title: 'Tặng quà bất ngờ ngoài mong đợi',
                    desc: 'Không phải quà đắt tiền — mà là quà không được báo trước. "Bất ngờ" tạo phản ứng cảm xúc mạnh hơn quà đắt mà có hẹn.',
                  },
                  {
                    n: '2',
                    title: 'Giải quyết vấn đề khó ngay lập tức',
                    desc: 'Khi khách gặp sự cố và bạn xử lý siêu nhanh, siêu chu đáo — đó là Peak. Đỉnh cao dịch vụ không phải lúc không có vấn đề, mà là xử lý vấn đề xuất sắc.',
                  },
                  {
                    n: '3',
                    title: 'Tạo khoảnh khắc "wow" cá nhân hóa',
                    desc: 'Nhớ ngày kỷ niệm, sở thích riêng, tên con khách hàng — và hành động dựa trên đó. Sự cá nhân hóa tạo cảm xúc mạnh vì nó nói lên: "Tôi quan tâm đến bạn cụ thể."',
                  },
                  {
                    n: '4',
                    title: 'Vượt quá kỳ vọng một cách cụ thể',
                    desc: 'Hứa ít — làm nhiều. Giao hàng trước hẹn 1 ngày. Tặng thêm dịch vụ không nằm trong gói. Kết quả vượt mục tiêu đề ra.',
                  },
                  {
                    n: '5',
                    title: 'Tạo trải nghiệm độc đáo, đáng kể lại',
                    desc: 'Khoảnh khắc đáng chụp ảnh, đáng chia sẻ, đáng kể cho bạn bè. Đây là Peak và marketing miễn phí cùng lúc.',
                  },
                ].map((item) => (
                  <div key={item.n} className="flex gap-3 bg-white border border-amber-200 rounded-xl p-4">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {item.n}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-1">{item.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 cách tạo End */}
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">🏁 Phần 2: 5 Cách Tạo Kết Thúc Tuyệt Vời (End)</p>
              <div className="space-y-3">
                {[
                  {
                    n: '1',
                    title: 'Lời cảm ơn chân thành và cá nhân hóa',
                    desc: 'Không phải "cảm ơn đã mua hàng" — mà là "cảm ơn anh Minh đã tin tưởng mình trong quyết định này, mình sẽ cố gắng xứng đáng với sự tin tưởng đó."',
                  },
                  {
                    n: '2',
                    title: 'Follow-up chủ động sau khi hoàn thành',
                    desc: 'Liên hệ sau 3-7 ngày để hỏi thăm trải nghiệm thực tế. 90% người bán không làm điều này — đây là cơ hội tạo ấn tượng cuối cực mạnh.',
                  },
                  {
                    n: '3',
                    title: 'Tặng bonus bất ngờ khi kết thúc',
                    desc: 'Thêm một tài liệu, một lời khuyên, một kết nối hữu ích ngay trước khi chia tay. Não nhớ phần cuối rõ nhất — hãy kết thúc bằng điều tốt đẹp.',
                  },
                  {
                    n: '4',
                    title: 'Tổng kết và xác nhận quyết định đúng',
                    desc: 'Giúp khách cảm thấy tự hào về quyết định của mình: "Anh/chị vừa đưa ra quyết định rất sáng suốt — đây là lý do tại sao…"',
                  },
                  {
                    n: '5',
                    title: 'Mở cánh cửa cho tương lai',
                    desc: 'Kết thúc bằng viễn cảnh tích cực: kết quả sắp đến, bước tiếp theo rõ ràng, lời hứa hỗ trợ liên tục. Đừng để khách cảm giác "giao dịch xong là hết."',
                  },
                ].map((item) => (
                  <div key={item.n} className="flex gap-3 bg-white border border-amber-200 rounded-xl p-4">
                    <div className="w-7 h-7 rounded-lg bg-orange-400 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {item.n}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-1">{item.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Công thức Vàng */}
            <div className="bg-amber-100 border-2 border-amber-400 rounded-2xl p-5">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">✨ Công Thức Vàng</p>
              <div className="text-center mb-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="text-base font-black text-amber-600">Dịch vụ trung bình</span>
                  <span className="text-slate-500 mx-2">+</span>
                  <span className="text-base font-black text-amber-600">Đỉnh cảm xúc cao</span>
                  <span className="text-slate-500 mx-2">+</span>
                  <span className="text-base font-black text-amber-600">Kết thúc tuyệt vời</span>
                </p>
                <p className="text-amber-600 font-black text-lg mt-2">= Khách hàng nhớ mãi &amp; giới thiệu thêm</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed text-center">
                Bạn không cần hoàn hảo trong suốt toàn bộ quá trình —
                chỉ cần tạo được Peak và End xuất sắc.
              </p>
            </div>

            {/* 2 câu hỏi + quy tắc 30 giây */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">🎯 2 Câu Hỏi Để Áp Dụng Ngay</p>
              <div className="bg-white border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 font-black text-sm shrink-0">Q1</span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong className="text-slate-800">Đỉnh cảm xúc của khách hàng khi làm việc với mình là gì?</strong>
                    Khoảnh khắc nào họ cảm thấy &quot;wow&quot;? Nếu chưa có — tạo ra nó.
                  </p>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-start gap-3">
                  <span className="text-amber-500 font-black text-sm shrink-0">Q2</span>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong className="text-slate-800">Cuộc trò chuyện/giao dịch cuối cùng của mình kết thúc như thế nào?</strong>
                    Nó đọng lại cảm xúc gì trong lòng khách hàng?
                  </p>
                </div>
              </div>

              <div className="bg-white border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 mb-2">⚡ Quy Tắc 30 Giây Cuối</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  30 giây cuối của bất kỳ tương tác nào với khách hàng quyết định 80% ký ức của họ về bạn.
                  Hãy chuẩn bị sẵn <strong className="text-slate-800">câu kết thúc signature</strong> — một lời cảm ơn, một lời hứa,
                  hoặc một điều bất ngờ nhỏ — để kết thúc mỗi cuộc gặp theo cách đáng nhớ nhất.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            TỔNG KẾT
        ══════════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📋</span>
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">Tổng Kết</h2>
          </div>

          {/* Summary table */}
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs text-slate-500 font-bold py-2 pr-3">#</th>
                  <th className="text-left text-xs text-slate-500 font-bold py-2 pr-3">Nguyên tắc</th>
                  <th className="text-left text-xs text-slate-500 font-bold py-2 pr-3">Cốt lõi</th>
                  <th className="text-left text-xs text-slate-500 font-bold py-2">Áp dụng ngay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { num: '01', color: 'text-violet-600', name: 'Có Đi Có Lại', core: 'Cho đi trước — nhận lại sau', action: 'Tặng giá trị thật không điều kiện' },
                  { num: '02', color: 'text-amber-600', name: 'Cam Kết & Nhất Quán', core: 'Khi đã nói — người ta muốn làm đúng', action: 'Bắt đầu bằng yêu cầu nhỏ nhất' },
                  { num: '03', color: 'text-emerald-600', name: 'Bằng Chứng Xã Hội', core: 'Người khác làm → mình cũng nên làm', action: 'Thu thập và hiển thị testimonial thật' },
                  { num: '04', color: 'text-rose-500', name: 'Thiện Cảm', core: 'Mua từ người mình thích', action: 'Tìm điểm chung, khen thật, kể chuyện thật' },
                  { num: '05', color: 'text-blue-600', name: 'Uy Quyền', core: 'Chuyên gia nói — người ta nghe', action: 'Viết bài, chia sẻ kiến thức chuyên môn' },
                  { num: '06', color: 'text-orange-500', name: 'Khan Hiếm', core: 'Ít hơn = giá trị hơn', action: 'Tạo khan hiếm THẬT có lý do rõ ràng' },
                ].map((row) => (
                  <tr key={row.num}>
                    <td className={`py-2.5 pr-3 font-mono text-xs font-black ${row.color}`}>{row.num}</td>
                    <td className="py-2.5 pr-3 font-semibold text-slate-800 text-xs whitespace-nowrap">{row.name}</td>
                    <td className="py-2.5 pr-3 text-slate-500 text-xs">{row.core}</td>
                    <td className="py-2.5 text-slate-600 text-xs">{row.action}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-amber-200">
                  <td className="py-2.5 pr-3 font-mono text-xs font-black text-amber-600">✦</td>
                  <td className="py-2.5 pr-3 font-semibold text-slate-800 text-xs whitespace-nowrap">Peak-End Rule</td>
                  <td className="py-2.5 pr-3 text-slate-500 text-xs">Nhớ đỉnh + kết thúc</td>
                  <td className="py-2.5 text-slate-600 text-xs">Tạo khoảnh khắc wow + kết thúc đẹp</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cialdini quote */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-700 leading-relaxed italic mb-2">
              &quot;Chúng ta sống trong một thế giới ngày càng phức tạp, với tốc độ ngày càng tăng.
              Các phím tắt tâm lý không phải điểm yếu — chúng là sự thích nghi cần thiết.
              Điều quan trọng là <strong className="text-slate-800 not-italic">biết khi nào chúng ta đang bị dẫn dắt bởi chúng</strong>.&quot;
            </p>
            <p className="text-xs text-slate-500 font-semibold">— Robert B. Cialdini</p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            LỜI KẾT & CTA
        ══════════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-2xl p-8 text-center mb-8 shadow-sm">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
            Bây giờ là lúc thực hành
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto mb-3">
            Kiến thức không được thực hành chỉ là thông tin chết. Hãy chọn <strong className="text-slate-800">1 nguyên tắc duy nhất</strong>
            và áp dụng trong cuộc trò chuyện bán hàng <strong className="text-slate-800">ngay ngày hôm nay</strong>.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto mb-6">
            Sau 7 ngày áp dụng đủ 7 nguyên tắc — bạn sẽ nhận ra sự thay đổi rõ ràng
            trong cách khách hàng phản hồi với bạn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-violet-200"
            >
              📚 Khám phá Kịch bản Sales
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white border border-violet-300 text-violet-700 hover:bg-violet-50 font-semibold text-sm px-6 py-3 rounded-xl transition"
            >
              🗺️ Lộ trình 30 ngày
            </Link>
          </div>

          <div className="pt-5 border-t border-violet-200">
            <p className="text-xs text-slate-500 mb-2">Muốn học sâu hơn? Liên hệ trực tiếp với tác giả</p>
            <a
              href="tel:0961588227"
              className="text-base font-bold text-violet-700 hover:text-violet-800 transition"
            >
              📞 0961 588 227
            </a>
            <p className="text-sm font-semibold text-slate-700 mt-1">Hán Văn Sơn</p>
            <p className="text-xs text-slate-500 mt-0.5">Tâm lý học ứng dụng trong kinh doanh</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Dựa trên nghiên cứu của Robert B. Cialdini — &quot;Influence: The Psychology of Persuasion&quot; (1984)
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Tổng hợp &amp; ứng dụng thực chiến bởi Hán Văn Sơn · tamlyhocvn.club
          </p>
        </div>

      </div>
    </div>
  )
}
