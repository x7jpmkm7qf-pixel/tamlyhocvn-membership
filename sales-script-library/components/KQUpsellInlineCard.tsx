import Link from 'next/link'

type Variant = 'after-framework' | 'mid-journey' | 'final-peak'

const CONTENT: Record<Variant, {
  label: string
  heading: string
  body: string
  primaryBtn: string
  secondaryHref?: string
  secondaryBtn?: string
}> = {
  'after-framework': {
    label: '⚜ Bước Tiếp Theo',
    heading: '📖 Đệ tử vừa nắm 4 Archetype',
    body: 'Đây mới là bản đồ. Khẩu Quyết chỉ rõ cách vận dụng từng archetype trong từng tình huống cụ thể — script gọi điện, email, in-person, objection handling.',
    primaryBtn: 'Khai mở Khẩu Quyết — 199k',
  },
  'mid-journey': {
    label: '⚜ Bước Tiếp Theo',
    heading: '🔓 Đệ tử đã đi được nửa đường',
    body: 'Bản Đồ giúp đệ tử NHẬN DIỆN khách. Khẩu Quyết là KIẾM PHÁP — chiến thuật thực chiến đã được khoa học hành vi kiểm chứng.',
    primaryBtn: 'Khai mở Khẩu Quyết — 199k',
  },
  'final-peak': {
    label: '⚜ Hoàn Thành Bản Đồ',
    heading: '🏆 Sư huynh đã hoàn thành Bản Đồ 4 Loại Khách Hàng',
    body: 'Đây là nền tảng. Bước kế tiếp là Khẩu Quyết — 12 chương kiếm pháp thâm sâu, từ kịch bản mở đầu đến chốt deal, từ objection handling đến tạo urgency có đạo đức.',
    primaryBtn: 'Khai mở Khẩu Quyết — 199k',
    secondaryBtn: 'Quay lại đầu Bản Đồ',
    secondaryHref: '/tang-kinh-cac/khoa-hoc/ban-do/ban-do-ch-00',
  },
}

export default function KQUpsellInlineCard({ variant }: { variant: Variant }) {
  const c = CONTENT[variant]
  const isFinal = variant === 'final-peak'

  return (
    <div style={{
      margin: `${isFinal ? '3.5rem' : '2.5rem'} 0 ${isFinal ? '1rem' : '0'}`,
      background: isFinal
        ? 'linear-gradient(135deg, #091b30 0%, #0f2744 100%)'
        : 'rgba(201,169,97,0.06)',
      border: `1px solid rgba(201,169,97,${isFinal ? '0.4' : '0.22'})`,
      borderRadius: isFinal ? '1rem' : '0.75rem',
      padding: isFinal ? '2rem 1.75rem' : '1.5rem 1.5rem',
    }}>
      <div style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#C9A961',
        marginBottom: '0.625rem',
      }}>
        {c.label}
      </div>

      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: isFinal ? '1.375rem' : '1.0625rem',
        fontWeight: 700,
        color: '#FEF7E6',
        lineHeight: 1.3,
        marginBottom: '0.75rem',
      }}>
        {c.heading}
      </div>

      <p style={{
        fontSize: isFinal ? '1rem' : '0.9375rem',
        color: '#e8dcc8',
        lineHeight: 1.7,
        marginBottom: '1.25rem',
      }}>
        {c.body}
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Link
          href="/tang-kinh-cac/checkout"
          style={{
            display: 'inline-block',
            background: '#C9A961',
            color: '#040e1c',
            fontWeight: 700,
            fontSize: isFinal ? '1rem' : '0.9375rem',
            padding: isFinal ? '0.875rem 1.75rem' : '0.75rem 1.375rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {c.primaryBtn}
        </Link>

        {c.secondaryBtn && c.secondaryHref && (
          <Link
            href={c.secondaryHref}
            style={{
              display: 'inline-block',
              background: 'transparent',
              color: '#a09070',
              fontWeight: 600,
              fontSize: '0.9375rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              border: '1px solid rgba(201,169,97,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            {c.secondaryBtn}
          </Link>
        )}
      </div>
    </div>
  )
}
