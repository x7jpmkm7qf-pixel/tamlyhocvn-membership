'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { INDUSTRY_LABELS, SITUATION_LABELS, INDUSTRY_COLORS, SITUATION_COLORS } from '@/lib/constants'

interface Script {
  id: string
  title: string
  industry: string
  situation: string
  preview: string
  content: string
  psychology: string
  examples: string
  createdAt: string
  templates?: { zalo: string; facebook: string; direct: string }
  expectedResult?: string
}

interface Session {
  member: { id: string; name: string; email: string } | null
  isAdmin: boolean
}

function renderMarkdown(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
        return <p key={i} className="font-bold text-violet-700 mt-4 mb-1">{line.slice(2, -2)}</p>
      }
      if (line.startsWith('---')) {
        return <hr key={i} className="border-slate-200 my-4" />
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="text-slate-700 ml-4 list-disc">{renderInline(line.slice(2))}</li>
      }
      if (line.match(/^✅|^⚠️|^❌|^👉|^📌|^🔑/)) {
        return <p key={i} className="text-slate-700 my-1">{renderInline(line)}</p>
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />
      }
      return <p key={i} className="text-slate-700 leading-relaxed">{renderInline(line)}</p>
    })
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function ScriptDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [script, setScript] = useState<Script | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'content' | 'psychology' | 'examples' | 'templates'>('content')
  const [copied, setCopied] = useState(false)
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setSession)
  }, [])

  useEffect(() => {
    if (session === null) return
    fetch(`/api/scripts/${id}`)
      .then(async r => {
        const data = await r.json()
        if (!r.ok) { setError(data.error); return }
        setScript(data)
      })
  }, [id, session])

  const copyScript = () => {
    if (!script) return
    navigator.clipboard.writeText(script.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyTemplate = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTemplate(key)
    setTimeout(() => setCopiedTemplate(null), 2000)
  }

  const isLoggedIn = session?.member || session?.isAdmin

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {session?.member && (
        <div className="watermark-text" aria-hidden="true">
          {session.member.email} • Thành viên
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4 transition font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại thư viện
        </Link>

        {!isLoggedIn && !script ? (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Yêu cầu đăng nhập</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Vui lòng đăng nhập thành viên để xem kịch bản đầy đủ với phân tích tâm lý và ví dụ áp dụng.
            </p>
            <Link
              href="/login"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-violet-200"
            >
              Đăng nhập ngay
            </Link>
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-8 text-center border border-red-200">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 font-medium">{error}</p>
            {error.includes('đăng nhập') && (
              <Link href="/login" className="mt-4 inline-block text-violet-600 underline text-sm">Đăng nhập</Link>
            )}
          </div>
        ) : !script ? (
          <div className="space-y-4">
            <div className="h-8 skeleton rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-5 w-24 skeleton rounded-full" />
              <div className="h-5 w-28 skeleton rounded-full" />
            </div>
            <div className="glass rounded-2xl p-6 space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="h-3 skeleton rounded" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="glass rounded-2xl p-5 mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${INDUSTRY_COLORS[script.industry as keyof typeof INDUSTRY_COLORS]}`}>
                  {INDUSTRY_LABELS[script.industry as keyof typeof INDUSTRY_LABELS]}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${SITUATION_COLORS[script.situation as keyof typeof SITUATION_COLORS]}`}>
                  {SITUATION_LABELS[script.situation as keyof typeof SITUATION_LABELS]}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">{script.title}</h1>
              <p className="text-sm text-amber-800 leading-relaxed bg-amber-50 border border-amber-200 rounded-xl p-3">
                {script.preview}
              </p>
            </div>

            {/* Tabs */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex border-b border-slate-200 overflow-x-auto">
                {[
                  { key: 'content', label: '📝 Kịch bản' },
                  { key: 'psychology', label: '🧠 Tâm lý học' },
                  { key: 'examples', label: '💡 Ví dụ' },
                  ...(script?.templates ? [{ key: 'templates', label: '💬 Tin nhắn mẫu' }] : []),
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`shrink-0 flex-1 py-3 px-2 text-xs sm:text-sm font-semibold transition border-b-2 ${
                      activeTab === tab.key
                        ? 'border-violet-600 text-violet-700 bg-violet-50'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'content' && (
                  <div>
                    <div className="flex justify-end mb-3">
                      <button
                        onClick={copyScript}
                        className="text-xs flex items-center gap-1.5 text-slate-600 hover:text-violet-600 bg-slate-100 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 px-3 py-1.5 rounded-lg transition font-medium"
                      >
                        {copied ? '✅ Đã copy' : '📋 Copy kịch bản'}
                      </button>
                    </div>
                    <div className="space-y-1 text-sm">{renderMarkdown(script.content)}</div>
                    {script.expectedResult && (
                      <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-emerald-700 mb-1">🎯 KẾT QUẢ KỲ VỌNG</p>
                        <p className="text-sm text-emerald-800 leading-relaxed">{script.expectedResult}</p>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'psychology' && (
                  <div className="space-y-1 text-sm">{renderMarkdown(script.psychology)}</div>
                )}
                {activeTab === 'examples' && (
                  <div className="space-y-1 text-sm">{renderMarkdown(script.examples)}</div>
                )}
                {activeTab === 'templates' && script.templates && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">Copy tin nhắn mẫu và điều chỉnh theo tình huống thực tế.</p>
                    {([
                      { key: 'zalo', label: 'Zalo', icon: '💬', border: 'border-blue-200', bg: 'bg-blue-50', title: 'text-blue-700', text: 'text-blue-900' },
                      { key: 'facebook', label: 'Facebook Messenger', icon: '📘', border: 'border-indigo-200', bg: 'bg-indigo-50', title: 'text-indigo-700', text: 'text-indigo-900' },
                      { key: 'direct', label: 'Trực tiếp / Điện thoại', icon: '🎙️', border: 'border-amber-200', bg: 'bg-amber-50', title: 'text-amber-700', text: 'text-amber-900' },
                    ] as const).map(({ key, label, icon, border, bg, title, text }) => (
                      <div key={key} className={`border rounded-xl p-4 ${border} ${bg}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-xs font-bold uppercase tracking-wide ${title}`}>{icon} {label}</p>
                          <button
                            onClick={() => copyTemplate(key, script.templates![key])}
                            className="text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition font-medium"
                          >
                            {copiedTemplate === key ? '✅ Đã copy' : '📋 Copy'}
                          </button>
                        </div>
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${text}`}>{script.templates?.[key]}</p>
                      </div>
                    ))}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                      💡 <strong className="text-slate-700">Lưu ý:</strong> Điều chỉnh tên, hoàn cảnh, và giọng điệu cho phù hợp với từng khách hàng cụ thể.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {session?.isAdmin && (
              <div className="mt-4 text-center">
                <Link
                  href={`/admin?edit=${script.id}`}
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 glass border border-slate-200 hover:border-violet-300 px-4 py-2 rounded-xl transition font-medium"
                >
                  ✏️ Chỉnh sửa kịch bản này
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
