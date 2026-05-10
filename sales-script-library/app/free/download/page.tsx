'use client'
import { Fragment, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import MidContentCTA from '@/components/MidContentCTA'
import StickyOfferBar from '@/components/StickyOfferBar'
import AuthorBio from '@/components/AuthorBio'

/* ─────────────────────────── SCRIPT DATA ─────────────────────────── */

const SCRIPTS = [
  {
    id: 1,
    emoji: '💬',
    objection: '"Để Suy Nghĩ Thêm"',
    tag: 'Objection #1 phổ biến nhất',
    tagColor: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
    cardBorder: 'border-violet-700/40',
    accentColor: 'text-violet-400',
    bgGlow: 'from-violet-900/20',
    psychology: `Khi khách nói "để suy nghĩ thêm" mà không có lý do cụ thể — thực chất họ chưa thấy đủ lý do để hành động NGAY. Đây không phải lời từ chối — đây là yêu cầu thêm thông tin hoặc sự đảm bảo. Nhiệm vụ của bạn: tìm ra cụ thể điều gì đang chặn họ lại.`,
    technique: 'ACR — Acknowledge → Clarify → Reframe → Close',
    steps: [
      {
        step: 'Bước 1 — Acknowledge (Thừa nhận, không phản bác)',
        lines: [
          '"Dạ, em hoàn toàn hiểu anh/chị muốn suy nghĩ kỹ trước khi quyết định — điều đó cho thấy anh/chị rất cẩn thận."',
        ],
        note: '⚠️ KHÔNG nói: "Anh/chị còn phân vân điều gì ạ?" — nghe giống thẩm vấn.',
      },
      {
        step: 'Bước 2 — Clarify (Tìm lý do thực sự)',
        lines: [
          '"Em chỉ muốn hỏi thẳng một câu: trong những điều anh/chị đang cân nhắc, điều gì đang khiến anh/chị chưa quyết định ngay lúc này?"',
        ],
        note: '👂 Lắng nghe kỹ. Không ngắt lời. Ghi nhận.',
      },
      {
        step: 'Bước 3A — Nếu khách nêu LÝ DO CỤ THỂ',
        lines: [
          '"À, vậy nếu [giải quyết vấn đề họ vừa nêu], thì anh/chị sẵn sàng bắt đầu ngay hôm nay không?"',
        ],
        note: '→ Giải quyết đúng vấn đề họ nêu → Close lại ngay.',
      },
      {
        step: 'Bước 3B — Nếu khách KHÔNG nêu lý do cụ thể',
        lines: [
          '"Anh/chị ơi, thật ra khi mình nói \'để suy nghĩ thêm\' mà không có điều gì cụ thể — thường là vì mình chưa thấy đủ lý do để hành động ngay lúc này. Em hiểu điều đó hoàn toàn."',
          '',
          '"Vậy thông tin nào anh/chị còn thiếu để đưa ra quyết định?"',
        ],
        note: '→ Buộc họ phải nêu lý do thực sự.',
      },
      {
        step: 'Bước 4 — Close',
        lines: [
          '"Vậy nếu bây giờ em hỗ trợ anh/chị [bước cụ thể tiếp theo], mình bắt đầu được chứ?"',
        ],
        note: '✅ Luôn kết thúc bằng câu hỏi có/không rõ ràng.',
      },
    ],
    industries: [
      { label: 'Bảo hiểm', example: '"Vậy điều gì về quyền lợi bảo hiểm còn khiến anh chưa yên tâm ký hợp đồng hôm nay?"' },
      { label: 'Bất động sản', example: '"Với căn hộ này, điều gì anh/chị muốn xem xét thêm — pháp lý, vị trí, hay giá?"' },
      { label: 'Mỹ phẩm/MLM', example: '"Chị muốn thử kết quả trước hay có câu hỏi nào về sản phẩm chưa được trả lời?"' },
    ],
    mistake: 'Đừng nói "Vậy khi nào anh/chị nghĩ xong thì báo em nhé" — đây là câu chấp nhận bị reject và mất deal vĩnh viễn.',
  },
  {
    id: 2,
    emoji: '💰',
    objection: '"Đắt Quá" / "Giá Cao Quá"',
    tag: 'Objection #2 — Phổ biến trong mọi ngành',
    tagColor: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    cardBorder: 'border-amber-700/40',
    accentColor: 'text-amber-400',
    bgGlow: 'from-amber-900/20',
    psychology: `"Đắt quá" 90% không phải vấn đề tiền — mà là vấn đề GIÁ TRỊ. Khách chưa thấy sản phẩm của bạn đáng giá tiền đó. Nhiệm vụ của bạn: không phải giảm giá, mà là tăng giá trị cảm nhận — bằng cách so sánh với cái giá thực sự của việc KHÔNG mua.`,
    technique: 'VDR — Validate → Decompose → ROI Reframe',
    steps: [
      {
        step: 'Bước 1 — Validate (Không tranh luận về giá)',
        lines: [
          '"Dạ, em hiểu — [giá] nghe có vẻ là một khoản đáng cân nhắc."',
        ],
        note: '⚠️ KHÔNG nói: "Không đắt đâu anh/chị ơi!" — phản bác cảm xúc của họ là mất điểm.',
      },
      {
        step: 'Bước 2 — Reframe bằng ROI (So sánh với cái giá của việc không mua)',
        lines: [
          '"Nhưng em hỏi anh/chị một câu: nếu kỹ thuật/sản phẩm này giúp anh/chị [đạt kết quả cụ thể] — dù chỉ 1 lần — thì kết quả đó trị giá bao nhiêu với anh/chị?"',
        ],
        note: '👂 Để họ tự nói ra con số — không bao giờ bạn nói trước.',
      },
      {
        step: 'Bước 3 — Decompose (Chia nhỏ chi phí)',
        lines: [
          '"Vậy tức là với [giá sản phẩm], anh/chị chỉ cần recover lại từ [số lần/kết quả nhỏ]. Mà mình đang nói đến [giá trị trọn bộ] — không phải chỉ 1."',
          '',
          '"Thực ra cái đắt không phải là [giá sản phẩm]. Cái đắt là tiếp tục [mô tả vấn đề hiện tại] mà không có đúng [giải pháp]. Anh/chị đồng ý không?"',
        ],
        note: '→ Khi họ gật đầu — deal gần như đã close.',
      },
      {
        step: 'Bước 4 — Close',
        lines: [
          '"Vậy mình bắt đầu ngay hôm nay để anh/chị áp dụng được từ [cơ hội tiếp theo] nhé?"',
        ],
        note: '✅ Đặt cụ thể: "cuộc gọi tiếp theo", "khách hàng tuần này"...',
      },
    ],
    industries: [
      { label: 'Bảo hiểm', example: '"Nếu chẳng may xảy ra rủi ro mà không có bảo hiểm, chi phí điều trị là bao nhiêu? Phí bảo hiểm 3 triệu/năm so với đó thì sao?"' },
      { label: 'Bất động sản', example: '"Căn này 3 tỷ. Nếu 6 tháng nữa tăng lên 3.5 tỷ vì tuyến metro — anh/chị mất 500 triệu vì chờ. Đó mới là đắt."' },
      { label: 'Kỹ năng/Khóa học', example: '"Khóa học 1.5 triệu. Nếu giúp anh/chị chốt thêm 1 deal 5 triệu — ROI 300% ngay tháng đầu."' },
    ],
    mistake: 'Đừng bao giờ nói "Để anh/chị đặt cọc trước đi, phần còn lại tính sau" — đây là tín hiệu bạn không tin vào giá trị của sản phẩm.',
  },
  {
    id: 3,
    emoji: '👫',
    objection: '"Cần Hỏi Vợ/Chồng"',
    tag: 'Objection #3 — Khó xử nhất nếu không có kỹ thuật',
    tagColor: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    cardBorder: 'border-emerald-700/40',
    accentColor: 'text-emerald-400',
    bgGlow: 'from-emerald-900/20',
    psychology: `"Cần hỏi vợ/chồng" = bạn đang nói chuyện với người không đủ quyền quyết định. Có 2 tình huống: (1) Họ thực sự cần bàn thêm — thì INCLUDE người quyết định ngay tại chỗ; (2) Họ dùng câu này để thoát — thì phải xác định trước khi proceed. Đây là kỹ thuật include thay vì để họ ra về và deal chết lạnh.`,
    technique: 'HIP — Honor → Identify → Include or Proceed',
    steps: [
      {
        step: 'Bước 1 — Honor (Tôn trọng, không làm họ xấu hổ)',
        lines: [
          '"Dạ, em rất tôn trọng điều đó — quyết định quan trọng thì nên bàn cùng người thân. Anh/chị rất có trách nhiệm."',
        ],
        note: '⚠️ Đừng thở dài hoặc tỏ ra thất vọng — họ đang test xem bạn có tôn trọng họ không.',
      },
      {
        step: 'Bước 2 — Identify (Tìm hiểu vợ/chồng quan tâm điều gì)',
        lines: [
          '"Em hỏi thử: thường khi anh/chị chia sẻ với vợ/chồng về một khoản đầu tư, bạn ấy thường quan tâm nhất đến điều gì — kết quả thực tế, chi phí, hay thời gian anh/chị phải bỏ ra?"',
        ],
        note: '→ Câu trả lời của họ cho bạn biết phải chuẩn bị argument gì.',
      },
      {
        step: 'Bước 3A — Include (Mời gọi người quyết định ngay)',
        lines: [
          '"Vậy anh/chị có thể gọi cho vợ/chồng ngay lúc này không? Em sẽ giải thích trực tiếp — như vậy đảm bảo mọi câu hỏi được trả lời đầy đủ, không bị thiếu thông tin khi về nhà kể lại."',
        ],
        note: '→ Nếu họ đồng ý gọi — deal vẫn sống. Bạn có cơ hội thứ 2.',
      },
      {
        step: 'Bước 3B — Nếu họ không muốn gọi ngay',
        lines: [
          '"Được rồi. Vậy em để lại toàn bộ thông tin cho anh/chị — anh/chị có thể cho em số Zalo của vợ/chồng không? Em gửi tóm tắt qua để bạn ấy tiện đọc, có thắc mắc gì nhắn em trả lời ngay. Anh/chị thấy được không?"',
        ],
        note: '→ Nếu họ từ chối cả điều này — "cần hỏi vợ/chồng" là lý do thật sự khác. Quay về Kịch Bản 1.',
      },
      {
        step: 'Bước 4 — Proceed với timeline cụ thể',
        lines: [
          '"Vậy mình thống nhất thế này: anh/chị chia sẻ với vợ/chồng tối nay. Sáng mai em gọi lại lúc 9h — anh/chị tiện không? Em đặt lịch luôn để không bị quên."',
        ],
        note: '✅ Luôn đặt lịch follow-up cụ thể — không bao giờ nói "anh/chị tính xong thì báo em".',
      },
    ],
    industries: [
      { label: 'Bảo hiểm', example: '"Vợ/chồng anh/chị thường quan tâm hơn đến bảo vệ cho con hay cho cả gia đình? Để em gửi minh họa phù hợp nhất cho bạn ấy xem."' },
      { label: 'Bất động sản', example: '"Chị đi xem thực tế căn hộ cùng anh chưa? Cuối tuần này hai vợ chồng có thể sắp xếp được không — em đặt lịch xem mẫu riêng."' },
      { label: 'Khóa học', example: '"Thường anh/chị học thêm để phát triển bản thân — vợ/chồng có hay ủng hộ không? Nếu cần em có thể giải thích lợi ích với gia đình."' },
    ],
    mistake: 'Đừng nói "Vậy khi nào anh/chị hỏi xong thì liên hệ lại em nhé" — xác suất họ liên hệ lại gần như bằng 0.',
  },
]

/* ─────────────────────────── COMPONENTS ─────────────────────────── */

function ScriptCard({ script }: { script: typeof SCRIPTS[0] }) {
  return (
    <div className={`bg-gradient-to-br ${script.bgGlow} to-slate-800/60 border ${script.cardBorder} rounded-2xl overflow-hidden mb-8`}>

      {/* Header */}
      <div className="p-6 border-b border-slate-700/60">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{script.emoji}</span>
          <div>
            <span className={`inline-block border text-xs font-bold px-3 py-1 rounded-full mb-2 ${script.tagColor}`}>
              {script.tag}
            </span>
            <h2 className="text-xl font-black text-white">
              Kịch Bản {script.id}: {script.objection}
            </h2>
          </div>
        </div>
      </div>

      {/* Psychology */}
      <div className="p-6 border-b border-slate-700/40">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">🧠 Tâm lý học đằng sau</p>
        <p className="text-slate-300 text-sm leading-relaxed">{script.psychology}</p>
      </div>

      {/* Technique */}
      <div className="px-6 pt-5 pb-2">
        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${script.accentColor}`}>
          ✦ Kỹ thuật: {script.technique}
        </p>

        <div className="space-y-4">
          {script.steps.map((s, i) => (
            <div key={i} className="bg-slate-900/60 rounded-xl p-4">
              <p className={`text-xs font-bold mb-2 ${script.accentColor}`}>{s.step}</p>
              <div className="space-y-1 mb-2">
                {s.lines.map((line, j) => (
                  line === '' ? <div key={j} className="h-1" /> :
                  <p key={j} className="text-white text-sm font-medium leading-relaxed bg-slate-800/80 rounded-lg px-3 py-2">
                    {line}
                  </p>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Industry examples */}
      <div className="p-6 border-t border-slate-700/40 mt-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">📌 Ví dụ theo ngành</p>
        <div className="space-y-2">
          {script.industries.map((ind, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className={`text-xs font-bold shrink-0 mt-0.5 ${script.accentColor}`}>{ind.label}:</span>
              <p className="text-slate-300 text-xs italic leading-relaxed">{ind.example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Common mistake */}
      <div className="px-6 pb-6">
        <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-3">
          <p className="text-red-400 text-xs font-bold mb-1">❌ Lỗi hay gặp:</p>
          <p className="text-red-200 text-xs leading-relaxed">{script.mistake}</p>
        </div>
      </div>

    </div>
  )
}

/* ─────────────────────────── PAGE ─────────────────────────── */

function DownloadContent() {
  const params = useSearchParams()
  const name   = params.get('name') || 'anh/chị'

  const handleSavePdf = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white print:bg-white print:text-slate-900">

      {/* Nav */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between max-w-3xl mx-auto print:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <span className="bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text text-transparent font-extrabold text-sm">
            Mind Sales Lab
          </span>
        </Link>
        <Link href="/register" className="text-xs bg-amber-500 hover:bg-amber-400 text-white font-bold px-3 py-1.5 rounded-lg transition">
          Nâng cấp 99k →
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 print:py-4">

        {/* Welcome */}
        <div className="text-center mb-6 print:mb-4">
          <div className="text-5xl mb-4 print:hidden">🎁</div>
          <h1 className="text-2xl md:text-3xl font-black mb-2 print:text-2xl print:text-slate-900">
            Xin chào, <span className="text-amber-400 print:text-amber-700">{name}</span>!
          </h1>
          <p className="text-slate-400 text-sm print:text-slate-600">
            Dưới đây là 3 kịch bản chốt đơn cấp tốc — đọc và áp dụng ngay hôm nay.
          </p>
        </div>

        {/* Save PDF button — chỉ hiện trên web, ẩn khi print */}
        <div className="flex justify-center mb-10 print:hidden">
          <button
            onClick={handleSavePdf}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500 text-slate-200 hover:text-white text-sm font-medium px-5 py-3 rounded-xl transition"
          >
            <span className="text-lg">💾</span>
            <span>Lưu thành PDF / In ra giấy</span>
          </button>
        </div>

        {/* Author bio compact — boost trust trước khi đọc content */}
        <AuthorBio variant="compact" theme="dark" />

        {/* Quick summary */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">📋 Tóm tắt nhanh — 3 kịch bản</p>
          <div className="space-y-2">
            {[
              { n: '1', obj: '"Để suy nghĩ thêm"', tech: 'ACR — Tìm lý do thực sự, close lại ngay' },
              { n: '2', obj: '"Đắt quá"', tech: 'VDR — Reframe ROI, không cần giảm giá' },
              { n: '3', obj: '"Cần hỏi vợ/chồng"', tech: 'HIP — Include người quyết định ngay tại chỗ' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                  {item.n}
                </div>
                <div>
                  <span className="text-white text-sm font-bold">{item.obj}</span>
                  <span className="text-slate-400 text-xs ml-2">→ {item.tech}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scripts + Mid-content CTAs sau mỗi script — bắt user khi đang đọc */}
        {SCRIPTS.map((script, idx) => (
          <Fragment key={script.id}>
            <ScriptCard script={script} />
            {idx === 0 && (
              <MidContentCTA
                variant="violet"
                emoji="💡"
                headline={<>Còn <span className="text-amber-400">5 kịch bản nữa</span> cho objection &quot;để suy nghĩ&quot;</>}
                body={<>Vd: khi khách bắt đầu im lặng giữa câu, khi khách hỏi &quot;để em hỏi sếp&quot;, khi khách trì hoãn lần thứ 3, khi khách hứa &quot;sẽ phản hồi sau&quot;... Mỗi tình huống có script word-for-word riêng.</>}
                ctaText="Mở khóa 18+ kịch bản — 99K/tháng →"
              />
            )}
            {idx === 1 && (
              <MidContentCTA
                variant="amber"
                emoji="💰"
                headline={<>14 kịch bản chuyên sâu xử lý &quot;đắt quá&quot; — <span className="text-amber-300">theo từng ngành</span></>}
                body={<>BĐS có cách reframe khác Bảo hiểm. Mỹ phẩm khác F&amp;B. Tài chính khác MLM. Trong Mind Sales Lab có script riêng cho từng ngành — không phải kịch bản generic copy đại trà.</>}
                ctaText="Xem kịch bản theo ngành của tôi — 99K →"
              />
            )}
            {idx === 2 && (
              <MidContentCTA
                variant="emerald"
                emoji="🎁"
                headline={<>Hôm nay anh có <span className="text-amber-300">1 đặc quyền dành riêng</span></>}
                body={<>Mua trong 24h tới — em gửi link kết nối Zalo để anh đặt lịch <strong className="text-white">audit 1-1 với sư phụ Sơn (30 phút)</strong>. Anh kể 1 case khách đang stuck, em phân tích tâm lý + cho kịch bản custom riêng.</>}
                ctaText="Nhận deal hôm nay — 99K + bonus 1tr →"
                showBonus
              />
            )}
          </Fragment>
        ))}

        {/* Bonus section */}
        <div className="bg-gradient-to-br from-violet-900/40 to-amber-900/20 border border-violet-700/40 rounded-2xl p-6 mb-10">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">🎯 Bonus — Nguyên Tắc Vàng</p>
          <div className="space-y-3">
            {[
              { n: '1', rule: 'Không bao giờ cầu xin', desc: 'Khách cảm nhận sự thiếu tự tin — deal chết ngay.' },
              { n: '2', rule: 'Luôn đặt câu hỏi mở', desc: '"Điều gì..." thay vì "Anh/chị có... không?" — kiểm soát hội thoại.' },
              { n: '3', rule: 'Silence is golden', desc: 'Sau khi hỏi, im lặng. Người nói trước là người thua.' },
              { n: '4', rule: 'Xác nhận timeline cụ thể', desc: 'Luôn đặt lịch follow-up — không bao giờ "khi nào xong thì báo".' },
              { n: '5', rule: 'Tập dượt thành phản xạ', desc: 'Script chỉ hiệu quả khi nói tự nhiên — luyện với đồng nghiệp trước.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                  {item.n}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{item.rule}</p>
                  <p className="text-slate-400 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upsell CTA — ẩn khi print để PDF không có sales pitch */}
        <div className="bg-gradient-to-br from-violet-900/60 to-slate-800/60 border border-violet-700/50 rounded-2xl p-6 text-center print:hidden">
          <div className="text-3xl mb-3">🧠</div>
          <h3 className="text-xl font-black text-white mb-2">
            Đây mới chỉ là 3/18+ kịch bản
          </h3>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            Bên trong <strong className="text-violet-400">Mind Sales Lab</strong> có thêm 15+ kịch bản cho mọi tình huống:
            cross-sell, upsell, cold call, follow-up, price anchor, và lộ trình 30 ngày
            để tăng tỷ lệ chốt đơn một cách hệ thống.
          </p>

          <div className="bg-slate-800/60 rounded-xl p-4 mb-5 text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gói thành viên đầy đủ gồm:</p>
            {[
              '18+ kịch bản bán hàng word-for-word',
              'Lộ trình 30 ngày tăng tỷ lệ chốt đơn',
              'Thư viện xử lý 50+ objection phổ biến',
              'Template email/Zalo follow-up tự động',
              'Cập nhật script mới mỗi tháng',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <span className="text-emerald-400 text-xs">✓</span>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Bonus offer — chỉ hiện trong 24h đầu (countdown ở sticky bar) */}
          <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-2 border-amber-500/40 rounded-xl px-4 py-4 mb-5 text-left">
            <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              🎁 Bonus đặc biệt 24h đầu
            </p>
            <p className="text-white font-bold text-sm leading-snug mb-1">
              30 phút audit 1-1 Zalo với sư phụ Sơn
            </p>
            <p className="text-amber-200 text-xs leading-relaxed">
              Anh kể 1 case khách đang stuck → em phân tích tâm lý + cho kịch bản custom riêng cho anh.
              <span className="text-amber-300 line-through ml-1">Giá 1.000.000đ</span>
              <span className="text-emerald-300 font-bold ml-1">→ MIỄN PHÍ kèm gói 99K hôm nay</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-slate-400 line-through text-sm">500.000đ/tháng</span>
            <span className="text-4xl font-black text-amber-400">99.000đ</span>
            <span className="text-slate-400 text-sm">/tháng</span>
          </div>
          <p className="text-center text-emerald-400 text-xs font-bold mb-4">
            ≈ 3.300đ/ngày — bằng 1 ly trà đá
          </p>

          <Link
            href="/register"
            className="block w-full bg-gradient-to-r from-violet-600 via-violet-700 to-amber-600 hover:from-violet-500 hover:via-violet-600 hover:to-amber-500 text-white font-black py-4 rounded-xl transition text-base shadow-2xl shadow-violet-900/60 mb-2 ring-2 ring-amber-500/30"
          >
            Mở Khóa 18+ Kịch Bản + Audit 1-1 — 99K →
          </Link>
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1"><span className="text-emerald-400">⚡</span>Kích hoạt tức thì</span>
            <span>·</span>
            <span className="flex items-center gap-1"><span className="text-emerald-400">🛡</span>Hoàn tiền 7 ngày</span>
            <span>·</span>
            <span className="flex items-center gap-1"><span className="text-emerald-400">✕</span>Hủy bất kỳ lúc nào</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center print:hidden">
          <p className="text-xs text-slate-500 mb-1">
            Cần hỗ trợ? Liên hệ Sơn trực tiếp:
          </p>
          <a href="tel:0961588227" className="text-sm font-bold text-violet-400 hover:text-violet-300 transition">
            📞 0961 588 227
          </a>
        </div>

        {/* Print-only footer (chỉ xuất hiện trong PDF) */}
        <div className="hidden print:block print:mt-8 print:text-center print:text-slate-600 print:text-xs">
          <p className="mb-1">© Mind Sales Lab — tamlyhocvn.club</p>
          <p>Liên hệ Sơn: 0961 588 227 | Toàn bộ 18+ kịch bản tại tamlyhocvn.club/register</p>
        </div>

      </div>

      {/* Sticky offer bar — hiện khi scroll, có countdown 24h + nút quick CTA */}
      <StickyOfferBar />

      {/* Padding bottom để sticky bar không che content cuối */}
      <div className="h-24 print:hidden" aria-hidden />
    </div>
  )
}

export default function FreeDownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DownloadContent />
    </Suspense>
  )
}
