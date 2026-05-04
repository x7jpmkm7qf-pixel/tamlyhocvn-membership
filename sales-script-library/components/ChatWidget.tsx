'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  'Mind Sales Lab là gì?',
  'Giá bao nhiêu một tháng?',
  'Có kịch bản ngành BDS không?',
  'Đăng ký như thế nào?',
]

export default function ChatWidget() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread]   = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input khi mở chat
  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, mình đang gặp sự cố kết nối. Anh/chị thử lại sau nhé! 🙏'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg shadow-violet-300 flex items-center justify-center transition-all active:scale-95"
        aria-label="Chat với AI"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl shadow-slate-300 flex flex-col overflow-hidden border border-slate-200"
          style={{ height: '480px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🧠</div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Trợ lý Mind Sales Lab</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-violet-200 text-xs">Đang hoạt động</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">

            {/* Tin nhắn chào */}
            <div className="flex gap-2 items-end">
              <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center text-sm shrink-0">🧠</div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[240px] shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed">
                  Xin chào! 👋 Mình là trợ lý AI của <strong>Mind Sales Lab</strong>.
                  Anh/chị cần hỗ trợ gì ạ?
                </p>
              </div>
            </div>

            {/* Gợi ý câu hỏi */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 pl-9">
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-violet-50 border border-violet-200 text-violet-700 px-2.5 py-1.5 rounded-full hover:bg-violet-100 transition text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Lịch sử chat */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 items-end ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center text-sm shrink-0">🧠</div>
                )}
                <div className={`rounded-2xl px-3 py-2 max-w-[240px] text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                }`}>
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br/>}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center text-sm shrink-0">🧠</div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-slate-100 flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
