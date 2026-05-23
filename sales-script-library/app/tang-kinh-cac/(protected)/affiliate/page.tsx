import Link from 'next/link'
import { getMemberSession } from '@/lib/auth'
import { getMember } from '@/lib/data'
import { ensureAffiliateCode, getAffiliateStats } from '@/lib/affiliate'
import AffiliatePayoutForm from './AffiliatePayoutForm'
import AffiliateLinkCopyClient from './AffiliateLinkCopyClient'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tamlyhocvn.club'

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function AffiliatePage() {
  const session = getMemberSession()!
  const member = await getMember(session.email)

  const isPaid = member?.enrollments?.['khau-quyet']?.status === 'active' || member?.status === 'active'

  const affCode = isPaid ? await ensureAffiliateCode(session.email) : (member?.affiliate_code ?? null)
  const stats = affCode ? await getAffiliateStats(session.email) : null

  const affLink = affCode ? `${BASE_URL}/r/${affCode}` : null

  return (
    <div className="min-h-screen" style={{ background: '#091b30' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap');`}</style>

      <header style={{ borderBottom: '1px solid rgba(201,169,97,0.12)', background: '#040e1c' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/tang-kinh-cac/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#C9A961' }}>⚜</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 700, color: '#FEF7E6' }}>Tàng Kinh Các</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#C9A961', fontWeight: 700 }}>💰 Hoa hồng</span>
            <Link href="/dashboard" style={{ fontSize: '0.75rem', color: '#a09070', textDecoration: 'none' }}>
              Library cũ →
            </Link>
            <span style={{ fontSize: '0.875rem', color: '#a09070' }}>
              Chào, <span style={{ color: '#FEF7E6' }}>{session.name.split(' ').pop()}</span>
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.375rem' }}>
            Chương Trình Giới Thiệu
          </h1>
          <p style={{ color: '#a09070', fontSize: '0.9375rem' }}>
            Giới thiệu bạn bè mua Khẩu Quyết — nhận hoa hồng ngay khi họ thanh toán.
          </p>
        </div>

        {!isPaid ? (
          <div style={{ background: '#0f2744', border: '1px solid rgba(201,169,97,0.2)', borderRadius: '0.875rem', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📜</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 700, color: '#FEF7E6', marginBottom: '0.5rem' }}>
              Mua Khẩu Quyết để tham gia
            </div>
            <p style={{ color: '#a09070', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              Chỉ thành viên đã mua Khẩu Quyết mới có thể tham gia chương trình giới thiệu.
            </p>
            <Link href="/tang-kinh-cac/checkout" style={{ display: 'inline-block', background: '#C9A961', color: '#040e1c', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '0.5rem', textDecoration: 'none' }}>
              Mua Khẩu Quyết 199.000đ →
            </Link>
          </div>
        ) : (
          <>
            {/* Commission tiers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Giới thiệu 1–29 người', rate: '101.000đ/đơn', active: (stats?.totalReferrals ?? 0) < 30 },
                { label: 'Giới thiệu từ 30 người', rate: '150.000đ/đơn', active: (stats?.totalReferrals ?? 0) >= 30 },
              ].map(tier => (
                <div key={tier.label} style={{ background: tier.active ? 'rgba(201,169,97,0.12)' : '#0a1e35', border: `1px solid ${tier.active ? 'rgba(201,169,97,0.5)' : 'rgba(201,169,97,0.15)'}`, borderRadius: '0.75rem', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#a09070', marginBottom: '0.25rem' }}>{tier.label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 700, color: tier.active ? '#C9A961' : '#a09070' }}>{tier.rate}</div>
                  {tier.active && <div style={{ fontSize: '0.7rem', color: '#C9A961', marginTop: '0.25rem' }}>▲ Đang áp dụng</div>}
                </div>
              ))}
            </div>

            {/* Stats row */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Đã giới thiệu', value: `${stats.totalReferrals} người` },
                  { label: 'Tổng đã kiếm',  value: fmt(stats.totalEarned) },
                  { label: 'Có thể rút',    value: fmt(stats.availableTotal), gold: true },
                ].map(s => (
                  <div key={s.label} style={{ background: '#0f2744', border: '1px solid rgba(201,169,97,0.15)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>{s.label}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 700, color: s.gold ? '#C9A961' : '#FEF7E6' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Affiliate link */}
            {affLink && (
              <div style={{ background: '#0f2744', border: '1px solid rgba(201,169,97,0.25)', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
                  Link giới thiệu của bạn
                </div>
                <AffiliateLinkCopyClient link={affLink} />
                <p style={{ fontSize: '0.8125rem', color: '#a09070', marginTop: '0.75rem', lineHeight: 1.6 }}>
                  Chia sẻ link này. Khi ai mua qua link của bạn, hoa hồng vào tài khoản ngay lập tức.
                </p>
              </div>
            )}

            {/* Payout section */}
            {stats && (
              <div style={{ marginBottom: '1.5rem' }}>
                {stats.pendingPayout ? (
                  <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#fde047', marginBottom: '0.25rem' }}>⏳ Đang chờ xử lý</div>
                    <p style={{ color: '#a09070', fontSize: '0.875rem' }}>
                      Yêu cầu rút <strong style={{ color: '#FEF7E6' }}>{fmt(stats.pendingPayout.total_amount)}</strong> đang được admin xử lý.
                      Thường 1–3 ngày làm việc.
                    </p>
                  </div>
                ) : (
                  <AffiliatePayoutForm
                    availableTotal={stats.availableTotal}
                    minWithdrawal={stats.MIN_WITHDRAWAL}
                  />
                )}
              </div>
            )}

            {/* Commission history */}
            {stats && stats.commissions.length > 0 && (
              <div style={{ background: '#0f2744', border: '1px solid rgba(201,169,97,0.15)', borderRadius: '0.875rem', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a09070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                  Lịch sử hoa hồng
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[...stats.commissions].reverse().map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: '#040e1c', borderRadius: '0.5rem', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8125rem', color: '#FEF7E6' }}>
                          #{c.referral_number} · {c.buyer_email}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#a09070' }}>{fmtDate(c.created_at)}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: c.status === 'clawback' ? '#f87171' : c.status === 'paid_out' ? '#a09070' : '#C9A961' }}>
                          {c.status === 'clawback' ? '-' : '+'}{fmt(c.commission_amount)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: c.status === 'clawback' ? '#f87171' : c.status === 'paid_out' ? '#a09070' : '#34d399' }}>
                          {c.status === 'available' ? '✓ Có thể rút' : c.status === 'paid_out' ? 'Đã thanh toán' : 'Clawback'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats && stats.commissions.length === 0 && (
              <div style={{ background: '#0f2744', border: '1px solid rgba(201,169,97,0.15)', borderRadius: '0.875rem', padding: '2rem', textAlign: 'center' }}>
                <div style={{ color: '#a09070', fontSize: '0.9375rem' }}>
                  Chưa có ai mua qua link của bạn. Hãy bắt đầu chia sẻ!
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Link href="/tang-kinh-cac/dashboard" style={{ fontSize: '0.8125rem', color: '#a09070', textDecoration: 'none' }}>
            ← Về Tàng Kinh Các
          </Link>
        </div>
      </main>
    </div>
  )
}
