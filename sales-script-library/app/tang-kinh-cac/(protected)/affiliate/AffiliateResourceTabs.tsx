'use client'
import { useState } from 'react'

const gold = '#C9A961'
const dark = '#040e1c'
const mid = '#0f2744'
const muted = '#a09070'
const text = '#FEF7E6'

interface Props {
  affLink: string
}

const CAPTIONS = [
  {
    label: 'Chia sẻ chân thật',
    body: `Mình mới khám phá ra bộ khẩu quyết phá phản đối khách hàng — 10 chiêu thức cực mạnh để chốt sale khi khách nói "đắt quá", "để suy nghĩ thêm", "cần hỏi vợ"...
Chỉ 199k mà giá trị bằng cả khóa học triệu bạc.
Bạn nào làm sales/kinh doanh nên đầu tư: {LINK}`,
  },
  {
    label: 'Case study',
    body: `Tuần trước mình áp dụng 1 chiêu trong "Tàng Kinh Các" — khách đang định bỏ deal, mình hoán cái khung so sánh, ổng chốt liền 50tr.
199k cho 10 khẩu quyết — rẻ nhất quả đất rồi: {LINK}`,
  },
  {
    label: 'Câu hỏi tò mò',
    body: `Bạn có biết tại sao khách nói "đắt quá" KHÔNG PHẢI vì giá không?
Mình mới đọc xong bộ khẩu quyết Tàng Kinh Các — giải thích đúng tâm lý khách + cho luôn câu trả lời để chốt. 199k thôi: {LINK}`,
  },
  {
    label: 'Giọng kiếm hiệp',
    body: `Huynh đệ làm sales — đã đến lúc luyện "Khẩu Quyết Phá Phản Đối".
10 chiêu thức tâm pháp, dùng được cả đời. 199k nhập môn: {LINK}`,
  },
  {
    label: 'List bullet',
    body: `Bộ khẩu quyết 199k giải quyết:
✅ Khách nói "đắt quá" → Hoán khung
✅ Khách "để suy nghĩ" → Định thần
✅ Khách "cần hỏi vợ/sếp" → Đồng hành
✅ Khách "không có thời gian" → Đảo thời
+ 6 chiêu thức nữa
Vào học ngay: {LINK}`,
  },
]

const BANNERS = [
  { label: 'Story Zalo/FB/IG', size: '1080×1920', ratio: '9:16', desc: 'Dọc — dùng cho Story' },
  { label: 'Post vuông', size: '1080×1080', ratio: '1:1', desc: 'Vuông — dùng cho Feed' },
  { label: 'Post FB ngang', size: '1200×630', ratio: '1.9:1', desc: 'Ngang — dùng cho Post FB' },
]

