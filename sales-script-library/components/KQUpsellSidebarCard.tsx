import Link from 'next/link'

export default function KQUpsellSidebarCard() {
  return (
    <div style={{
      margin: '1rem 0.75rem 0.5rem',
      background: '#050E1A',
      border: '1px solid rgba(201,169,97,0.5)',
      borderRadius: '0.5rem',
      padding: '1rem',
    }}>
      <div style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#C9A961',
        marginBottom: '0.5rem',
      }}>
        ⚜ Khẩu Quyết
      </div>

      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '0.9375rem',
        fontWeight: 700,
        color: '#FEF7E6',
        lineHeight: 1.3,
        marginBottom: '0.375rem',
      }}>
        12 chương bí kíp thâm sâu hơn
      </div>

      <div style={{
        fontSize: '0.7rem',
        color: '#a09070',
        lineHeight: 1.5,
        marginBottom: '0.875rem',
      }}>
        Cialdini · Kahneman · Ariely cited
      </div>

      <Link
        href="/tang-kinh-cac/checkout"
        style={{
          display: 'block',
          background: '#C9A961',
          color: '#040e1c',
          fontWeight: 700,
          fontSize: '0.8125rem',
          padding: '0.5625rem 0.75rem',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          textAlign: 'center',
        }}
      >
        Khai mở — 199k →
      </Link>
    </div>
  )
}
