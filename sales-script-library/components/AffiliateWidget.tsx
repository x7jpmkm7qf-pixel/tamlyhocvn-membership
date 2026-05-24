import Link from 'next/link'

interface Props {
  availableTotal: number
}

export default function AffiliateWidget({ availableTotal }: Props) {
  return (
    <div style={{
      margin: '1rem 0.75rem 0',
      padding: '0.875rem 1rem',
      background: '#061525',
      border: '1px solid rgba(201,169,97,0.3)',
      borderRadius: '0.625rem',
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C9A961', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
        💰 Kiếm tiền cùng TKC
      </div>
      <div style={{ fontSize: '0.75rem', color: '#a09070', lineHeight: 1.5, marginBottom: '0.5rem' }}>
        Giới thiệu huynh đệ → <span style={{ color: '#FEF7E6', fontWeight: 600 }}>101k/đơn</span>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#a09070', marginBottom: '0.625rem' }}>
        Số dư: <strong style={{ color: '#C9A961' }}>{availableTotal.toLocaleString('vi-VN')}đ</strong>
      </div>
      <Link
        href="/tang-kinh-cac/affiliate"
        style={{ fontSize: '0.75rem', color: '#C9A961', fontWeight: 700, textDecoration: 'none' }}
      >
        Xem chi tiết →
      </Link>
    </div>
  )
}
