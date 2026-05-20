export interface Testimonial {
  name: string
  role: string
  company: string
  avatar: string
  quote: string
  verifyUrl: string
}

export default function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div
      style={{
        border: '1px solid rgba(201,169,97,0.35)',
        borderRadius: 12,
        padding: 20,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Top row: avatar + quote */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={t.avatar}
          alt={t.name}
          width={56}
          height={56}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid rgba(201,169,97,0.5)',
          }}
          onError={e => {
            ;(e.currentTarget as HTMLImageElement).src =
              `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=C9A961&color=1C1917&size=56`
          }}
        />
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: '#44403C',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          &ldquo;{t.quote}&rdquo;
        </p>
      </div>

      {/* Bottom row: identity + verify link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#1C1917', margin: 0, lineHeight: 1.3 }}>
            {t.name}
          </p>
          <p style={{ fontSize: 12, color: '#78716C', margin: '2px 0 0', lineHeight: 1.3 }}>
            {t.role} · {t.company}
          </p>
        </div>
        <a
          href={t.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            color: '#78716C',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          className="hover:underline"
        >
          ✓ Verify trên Facebook ↗
        </a>
      </div>
    </div>
  )
}