function CaptionCard({ caption, affLink }: { caption: typeof CAPTIONS[0]; affLink: string }) {
  const [copied, setCopied] = useState(false)
  const fullText = caption.body.replace('{LINK}', affLink)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div style={{
      background: dark, border: '1px solid rgba(201,169,97,0.15)',
      borderRadius: '0.75rem', padding: '1rem',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,169,97,0.4)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,169,97,0.15)')}
    >
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
        {caption.label}
      </div>
      <p style={{ color: muted, fontSize: '0.8125rem', lineHeight: 1.7, marginBottom: '0.875rem', whiteSpace: 'pre-line' }}>
        {caption.body.replace('{LINK}', affLink)}
      </p>
      <button
        onClick={copy}
        style={{
          background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(201,169,97,0.12)',
          border: `1px solid ${copied ? 'rgba(52,211,153,0.4)' : 'rgba(201,169,97,0.3)'}`,
          borderRadius: '0.375rem', padding: '0.375rem 0.875rem',
          color: copied ? '#34d399' : gold, fontWeight: 700, fontSize: '0.8125rem',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        {copied ? '✓ Đã copy!' : '📋 Copy caption'}
      </button>
    </div>
  )
}

export default function AffiliateResourceTabs({ affLink }: Props) {
  const [tab, setTab] = useState<'caption' | 'banner' | 'guide'>('caption')

  const tabStyle = (active: boolean) => ({
    padding: '0.5rem 1.125rem',
    fontSize: '0.8125rem', fontWeight: 700,
    borderRadius: '0.375rem',
    border: active ? `1px solid rgba(201,169,97,0.5)` : '1px solid transparent',
    background: active ? 'rgba(201,169,97,0.12)' : 'transparent',
    color: active ? gold : muted,
    cursor: 'pointer' as const,
    transition: 'all 0.15s',
  })

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Section header */}
      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: gold, marginBottom: '1rem' }}>
        📚 Tài Liệu Hỗ Trợ Giới Thiệu
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button style={tabStyle(tab === 'caption')} onClick={() => setTab('caption')}>📝 Caption mẫu</button>
        <button style={tabStyle(tab === 'banner')} onClick={() => setTab('banner')}>🖼 Banner</button>
        <button style={tabStyle(tab === 'guide')} onClick={() => setTab('guide')}>📖 Hướng dẫn</button>
      </div>

      {/* Tab 1 — Captions */}
      {tab === 'caption' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {CAPTIONS.map(c => <CaptionCard key={c.label} caption={c} affLink={affLink} />)}
        </div>
      )}

      {/* Tab 2 — Banners */}
      {tab === 'banner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {BANNERS.map(b => (
            <div key={b.label} style={{ background: dark, border: '1px solid rgba(201,169,97,0.15)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, color: text, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{b.label}</div>
                <div style={{ color: muted, fontSize: '0.8125rem' }}>{b.size} · Tỉ lệ {b.ratio}</div>
                <div style={{ color: muted, fontSize: '0.75rem', marginTop: '0.125rem' }}>{b.desc}</div>
              </div>
              <div style={{
                background: 'rgba(201,169,97,0.08)', border: '1px dashed rgba(201,169,97,0.3)',
                borderRadius: '0.5rem', padding: '0.625rem 1.25rem',
                color: muted, fontSize: '0.8125rem', fontStyle: 'italic',
                whiteSpace: 'nowrap',
              }}>
                🖼 Sắp có
              </div>
            </div>
          ))}
          <p style={{ color: muted, fontSize: '0.8125rem', fontStyle: 'italic', textAlign: 'center', marginTop: '0.25rem' }}>
            Banner sẽ được cập nhật sớm — theo dõi nhóm Zalo để nhận thông báo.
          </p>
        </div>
      )}

      {/* Tab 3 — Guide */}
      {tab === 'guide' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
            {[
              { step: '01', title: 'Copy link affiliate', desc: 'Lấy link giới thiệu riêng của bạn ở phía trên trang này.' },
              { step: '02', title: 'Chọn caption phù hợp', desc: 'Dùng tab "Caption mẫu" để chọn nội dung phù hợp với Zalo, Facebook hoặc TikTok.' },
              { step: '03', title: 'Đăng và nhận hoa hồng', desc: 'Đăng lên trang cá nhân. Khi có người mua qua link của bạn, hoa hồng vào ví ngay lập tức.' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: dark, border: '1px solid rgba(201,169,97,0.15)', borderRadius: '0.75rem', padding: '1rem' }}>
                <div style={{ flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(201,169,97,0.15)', border: '1px solid rgba(201,169,97,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: gold, fontSize: '0.875rem' }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: text, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{s.title}</div>
                  <div style={{ color: muted, fontSize: '0.8125rem', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Video placeholder */}
          <div style={{
            background: dark, border: '1px dashed rgba(201,169,97,0.3)',
            borderRadius: '0.75rem', padding: '2.5rem 1rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>▶️</div>
            <div style={{ color: text, fontWeight: 700, marginBottom: '0.375rem' }}>Video hướng dẫn chi tiết</div>
            <div style={{ color: muted, fontSize: '0.8125rem' }}>Sắp có — đang quay và biên tập</div>
          </div>
        </div>
      )}
    </div>
  )
}
