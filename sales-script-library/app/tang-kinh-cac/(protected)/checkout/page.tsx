import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getMemberSession } from '@/lib/auth'
import { getMember, saveMember } from '@/lib/data'
import TKCCheckoutClient from './TKCCheckoutClient'

export const dynamic = 'force-dynamic'

export default async function TKCCheckoutPage() {
  const session = getMemberSession()
  if (!session) redirect('/tang-kinh-cac/login')

  const member = await getMember(session.email)
  if (!member) redirect('/tang-kinh-cac/login')

  const kqEnrollment = member.enrollments?.['khau-quyet']

  // Already paid — redirect to dashboard
  if (kqEnrollment?.status === 'active') {
    redirect('/tang-kinh-cac/dashboard')
  }

  // Create pending enrollment if this is the first visit
  if (!kqEnrollment) {
    await saveMember({
      ...member,
      enrollments: {
        ...member.enrollments,
        'khau-quyet': {
          status: 'pending',
          enrolledAt: new Date().toISOString(),
          source: 'paid',
        },
      },
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #040e1c 0%, #091b30 60%, #0f2744 100%)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap');
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(201,169,97,0.12)', background: '#040e1c' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '1rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/tang-kinh-cac/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#C9A961' }}>⚜</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 700, color: '#FEF7E6' }}>Tàng Kinh Các</span>
          </Link>
          <span style={{ fontSize: '0.75rem', color: '#a09070' }}>
            Chào, <span style={{ color: '#FEF7E6' }}>{session.name.split(' ').pop()}</span>
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Product header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.25rem' }}>
            Khẩu Quyết Phá Phản Đối
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#a09070', marginBottom: '0.5rem' }}>
            10 câu trả lời chuẩn cho 10 phản đối kinh điển nhất
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(201,169,97,0.15)', border: '1px solid rgba(201,169,97,0.4)', borderRadius: '0.375rem', padding: '0.375rem 1rem', color: '#C9A961', fontWeight: 700, fontSize: '1.25rem', fontFamily: "'Cormorant Garamond', serif" }}>
            199.000đ
          </div>
        </div>

        {/* Payment card */}
        <div style={{ background: '#0f2744', border: '1px solid rgba(201,169,97,0.2)', borderRadius: '0.875rem', padding: '1.5rem' }}>
          <TKCCheckoutClient email={session.email} name={session.name} />
        </div>

        {/* Trust badges */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {['🔒 Bảo mật', '✓ Hoàn tiền 7 ngày', '⚡ Kích hoạt < 30 giây'].map(t => (
            <span key={t} style={{ fontSize: '0.75rem', color: '#a09070' }}>{t}</span>
          ))}
        </div>

        {/* Footer nav */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/tang-kinh-cac/dashboard" style={{ fontSize: '0.8125rem', color: '#a09070', textDecoration: 'none' }}>
            ← Về Tàng Kinh Các
          </Link>
        </div>
      </main>
    </div>
  )
}
