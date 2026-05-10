import { AUTHOR_BIO } from '@/lib/author-bio'

interface Props {
  /** full = section đầy đủ trên homepage; compact = card gọn cho /free/download */
  variant?: 'full' | 'compact'
  /** Theme: light cho homepage, dark cho /free/download */
  theme?: 'light' | 'dark'
}

export default function AuthorBio({ variant = 'full', theme = 'light' }: Props) {
  if (variant === 'compact') return <CompactBio theme={theme} />
  return <FullBio theme={theme} />
}

// ── Compact variant — dùng trong trang đọc tài liệu ────────────────────────

function CompactBio({ theme }: { theme: 'light' | 'dark' }) {
  const isDark = theme === 'dark'
  return (
    <div
      className={`my-8 rounded-2xl p-5 sm:p-6 print:hidden ${
        isDark
          ? 'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700'
          : 'bg-white border border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center text-base font-black text-white shrink-0`}
        >
          {AUTHOR_BIO.initials}
        </div>
        <div className="flex-1">
          <p
            className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${
              isDark ? 'text-amber-400' : 'text-violet-600'
            }`}
          >
            ✍️ Tác giả
          </p>
          <h3
            className={`font-black text-base sm:text-lg mb-0.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {AUTHOR_BIO.fullName}{' '}
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ({AUTHOR_BIO.alias})
            </span>
          </h3>
          <p
            className={`text-sm font-semibold mb-2 ${
              isDark ? 'text-violet-300' : 'text-violet-600'
            }`}
          >
            {AUTHOR_BIO.primaryRole}
          </p>
          <p
            className={`text-sm leading-relaxed mb-3 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {AUTHOR_BIO.shortBio}
          </p>

          {/* Press logos inline */}
          <div className="flex items-center flex-wrap gap-2 text-[11px]">
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Đã xuất hiện trên:</span>
            {AUTHOR_BIO.press.slice(0, 2).map((p) => (
              <a
                key={p.publisher}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold px-2 py-0.5 rounded-md transition ${
                  isDark
                    ? 'text-slate-200 bg-slate-700 hover:bg-slate-600'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {p.publisher}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Full variant — section to trên homepage ───────────────────────────────

function FullBio({ theme }: { theme: 'light' | 'dark' }) {
  const isDark = theme === 'dark'
  return (
    <section
      className={`py-16 px-4 ${
        isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <p
          className={`text-center text-xs uppercase tracking-widest font-bold mb-3 ${
            isDark ? 'text-amber-400' : 'text-violet-600'
          }`}
        >
          ✍️ Về tác giả
        </p>
        <h2
          className={`text-center text-3xl sm:text-4xl font-extrabold mb-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {AUTHOR_BIO.fullName}{' '}
          <span className="text-xl font-medium opacity-60">({AUTHOR_BIO.alias})</span>
        </h2>
        <p
          className={`text-center text-lg sm:text-xl font-semibold mb-2 ${
            isDark ? 'text-violet-300' : 'text-violet-600'
          }`}
        >
          {AUTHOR_BIO.primaryRole}
        </p>
        <p
          className={`text-center text-sm sm:text-base mb-10 max-w-2xl mx-auto ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {AUTHOR_BIO.headline}
        </p>

        {/* Mission quote */}
        <blockquote
          className={`text-center max-w-2xl mx-auto mb-10 px-6 py-5 rounded-2xl border-l-4 ${
            isDark
              ? 'bg-violet-900/20 border-violet-400 text-slate-200'
              : 'bg-violet-50 border-violet-500 text-slate-700'
          }`}
        >
          <p className="text-base sm:text-lg italic leading-relaxed">
            &ldquo;{AUTHOR_BIO.mission}&rdquo;
          </p>
        </blockquote>

        {/* Credentials grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {AUTHOR_BIO.credentials.map((c, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border ${
                isDark
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{c.icon}</span>
                <div>
                  <h3 className={`font-bold mb-1 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {c.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {c.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bridge */}
        <div
          className={`max-w-3xl mx-auto p-6 rounded-2xl mb-10 ${
            isDark ? 'bg-amber-900/20 border border-amber-700/40' : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <p className={`text-xs uppercase tracking-widest font-bold mb-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            🌉 Cầu nối với tamlyhocvn.club
          </p>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            {AUTHOR_BIO.bridgeToProduct}
          </p>
        </div>

        {/* Press mentions */}
        <div>
          <p
            className={`text-center text-xs uppercase tracking-widest font-bold mb-4 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Đã xuất hiện trên truyền thông
          </p>
          <div className="flex items-center justify-center flex-wrap gap-3">
            {AUTHOR_BIO.press.map((p) => (
              <a
                key={p.publisher}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                    : 'bg-white hover:bg-slate-50 border border-slate-200'
                }`}
                title={p.title}
              >
                <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {p.publisher}
                </span>
                {p.date && (
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {p.date}
                  </span>
                )}
                <span
                  className={`text-xs opacity-0 group-hover:opacity-100 transition ${
                    isDark ? 'text-violet-400' : 'text-violet-600'
                  }`}
                >
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-10">
          <a
            href={`tel:${AUTHOR_BIO.contact.phone.replace(/\s/g, '')}`}
            className={`inline-flex items-center gap-2 text-sm font-bold ${
              isDark ? 'text-violet-300 hover:text-violet-200' : 'text-violet-600 hover:text-violet-700'
            }`}
          >
            📞 {AUTHOR_BIO.contact.phone}
          </a>
        </div>
      </div>
    </section>
  )
}
