'use client'

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'tieude_chat_history_v1'
const SESSION_KEY = 'tieude_session_greeted_v1'
const MAX_HISTORY = 30
const DEFAULT_QUICK_REPLIES = ['📜 Nhận nhiệm vụ', '🗺 Lộ trình', '❓ Hỏi tiểu đệ']

export interface TieuDeContext {
  user_name?: string
  user_gender?: 'm' | 'f' | 'unknown'
  streak_days?: number
  today_missions?: string[]
  completed_today?: string[]
  current_lesson?: string
  last_visit?: string
  lesson_kb?: string
}

interface Props {
  context: TieuDeContext
  apiPath?: string
  autoOpenDelayMs?: number
}

type HistoryItem =
  | { role: 'user' | 'bot'; content: string }
  | { role: 'quick'; options: string[] }

function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(h: HistoryItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(-MAX_HISTORY)))
  } catch {}
}

function buildGreeting(ctx: TieuDeContext): string {
  const xh = ctx.user_gender === 'f' ? 'sư tỷ' : 'sư huynh'
  const namePart =
    ctx.user_name && ctx.user_name !== 'Sư huynh' ? ' ' + ctx.user_name : ''

  if ((ctx.streak_days || 0) >= 3) {
    return `🔥 ${xh}${namePart} trở lại rồi! Liên tiếp ${ctx.streak_days} ngày — sư phụ chắc chắn đang để mắt tới ${xh} đấy.\nHôm nay tiểu đệ giúp gì được nào?`
  }
  if (!ctx.last_visit || ctx.last_visit === 'lần đầu') {
    return `🙇‍♂️ Tiểu đệ xin ra mắt ${xh}${namePart}!\nEm là Tiểu Đệ — đệ tử của sư phụ Hán Văn Sơn. Sư phụ bận luyện công nên giao em hầu hạ ${xh} trong ngày đầu nhập môn.\nCần gì cứ chat — em sẵn sàng 24/7! 🙏`
  }
  return `🌸 ${xh}${namePart} tới rồi! Tiểu đệ pha sẵn trà rồi đây ☕\nHôm nay ${xh} muốn tu luyện gì?`
}

export default function TieuDeChatbot({
  context,
  apiPath = '/api/tieude',
  autoOpenDelayMs = 3000,
}: Props) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [hasNotification, setHasNotification] = useState(false)
  const msgsRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hasGreeted = useRef(false)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
    setHasNotification(true)
    const t = setTimeout(() => setOpen(true), autoOpenDelayMs)
    return () => clearTimeout(t)
  }, [autoOpenDelayMs])

  useEffect(() => {
    if (!open) return
    setHasNotification(false)
    setTimeout(() => inputRef.current?.focus(), 100)

    if (history.length === 0 && !hasGreeted.current) {
      hasGreeted.current = true
      const greeting = buildGreeting(context)
      const next: HistoryItem[] = [
        { role: 'bot', content: greeting },
        { role: 'quick', options: DEFAULT_QUICK_REPLIES },
      ]
      setHistory(next)
      saveHistory(next)
    }
  }, [open, history.length, context])

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [history, sending])

  async function send(text: string) {
    const trimmed = String(text || '').trim()
    if (!trimmed || sending) return

    const userMsg: HistoryItem = { role: 'user', content: trimmed }
    const next = [...history, userMsg]
    setHistory(next)
    saveHistory(next)
    setInput('')
    setSending(true)

    try {
      const payloadMessages = next
        .filter((m): m is { role: 'user' | 'bot'; content: string } =>
          m.role === 'user' || m.role === 'bot'
        )
        .map((m) => ({
          role: m.role === 'bot' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        }))

      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          userContext: context,
        }),
      })

      const data = await res.json()
      const final: HistoryItem[] = [
        ...next,
        {
          role: 'bot',
          content: data.reply || '🙏 Tiểu đệ chưa nghe rõ, sư huynh nói lại nhé?',
        },
      ]
      setHistory(final)
      saveHistory(final)
    } catch {
      const final: HistoryItem[] = [
        ...next,
        {
          role: 'bot',
          content: '🙏 Tiểu đệ mất kết nối với sư phụ rồi, sư huynh thử lại sau ít phút nhé.',
        },
      ]
      setHistory(final)
      saveHistory(final)
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Mở chat với Tiểu Đệ"
        className="fixed bottom-24 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl select-none transition-transform hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #8B4513, #DAA520)' }}
      >
        <span className="animate-bounce" style={{ animationDuration: '2.4s' }}>
          🥋
        </span>
        {hasNotification && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-40 right-6 z-[9998] w-[360px] max-w-[calc(100vw-32px)] h-[540px] max-h-[calc(100vh-160px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-[#fefdf8] sm:bottom-40 max-sm:inset-0 max-sm:w-full max-sm:max-w-full max-sm:h-full max-sm:max-h-full max-sm:rounded-none"
          role="dialog"
          aria-label="Chatbot Tiểu Đệ"
        >
          <div
            className="px-4 py-3 flex items-center gap-2.5 text-white"
            style={{ background: 'linear-gradient(135deg, #8B4513, #DAA520)' }}
          >
            <span className="text-2xl leading-none">🥋</span>
            <div className="leading-tight flex-1">
              <div className="font-semibold text-[15px]">Tiểu Đệ</div>
              <div className="text-[11px] opacity-85">● Đang trực — đệ tử sư phụ Sơn</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="text-2xl leading-none px-1 hover:opacity-80"
            >
              ×
            </button>
          </div>

          <div ref={msgsRef} className="flex-1 overflow-y-auto p-3 bg-[#faf6ec]">
            {history.map((m, i) => {
              if (m.role === 'quick') {
                return (
                  <div key={i} className="flex flex-wrap gap-1.5 my-1.5">
                    {m.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => send(opt)}
                        className="px-3 py-1.5 text-xs rounded-2xl border border-[#DAA520] text-[#8B4513] bg-white hover:bg-[#DAA520] hover:text-white transition"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )
              }
              const isUser = m.role === 'user'
              return (
                <div
                  key={i}
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl mb-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                      ? 'ml-auto text-white rounded-br-sm'
                      : 'bg-white border border-[#e8dcc0] text-[#2a2a2a] rounded-bl-sm'
                  }`}
                  style={isUser ? { background: '#8B4513' } : undefined}
                >
                  {m.content}
                </div>
              )
            })}
            {sending && (
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl mb-2 text-sm italic text-gray-500 bg-white border border-[#e8dcc0]">
                Tiểu đệ đang gõ...
              </div>
            )}
          </div>

          <div className="border-t border-[#e8dcc0] p-2.5 flex gap-2 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Hỏi tiểu đệ điều gì..."
              maxLength={500}
              className="flex-1 px-3.5 py-2.5 text-sm rounded-full border border-[#d4c4a0] outline-none focus:border-[#DAA520] text-gray-900"
            />
            <button
              onClick={() => send(input)}
              disabled={sending || !input.trim()}
              aria-label="Gửi"
              className="w-10 h-10 rounded-full text-white text-lg disabled:opacity-50 hover:opacity-90 flex-shrink-0"
              style={{ background: '#8B4513' }}
            >
              ➤
            </button>
          </div>

          <div className="text-center text-[10px] text-gray-400 py-1 bg-white border-t border-[#f0e8d4]">
            Đệ tử AI của sư phụ Hán Văn Sơn 🙏
          </div>
        </div>
      )}
    </>
  )
}
