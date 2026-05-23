'use client'
import { useState } from 'react'

export default function AffiliateLinkCopyClient({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <div style={{ flex: 1, background: '#040e1c', border: '1px solid rgba(201,169,97,0.2)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#C9A961', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {link}
      </div>
      <button
        onClick={copy}
        style={{ flexShrink: 0, background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(201,169,97,0.15)', border: `1px solid ${copied ? 'rgba(52,211,153,0.4)' : 'rgba(201,169,97,0.4)'}`, borderRadius: '0.5rem', padding: '0.625rem 1rem', color: copied ? '#34d399' : '#C9A961', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
      >
        {copied ? '✓ Đã copy' : 'Copy link'}
      </button>
    </div>
  )
}
