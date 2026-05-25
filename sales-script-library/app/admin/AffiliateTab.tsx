'use client'

import { useState, useEffect, useMemo } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────
type CommissionStatus =
  | 'available' | 'requested' | 'processing' | 'paid_out'
  | 'on_hold' | 'rejected' | 'clawback'

interface AffCommission {
  id: string
  affiliate_email: string
  buyer_email: string
  order_reference_code: string
  commission_amount: number
  order_amount: number
  referral_number: number
  status: CommissionStatus
  created_at: string
  paid_out_at?: string
  is_manual?: boolean
  manual_type?: string
  manual_reason?: string
}

interface AffPayout {
  id: string
  affiliate_email: string
  total_amount: number
  bank_name: string
  bank_account: string
  account_holder: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  note?: string
  commission_ids: string[]
}

interface AffAffiliate {
  email: string
  total_referrals: number
  available: number
  paid_out: number
  clawbacks: number
}

interface AuditLogEntry {
  id: string
  commission_id: string
  old_status: CommissionStatus
  new_status: CommissionStatus
  changed_by: string
  reason: string
  timestamp: string
}

interface Props {
  onPendingCountChange?: (count: number) => void
}

// ── Config ─────────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<CommissionStatus, { label: string; badge: string; dot: string }> = {
  available:  { label: 'Có thể rút',    badge: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-400' },
  requested:  { label: 'Yêu cầu rút',   badge: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  processing: { label: 'Đang xử lý',    badge: 'bg-purple-100 text-purple-700',  dot: 'bg-purple-500' },
  paid_out:   { label: 'Đã trả',        badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  on_hold:    { label: 'Tạm giữ',       badge: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-400' },
  rejected:   { label: 'Từ chối',       badge: 'bg-red-100 text-red-600',        dot: 'bg-red-500' },
  clawback:   { label: 'Đòi lại',       badge: 'bg-slate-200 text-slate-600',    dot: 'bg-slate-400' },
}
const ALL_STATUSES = Object.keys(STATUS_CFG) as CommissionStatus[]

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt  = (n: number) => n.toLocaleString('vi-VN') + 'đ'
const fmtD = (s?: string) => s ? new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
const fmtDT = (s?: string) => s ? new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

function StatusBadge({ status }: { status: CommissionStatus }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.available
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function AffiliateTab({ onPendingCountChange }: Props) {
  const [commissions, setCommissions] = useState<AffCommission[]>([])
  const [payouts,     setPayouts]     = useState<AffPayout[]>([])
  const [affiliates,  setAffiliates]  = useState<AffAffiliate[]>([])
  const [loading,     setLoading]     = useState(false)
  const [toast,       setToast]       = useState('')

  // Sub-tab
  const [subTab, setSubTab] = useState<'overview' | 'balances' | 'need-pay'>('overview')

  // Balances tab state
  interface AffBalance {
    email: string; name: string; phone: string; affiliate_code: string | null
    tier: 'ngoaimon' | 'noimon' | null; is_blocked: boolean
    available_total: number; processing_total: number; paid_total: number
    on_hold_total: number; clawback_total: number; net_debt: number
    total_orders: number; available_count: number; processing_count: number; on_hold_count: number
    referral_rate: 'Standard' | 'Premium'
    oldest_unpaid_at: string | null
    bank: { bank_name: string; bank_account: string; account_holder: string } | null
  }
  interface BalanceSummary {
    total_affiliates: number; total_net_debt: number; total_available: number
    total_processing: number; total_paid: number; total_clawback: number; affiliates_with_debt: number
  }
  const [balances,        setBalances]        = useState<AffBalance[]>([])
  const [balSummary,      setBalSummary]      = useState<BalanceSummary | null>(null)
  const [balLoading,      setBalLoading]      = useState(false)
  const [balLoaded,       setBalLoaded]       = useState(false)
  const [balSearch,       setBalSearch]       = useState('')
  const [balSort,         setBalSort]         = useState<'available' | 'net_debt' | 'paid' | 'orders'>('available')
  const [balFilter,       setBalFilter]       = useState<'all' | 'has-debt' | 'clawback' | 'clean'>('all')
  const [quickPayTarget,  setQuickPayTarget]  = useState<AffBalance | null>(null)

  // Filters
  const [fStatuses,  setFStatuses]  = useState<CommissionStatus[]>([])
  const [fAffiliate, setFAffiliate] = useState('')
  const [fSearch,    setFSearch]    = useState('')
  const [fDate,      setFDate]      = useState<'7d' | '30d' | '90d' | 'all'>('all')
  const [fUnpaid,    setFUnpaid]    = useState(false)

  // Bulk
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Status modal
  const [statusModal,   setStatusModal]   = useState<AffCommission | null>(null)
  const [newStatus,     setNewStatus]     = useState<CommissionStatus>('available')
  const [statusReason,  setStatusReason]  = useState('')
  const [savingStatus,  setSavingStatus]  = useState(false)

  // Audit log modal
  const [auditModal, setAuditModal] = useState<{ commission: AffCommission; logs: AuditLogEntry[] } | null>(null)
  const [auditLoading, setAuditLoading] = useState(false)

  // Manual modal
  const [manualOpen,    setManualOpen]    = useState(false)
  const [manualForm,    setManualForm]    = useState<{
    affiliate_email: string
    manual_type: 'BONUS' | 'COMPENSATION' | 'MANUAL_REFERRAL' | 'ADJUSTMENT_PLUS' | 'ADJUSTMENT_MINUS'
    amount: string
    reason: string
    buyer_email: string
    initial_status: CommissionStatus
  }>({
    affiliate_email: '',
    manual_type: 'BONUS',
    amount: '',
    reason: '',
    buyer_email: '',
    initial_status: 'available',
  })
  const [savingManual, setSavingManual] = useState(false)

  // Payout review note (per-payout)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})

  // ── Data load ────────────────────────────────────────────────────────────────
  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const d = await fetch('/api/admin/affiliate').then(r => r.json())
      setCommissions(d.commissions || [])
      setPayouts(d.payouts || [])
      setAffiliates(d.affiliates || [])
      const pending = (d.payouts || []).filter((p: AffPayout) => p.status === 'pending').length
      onPendingCountChange?.(pending)
    } catch { showToast('❌ Lỗi tải dữ liệu') }
    finally { setLoading(false) }
  }

  async function loadBalances(force = false) {
    if (balLoaded && !force) return
    setBalLoading(true)
    try {
      const d = await fetch('/api/admin/affiliate/balances').then(r => r.json())
      setBalances(d.balances || [])
      setBalSummary(d.summary || null)
      setBalLoaded(true)
    } catch { showToast('❌ Lỗi tải số dư') }
    finally { setBalLoading(false) }
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const sum = (pred: (c: AffCommission) => boolean) =>
      commissions.filter(pred).reduce((s, c) => s + c.commission_amount, 0)
    const cnt = (pred: (c: AffCommission) => boolean) => commissions.filter(pred).length
    return {
      total: commissions.length,
      manual: cnt(c => !!c.is_manual),
      activeAffiliates: new Set(commissions.map(c => c.affiliate_email)).size,
      available:  { sum: sum(c => c.status === 'available'),  count: cnt(c => c.status === 'available') },
      requested:  { sum: sum(c => c.status === 'requested'),  count: cnt(c => c.status === 'requested') },
      processing: { sum: sum(c => c.status === 'processing'), count: cnt(c => c.status === 'processing') },
      paidMonth:  { sum: sum(c => c.status === 'paid_out' && !!c.paid_out_at && c.paid_out_at >= firstOfMonth),
                    count: cnt(c => c.status === 'paid_out' && !!c.paid_out_at && c.paid_out_at >= firstOfMonth) },
      clawback:   { sum: sum(c => c.status === 'clawback'), count: cnt(c => c.status === 'clawback') },
    }
  }, [commissions])

  // ── Filtered commissions ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const cutoff = fDate === '7d'  ? new Date(Date.now() - 7  * 86400000).toISOString()
                 : fDate === '30d' ? new Date(Date.now() - 30 * 86400000).toISOString()
                 : fDate === '90d' ? new Date(Date.now() - 90 * 86400000).toISOString()
                 : null
    return [...commissions].reverse().filter(c => {
      if (fStatuses.length > 0 && !fStatuses.includes(c.status)) return false
      if (fAffiliate && !c.affiliate_email.toLowerCase().includes(fAffiliate.toLowerCase())) return false
      if (fSearch) {
        const hay = `${c.affiliate_email} ${c.buyer_email} ${c.id} ${c.commission_amount} ${c.order_reference_code}`.toLowerCase()
        if (!hay.includes(fSearch.toLowerCase())) return false
      }
      if (cutoff && c.created_at < cutoff) return false
      if (fUnpaid && (c.status === 'paid_out' || c.status === 'rejected' || c.status === 'clawback')) return false
      return true
    })
  }, [commissions, fStatuses, fAffiliate, fSearch, fDate, fUnpaid])

  // ── Affiliate groups for Cần Trả tab ────────────────────────────────────────
  const needPayGroups = useMemo(() => {
    const groups = new Map<string, {
      email: string; commissions: AffCommission[]; total: number
      bank?: { bank_name: string; bank_account: string; account_holder: string }
    }>()
    for (const c of commissions) {
      if (!['available', 'requested', 'processing', 'on_hold'].includes(c.status)) continue
      const g = groups.get(c.affiliate_email) ?? { email: c.affiliate_email, commissions: [], total: 0 }
      g.commissions.push(c)
      g.total += c.commission_amount
      groups.set(c.affiliate_email, g)
    }
    for (const [email, group] of Array.from(groups)) {
      const latest = payouts
        .filter(p => p.affiliate_email === email && p.bank_account)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
      if (latest) group.bank = { bank_name: latest.bank_name, bank_account: latest.bank_account, account_holder: latest.account_holder }
    }
    return Array.from(groups.values()).sort((a, b) => b.total - a.total)
  }, [commissions, payouts])

  // ── Bulk helpers ─────────────────────────────────────────────────────────────
  const allIds     = filtered.map(c => c.id)
  const allChosen  = allIds.length > 0 && allIds.every(id => selected.has(id))
  const selTotal   = filtered.filter(c => selected.has(c.id)).reduce((s, c) => s + c.commission_amount, 0)

  function toggleOne(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAll() { setSelected(allChosen ? new Set() : new Set(allIds)) }

  // ── Status change ────────────────────────────────────────────────────────────
  function openStatusModal(c: AffCommission) {
    setStatusModal(c); setNewStatus(c.status); setStatusReason('')
  }

  async function saveStatusChange() {
    if (!statusModal || !statusReason.trim()) { showToast('❌ Vui lòng nhập lý do'); return }
    setSavingStatus(true)
    try {
      const res = await fetch('/api/admin/affiliate/commission-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission_id: statusModal.id, new_status: newStatus, reason: statusReason }),
      })
      if (!res.ok) throw new Error()
      showToast('✅ Đã cập nhật trạng thái'); setStatusModal(null); load()
    } catch { showToast('❌ Lỗi cập nhật') }
    finally { setSavingStatus(false) }
  }

  // ── Bulk status ──────────────────────────────────────────────────────────────
  async function bulkStatus(status: CommissionStatus) {
    const ids = Array.from(selected)
    if (!ids.length) return
    const reason = window.prompt(`Lý do chuyển ${ids.length} commission → "${STATUS_CFG[status].label}":`)
    if (!reason) return
    const res = await fetch('/api/admin/affiliate/bulk-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commission_ids: ids, new_status: status, reason }),
    })
    if (res.ok) { showToast(`✅ Đã cập nhật ${ids.length} commission`); setSelected(new Set()); load() }
    else showToast('❌ Lỗi bulk update')
  }

  // ── CSV export ───────────────────────────────────────────────────────────────
  function exportCsv(data: AffCommission[]) {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [
      ['ID', 'Affiliate', 'Người mua', 'Hoa hồng', 'Đơn hàng', 'Ref Code', 'STT', 'Trạng thái', 'Ngày tạo', 'Ngày trả', 'Thủ công', 'Loại', 'Lý do'],
      ...data.map(c => [c.id, c.affiliate_email, c.buyer_email, c.commission_amount, c.order_amount,
        c.order_reference_code, c.referral_number, c.status, fmtD(c.created_at), fmtD(c.paid_out_at),
        c.is_manual ? 'Có' : 'Không', c.manual_type || '', c.manual_reason || '']),
    ].map(r => r.map(esc).join(',')).join('\r\n')
    const blob = new Blob(['﻿' + rows], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `commissions-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Audit log ────────────────────────────────────────────────────────────────
  async function openAudit(c: AffCommission) {
    setAuditLoading(true)
    try {
      const d = await fetch(`/api/admin/affiliate/audit-log?commission_id=${c.id}`).then(r => r.json())
      setAuditModal({ commission: c, logs: d.logs || [] })
    } catch { showToast('❌ Lỗi tải audit log') }
    finally { setAuditLoading(false) }
  }

  // ── Manual commission ────────────────────────────────────────────────────────
  async function submitManual() {
    if (!manualForm.affiliate_email || !manualForm.amount || !manualForm.reason) {
      showToast('❌ Vui lòng điền đầy đủ'); return
    }
    setSavingManual(true)
    try {
      const res = await fetch('/api/admin/affiliate/manual', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliate_email: manualForm.affiliate_email,
          manual_type: manualForm.manual_type,
          amount: parseInt(manualForm.amount),
          reason: manualForm.reason,
          buyer_email: manualForm.buyer_email || undefined,
          initial_status: manualForm.initial_status,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'err') }
      showToast('✅ Đã tạo giao dịch thủ công')
      setManualOpen(false)
      setManualForm({ affiliate_email: '', manual_type: 'BONUS', amount: '', reason: '', buyer_email: '', initial_status: 'available' })
      load()
    } catch (e: unknown) { showToast('❌ ' + (e instanceof Error ? e.message : 'Lỗi tạo giao dịch')) }
    finally { setSavingManual(false) }
  }

  // ── Payout actions ────────────────────────────────────────────────────────────
  async function reviewPayout(id: string, action: 'approve' | 'reject') {
    const note = reviewNotes[id] || ''
    const res = await fetch('/api/admin/affiliate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, note }),
    })
    if (res.ok) { showToast(action === 'approve' ? '✅ Đã duyệt' : '✅ Đã từ chối'); load() }
    else showToast('❌ Lỗi xử lý')
  }

  // ── Copy CK info ──────────────────────────────────────────────────────────────
  function copyCKInfo(group: (typeof needPayGroups)[0]) {
    if (!group.bank) return
    const text = `Bank: ${group.bank.bank_name} | STK: ${group.bank.bank_account} | Tên: ${group.bank.account_holder} | Số tiền: ${fmt(group.total)} | ND: TKC-${group.email}`
    navigator.clipboard.writeText(text).then(() => showToast('✅ Đã copy thông tin CK'))
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.startsWith('❌') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-800">💰 Quản lý Affiliate</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setManualOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1">
            ➕ Thêm thủ công
          </button>
          <button onClick={() => exportCsv(filtered)}
            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
            📊 Export CSV
          </button>
          <button onClick={load}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition">
            {loading ? '...' : '↻ Làm mới'}
          </button>
        </div>
      </div>

      {/* ── Sub-tabs ── */}
      <div className="flex gap-0 border-b border-slate-200">
        <button onClick={() => setSubTab('overview')}
          className={`text-sm font-medium px-5 py-2.5 border-b-2 -mb-px transition ${
            subTab === 'overview' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}>
          📊 Tổng quan
        </button>
        <button onClick={() => { setSubTab('balances'); loadBalances() }}
          className={`text-sm font-medium px-5 py-2.5 border-b-2 -mb-px transition flex items-center gap-1.5 ${
            subTab === 'balances' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}>
          💰 Số dư User
          {balSummary && balSummary.affiliates_with_debt > 0 && (
            <span className="bg-amber-100 text-amber-700 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
              {balSummary.affiliates_with_debt}
            </span>
          )}
        </button>
        <button onClick={() => setSubTab('need-pay')}
          className={`text-sm font-medium px-5 py-2.5 border-b-2 -mb-px transition flex items-center gap-1.5 ${
            subTab === 'need-pay' ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}>
          💸 Cần trả
          {needPayGroups.length > 0 && (
            <span className="bg-rose-100 text-rose-600 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
              {needPayGroups.length}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {subTab === 'overview' && (
        <div className="space-y-5">

          {/* Stat cards — 6 cards, click-to-filter */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
            {([
              { icon: '📊', label: 'Tổng giao dịch', main: `${stats.total} đơn`, sub: `${stats.manual} thủ công`,
                status: null, color: 'slate' },
              { icon: '👥', label: 'Active affiliate', main: `${stats.activeAffiliates} người`, sub: 'có ít nhất 1 đơn',
                status: null, color: 'slate', noFilter: true },
              { icon: '⏳', label: 'Available chưa trả', main: fmt(stats.available.sum), sub: `${stats.available.count} đơn`,
                status: 'available' as CommissionStatus, color: 'amber' },
              { icon: '📤', label: 'Đã yêu cầu rút', main: fmt(stats.requested.sum), sub: `${stats.requested.count} đơn`,
                status: 'requested' as CommissionStatus, color: 'blue' },
              { icon: '✅', label: 'Đã trả tháng này', main: fmt(stats.paidMonth.sum), sub: `${stats.paidMonth.count} đơn`,
                status: 'paid_out' as CommissionStatus, color: 'emerald' },
              { icon: '⚠️', label: 'Clawback', main: fmt(stats.clawback.sum), sub: `${stats.clawback.count} đơn`,
                status: 'clawback' as CommissionStatus, color: 'red',
                alert: stats.clawback.count > 0 },
            ] as const).map(card => {
              const isActive = card.status === null && !('noFilter' in card && card.noFilter)
                ? fStatuses.length === 0 && !('noFilter' in card && card.noFilter)
                : fStatuses.length === 1 && fStatuses[0] === card.status
              const alertRed = 'alert' in card && card.alert
              const colorMap: Record<string, string> = {
                slate: isActive ? 'bg-slate-100 border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300',
                amber: isActive ? 'bg-amber-50 border-amber-400' : 'bg-white border-slate-200 hover:border-amber-200',
                blue:  isActive ? 'bg-blue-50 border-blue-400'   : 'bg-white border-slate-200 hover:border-blue-200',
                emerald:isActive? 'bg-emerald-50 border-emerald-400':'bg-white border-slate-200 hover:border-emerald-200',
                red:   alertRed ? 'bg-red-50 border-red-300'
                      : isActive ? 'bg-red-50 border-red-400' : 'bg-white border-slate-200 hover:border-red-200',
              }
              const textMap: Record<string, string> = {
                slate: 'text-slate-700', amber: 'text-amber-700', blue: 'text-blue-700',
                emerald: 'text-emerald-700', red: 'text-red-700',
              }
              return (
                <button key={card.label}
                  onClick={() => {
                    if ('noFilter' in card && card.noFilter) return
                    card.status === null ? setFStatuses([]) : setFStatuses([card.status])
                  }}
                  className={`text-left rounded-xl border p-3 transition ${'noFilter' in card && card.noFilter ? 'cursor-default' : 'cursor-pointer'} ${colorMap[card.color]}`}>
                  <div className="text-xl mb-1 leading-none">{card.icon}</div>
                  <p className={`text-[11px] font-medium mb-0.5 ${isActive || alertRed ? textMap[card.color] : 'text-slate-500'}`}>
                    {card.label}
                  </p>
                  <p className={`text-sm font-bold ${isActive || alertRed ? textMap[card.color] : 'text-slate-800'}`}>{card.main}</p>
                  <p className="text-[11px] text-slate-400">{card.sub}</p>
                </button>
              )
            })}
          </div>

          {/* Pending payout requests */}
          {(() => {
            const pending = payouts.filter(p => p.status === 'pending')
            if (!pending.length) return null
            return (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <p className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-2">
                  🔴 Yêu cầu rút đang chờ ({pending.length})
                </p>
                <div className="space-y-3">
                  {pending.map(p => (
                    <div key={p.id} className="bg-white border border-rose-200 rounded-xl p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{p.affiliate_email}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {fmtDT(p.created_at)} · {p.commission_ids.length} hoa hồng
                          </p>
                        </div>
                        <p className="text-xl font-black text-rose-600">{fmt(p.total_amount)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 mb-3 grid grid-cols-3 gap-2 text-xs">
                        <div><p className="text-slate-400 mb-0.5">Ngân hàng</p><p className="font-semibold text-slate-700">{p.bank_name}</p></div>
                        <div><p className="text-slate-400 mb-0.5">Số TK</p><p className="font-semibold text-slate-700 font-mono">{p.bank_account}</p></div>
                        <div><p className="text-slate-400 mb-0.5">Chủ TK</p><p className="font-semibold text-slate-700">{p.account_holder}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Ghi chú (tùy chọn)"
                          value={reviewNotes[p.id] || ''}
                          onChange={e => setReviewNotes(n => ({ ...n, [p.id]: e.target.value }))}
                          className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-400" />
                        <button onClick={() => reviewPayout(p.id, 'approve')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">✓ Duyệt</button>
                        <button onClick={() => reviewPayout(p.id, 'reject')}
                          className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-4 py-1.5 rounded-lg transition">✕ Từ chối</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Date range */}
              <div className="flex gap-1">
                {([['7d', '7 ngày'], ['30d', '30 ngày'], ['90d', '90 ngày'], ['all', 'Tất cả']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setFDate(v)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${fDate === v ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {l}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              {/* Unpaid toggle */}
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <input type="checkbox" checked={fUnpaid} onChange={e => setFUnpaid(e.target.checked)}
                  className="rounded accent-violet-600" />
                Chỉ chưa trả
              </label>

              <div className="flex-1 flex flex-wrap gap-2">
                <input value={fSearch} onChange={e => setFSearch(e.target.value)}
                  placeholder="🔍 Tìm email, ID, ref code..."
                  className="flex-1 min-w-[180px] text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400" />
                <input value={fAffiliate} onChange={e => setFAffiliate(e.target.value)}
                  placeholder="📧 Lọc affiliate..."
                  className="w-44 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
            </div>

            {/* Status chips */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 self-center">Trạng thái:</span>
              {ALL_STATUSES.map(s => (
                <button key={s} onClick={() =>
                  setFStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
                }
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition ${
                    fStatuses.includes(s) ? STATUS_CFG[s].badge + ' ring-1 ring-current' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}>
                  {STATUS_CFG[s].label}
                </button>
              ))}
              {fStatuses.length > 0 && (
                <button onClick={() => setFStatuses([])} className="text-[11px] text-slate-400 hover:text-slate-600 px-1">✕</button>
              )}
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-violet-700">
                {selected.size} đơn · Tổng <strong>{fmt(selTotal)}</strong>
              </span>
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <button onClick={() => bulkStatus('requested')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">→ Requested</button>
                <button onClick={() => bulkStatus('processing')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">→ Processing</button>
                <button onClick={() => bulkStatus('paid_out')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">✓ Paid</button>
                <button onClick={() => bulkStatus('on_hold')}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">⏸ On Hold</button>
                <button onClick={() => exportCsv(filtered.filter(c => selected.has(c.id)))}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition">📊 Export</button>
                <button onClick={() => setSelected(new Set())} className="text-slate-400 hover:text-slate-600 text-xs px-1.5">✕</button>
              </div>
            </div>
          )}

          {/* Commission table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-700">
                Hoa hồng ({filtered.length}{commissions.length !== filtered.length ? ` / ${commissions.length} tổng` : ''})
              </h3>
            </div>
            {loading && commissions.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 py-12 text-center text-slate-400 text-sm">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 py-12 text-center text-slate-400 text-sm">Không có giao dịch nào khớp bộ lọc</div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-3 py-3 w-8">
                          <input type="checkbox" checked={allChosen} onChange={toggleAll} className="rounded accent-violet-600" />
                        </th>
                        <th className="text-left text-xs font-medium text-slate-500 px-3 py-3 w-8">#</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">Affiliate</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-3 py-3 hidden md:table-cell">Người mua</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">Hoa hồng</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-3 py-3 hidden lg:table-cell">Ngày</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">Trạng thái</th>
                        <th className="px-3 py-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(c => (
                        <tr key={c.id} className={`hover:bg-slate-50 transition ${selected.has(c.id) ? 'bg-violet-50' : ''}`}>
                          <td className="px-3 py-2.5">
                            <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} className="rounded accent-violet-600" />
                          </td>
                          <td className="px-3 py-2.5 text-xs text-slate-400">
                            <span>#{c.referral_number}</span>
                            {c.is_manual && <span className="ml-1 bg-violet-100 text-violet-600 text-[10px] font-bold px-1 py-px rounded">M</span>}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-slate-700 max-w-[140px] truncate">{c.affiliate_email}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-500 hidden md:table-cell max-w-[140px] truncate">{c.buyer_email}</td>
                          <td className="px-3 py-2.5 text-sm font-bold text-emerald-700 whitespace-nowrap">
                            {c.commission_amount < 0 ? '-' : '+'}{fmt(Math.abs(c.commission_amount))}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-slate-500 hidden lg:table-cell whitespace-nowrap">{fmtD(c.created_at)}</td>
                          <td className="px-3 py-2.5">
                            <button onClick={() => openStatusModal(c)}
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition hover:opacity-80 ${STATUS_CFG[c.status]?.badge || 'bg-slate-100 text-slate-600'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CFG[c.status]?.dot || 'bg-slate-400'}`} />
                              {STATUS_CFG[c.status]?.label || c.status}
                              <span className="text-[10px] ml-0.5 opacity-60">▼</span>
                            </button>
                          </td>
                          <td className="px-3 py-2.5">
                            <button onClick={() => openAudit(c)} disabled={auditLoading}
                              title="Lịch sử thay đổi"
                              className="text-xs text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg transition">
                              📋
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Payout history */}
          {payouts.filter(p => p.status !== 'pending').length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-2">
                Lịch sử yêu cầu rút ({payouts.filter(p => p.status !== 'pending').length})
              </h3>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Affiliate</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Số tiền</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden md:table-cell">Ngân hàng</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden lg:table-cell">Ngày</th>
                        <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payouts.filter(p => p.status !== 'pending').map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-700">{p.affiliate_email}</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-800">{fmt(p.total_amount)}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 hidden md:table-cell">
                            {p.bank_name} · <span className="font-mono">{p.bank_account}</span><br />{p.account_holder}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
                            {fmtD(p.created_at)}
                            {p.reviewed_at && <p className="text-slate-400">Duyệt: {fmtD(p.reviewed_at)}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                              p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                            }`}>
                              {p.status === 'approved' ? '✓ Đã duyệt' : '✕ Từ chối'}
                            </span>
                            {p.note && <p className="text-xs text-slate-400 mt-0.5">{p.note}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ SỐ DƯ USER TAB ══════════════ */}
      {subTab === 'balances' && (() => {
        // Derived sorted + filtered list
        const daysSince = (iso: string | null) => iso
          ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
          : 0

        const filtered2 = balances
          .filter(b => {
            if (balFilter === 'has-debt'  && b.net_debt <= 0) return false
            if (balFilter === 'clawback'  && b.clawback_total <= 0) return false
            if (balFilter === 'clean'     && (b.net_debt > 0 || b.clawback_total > 0)) return false
            if (balSearch) {
              const hay = `${b.email} ${b.name} ${b.affiliate_code || ''} ${b.phone}`.toLowerCase()
              if (!hay.includes(balSearch.toLowerCase())) return false
            }
            return true
          })
          .sort((a, b2) => {
            if (balSort === 'available') return b2.available_total  - a.available_total
            if (balSort === 'net_debt')  return b2.net_debt         - a.net_debt
            if (balSort === 'paid')      return b2.paid_total       - a.paid_total
            if (balSort === 'orders')    return b2.total_orders     - a.total_orders
            return 0
          })

        function exportBalancesCsv() {
          const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
          const rows = [
            ['Email', 'Tên', 'SĐT', 'Code', 'Tier', 'Available', 'Processing', 'On Hold', 'Đã trả', 'Clawback', 'Nợ thuần', 'Tổng đơn', 'Ngân hàng', 'STK', 'Chủ TK'],
            ...filtered2.map(b => [
              b.email, b.name, b.phone, b.affiliate_code || '', b.tier || '',
              b.available_total, b.processing_total, b.on_hold_total, b.paid_total, b.clawback_total, b.net_debt, b.total_orders,
              b.bank?.bank_name || '', b.bank?.bank_account || '', b.bank?.account_holder || '',
            ]),
          ].map(r => r.map(esc).join(',')).join('\r\n')
          const blob = new Blob(['﻿' + rows], { type: 'text/csv;charset=utf-8;' })
          const url  = URL.createObjectURL(blob)
          const a    = document.createElement('a'); a.href = url
          a.download = `so-du-affiliate-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
          URL.revokeObjectURL(url)
        }

        function copyBankInfo(b: typeof balances[0]) {
          if (!b.bank) { showToast('⚠️ Affiliate chưa cung cấp STK'); return }
          const text = `Bank: ${b.bank.bank_name} | STK: ${b.bank.bank_account} | Tên: ${b.bank.account_holder} | Số tiền: ${fmt(b.net_debt)} | ND: TKC-${b.email}`
          navigator.clipboard.writeText(text).then(() => showToast('✅ Đã copy thông tin CK'))
        }

        return (
          <div className="space-y-4">

            {/* Summary cards */}
            {balSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="bg-white border border-slate-200 rounded-xl p-3.5">
                  <p className="text-xs text-slate-500 mb-0.5">Tổng affiliate</p>
                  <p className="text-2xl font-black text-slate-800">{balSummary.total_affiliates}</p>
                  <p className="text-xs text-slate-400">{balSummary.affiliates_with_debt} đang có nợ</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                  <p className="text-xs text-amber-700 mb-0.5">Tổng nợ hệ thống</p>
                  <p className="text-2xl font-black text-amber-700">{fmt(balSummary.total_net_debt)}</p>
                  <p className="text-xs text-amber-500">{fmt(balSummary.total_available)} available</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5">
                  <p className="text-xs text-purple-700 mb-0.5">Đang xử lý</p>
                  <p className="text-2xl font-black text-purple-700">{fmt(balSummary.total_processing)}</p>
                  <p className="text-xs text-purple-400">requested + processing</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                  <p className="text-xs text-emerald-700 mb-0.5">Đã trả tổng</p>
                  <p className="text-2xl font-black text-emerald-700">{fmt(balSummary.total_paid)}</p>
                  <p className="text-xs text-emerald-400">lifetime</p>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={balSearch} onChange={e => setBalSearch(e.target.value)}
                placeholder="🔍 Email, tên, affiliate code..."
                className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400 min-w-[200px] flex-1"
              />

              {/* Filter chips */}
              {([
                ['all',       'Tất cả'],
                ['has-debt',  '⏳ Có nợ'],
                ['clawback',  '⚠️ Clawback'],
                ['clean',     '✅ Sạch'],
              ] as const).map(([v, label]) => (
                <button key={v} onClick={() => setBalFilter(v)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                    balFilter === v ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300'
                  }`}>
                  {label}
                </button>
              ))}

              {/* Sort */}
              <select value={balSort} onChange={e => setBalSort(e.target.value as typeof balSort)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400">
                <option value="available">Sort: Available↓</option>
                <option value="net_debt">Sort: Nợ thuần↓</option>
                <option value="paid">Sort: Đã trả↓</option>
                <option value="orders">Sort: Đơn↓</option>
              </select>

              <button onClick={() => loadBalances(true)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition">
                {balLoading ? '...' : '↻'}
              </button>
              <button onClick={exportBalancesCsv}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg transition">
                📥 Export CSV
              </button>
            </div>

            {/* Table */}
            {balLoading ? (
              <div className="bg-white rounded-xl border border-slate-100 py-12 text-center text-slate-400 text-sm">
                Đang tải số dư...
              </div>
            ) : filtered2.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 py-16 text-center">
                <p className="text-slate-400 text-sm">Chưa có dữ liệu số dư</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left font-medium text-slate-500 px-4 py-3">Affiliate</th>
                        <th className="text-left font-medium text-slate-500 px-3 py-3 hidden md:table-cell">Tier / Code</th>
                        <th className="text-right font-medium text-slate-500 px-3 py-3">Đơn</th>
                        <th className="text-right font-medium text-slate-500 px-3 py-3 text-amber-600">Available</th>
                        <th className="text-right font-medium text-slate-500 px-3 py-3 hidden lg:table-cell text-purple-600">Processing</th>
                        <th className="text-right font-medium text-slate-500 px-3 py-3 hidden lg:table-cell text-emerald-600">Đã trả</th>
                        <th className="text-right font-medium text-slate-500 px-3 py-3 hidden xl:table-cell text-red-500">Clawback</th>
                        <th className="text-right font-medium text-slate-500 px-3 py-3 font-bold text-slate-700">Nợ thuần</th>
                        <th className="text-left font-medium text-slate-500 px-3 py-3 hidden xl:table-cell">Cũ nhất chưa trả</th>
                        <th className="px-3 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered2.map(b => {
                        const dayOld = daysSince(b.oldest_unpaid_at)
                        const overdue = b.available_count > 0 && dayOld > 30
                        return (
                          <tr key={b.email} className="hover:bg-slate-50 group">
                            {/* Affiliate info */}
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-800 text-xs">{b.name}</p>
                              <p className="text-slate-400 truncate max-w-[180px]">{b.email}</p>
                              {b.phone && (
                                <a href={`https://zalo.me/${b.phone}`} target="_blank" rel="noopener"
                                  className="text-blue-500 hover:underline">{b.phone}</a>
                              )}
                              {b.is_blocked && (
                                <span className="ml-1 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">BLOCKED</span>
                              )}
                            </td>

                            {/* Tier / Code */}
                            <td className="px-3 py-3 hidden md:table-cell">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                                  b.referral_rate === 'Premium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {b.referral_rate === 'Premium' ? '⭐ Premium' : 'Standard'}
                                </span>
                                {b.affiliate_code && (
                                  <span title={`/r/${b.affiliate_code}`}
                                    className="font-mono text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded cursor-help">
                                    {b.affiliate_code}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Đơn */}
                            <td className="px-3 py-3 text-right font-semibold text-slate-700">{b.total_orders}</td>

                            {/* Available */}
                            <td className="px-3 py-3 text-right">
                              {b.available_total > 0 ? (
                                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                  {fmt(b.available_total)}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Processing */}
                            <td className="px-3 py-3 text-right hidden lg:table-cell">
                              {b.processing_total > 0 ? (
                                <span className="font-bold text-purple-700">{fmt(b.processing_total)}</span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Đã trả */}
                            <td className="px-3 py-3 text-right hidden lg:table-cell">
                              {b.paid_total > 0 ? (
                                <span className="text-emerald-700 font-semibold">{fmt(b.paid_total)}</span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Clawback */}
                            <td className="px-3 py-3 text-right hidden xl:table-cell">
                              {b.clawback_total > 0 ? (
                                <span className="text-red-600 font-bold">-{fmt(b.clawback_total)}</span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Nợ thuần */}
                            <td className="px-3 py-3 text-right">
                              {b.net_debt > 0 ? (
                                <span className="font-black text-slate-900 text-sm">{fmt(b.net_debt)}</span>
                              ) : b.net_debt < 0 ? (
                                <span className="font-bold text-red-600">{fmt(b.net_debt)}</span>
                              ) : (
                                <span className="text-slate-300 text-[11px]">Đã sạch</span>
                              )}
                            </td>

                            {/* Oldest unpaid */}
                            <td className="px-3 py-3 hidden xl:table-cell">
                              {b.oldest_unpaid_at ? (
                                <span className={`${overdue ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                                  {overdue && '⚠️ '}{fmtD(b.oldest_unpaid_at)}
                                  {overdue && <span className="block text-[10px]">{dayOld} ngày</span>}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5 justify-end">
                                <button
                                  onClick={() => copyBankInfo(b)}
                                  title={b.bank ? `${b.bank.bank_name} ${b.bank.bank_account}` : 'Chưa có STK'}
                                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition ${
                                    b.bank
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                      : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                  }`}>
                                  📋 STK
                                </button>
                                <button
                                  onClick={() => { setQuickPayTarget(b); setManualOpen(true); setManualForm(f => ({ ...f, affiliate_email: b.email })) }}
                                  className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 transition">
                                  💸 Trả
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer summary */}
                {filtered2.length > 0 && (
                  <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>{filtered2.length} affiliate</span>
                    <span className="text-amber-700 font-semibold">
                      Available: {fmt(filtered2.reduce((s, b) => s + b.available_total, 0))}
                    </span>
                    <span className="text-slate-700 font-bold">
                      Tổng nợ: {fmt(filtered2.reduce((s, b) => s + b.net_debt, 0))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {/* ══════════════ CẦN TRẢ TAB ══════════════ */}
      {subTab === 'need-pay' && (
        <div className="space-y-4">
          {needPayGroups.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 py-16 text-center">
              <p className="text-slate-400 text-sm">Không có affiliate nào cần trả — tất cả đã được thanh toán!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  <strong className="text-slate-800">{needPayGroups.length}</strong> affiliate cần trả ·
                  Tổng <strong className="text-emerald-700">{fmt(needPayGroups.reduce((s, g) => s + g.total, 0))}</strong>
                </p>
              </div>
              {needPayGroups.map(group => (
                <div key={group.email} className={`bg-white rounded-xl border p-4 ${!group.bank ? 'border-red-200' : 'border-slate-200'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{group.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{group.commissions.length} đơn chờ trả</p>
                    </div>
                    <p className="text-xl font-black text-emerald-700">{fmt(group.total)}</p>
                  </div>

                  {group.bank ? (
                    <div className="bg-slate-50 rounded-lg p-3 mb-3 grid grid-cols-3 gap-2 text-xs">
                      <div><p className="text-slate-400 mb-0.5">Ngân hàng</p><p className="font-semibold text-slate-700">{group.bank.bank_name}</p></div>
                      <div><p className="text-slate-400 mb-0.5">Số TK</p><p className="font-semibold text-slate-700 font-mono">{group.bank.bank_account}</p></div>
                      <div><p className="text-slate-400 mb-0.5">Chủ TK</p><p className="font-semibold text-slate-700">{group.bank.account_holder}</p></div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-xs text-red-600 font-medium">
                      ⚠️ Chưa có thông tin STK — affiliate chưa từng submit yêu cầu rút
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {group.bank && (
                      <button onClick={() => copyCKInfo(group)}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                        📋 Copy info CK
                      </button>
                    )}
                    <button onClick={async () => {
                      const reason = window.prompt(`Lý do đánh dấu đã trả ${fmt(group.total)} cho ${group.email}:`)
                      if (!reason) return
                      const res = await fetch('/api/admin/affiliate/bulk-status', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ commission_ids: group.commissions.map(c => c.id), new_status: 'paid_out', reason }),
                      })
                      if (res.ok) { showToast('✅ Đã đánh dấu đã trả'); load() }
                      else showToast('❌ Lỗi')
                    }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                      ✓ Đánh dấu đã trả tất cả
                    </button>
                    <button onClick={() => exportCsv(group.commissions)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                      📊 Export
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ══════════════ STATUS MODAL ══════════════ */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => !savingStatus && setStatusModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-800 mb-1">Thay đổi trạng thái</h3>
            <p className="text-xs text-slate-500 mb-4">
              #{statusModal.referral_number} · {statusModal.affiliate_email} ·{' '}
              <strong>{fmt(statusModal.commission_amount)}</strong>
            </p>

            <div className="mb-4">
              <p className="text-xs font-medium text-slate-600 mb-2">Chọn trạng thái mới</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_STATUSES.map(s => (
                  <button key={s} onClick={() => setNewStatus(s)}
                    className={`text-xs font-semibold px-3 py-2 rounded-lg border transition flex items-center gap-1.5 ${
                      newStatus === s
                        ? STATUS_CFG[s].badge + ' border-current ring-1 ring-current'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CFG[s].dot}`} />
                    {STATUS_CFG[s].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-slate-600 block mb-1">Lý do thay đổi *</label>
              <textarea value={statusReason} onChange={e => setStatusReason(e.target.value)} rows={3}
                placeholder="Nhập lý do — sẽ được lưu vào audit log..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={saveStatusChange}
                disabled={savingStatus || !statusReason.trim() || newStatus === statusModal.status}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition text-sm">
                {savingStatus ? 'Đang lưu...' : 'Xác nhận'}
              </button>
              <button onClick={() => setStatusModal(null)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ AUDIT LOG MODAL ══════════════ */}
      {auditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAuditModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800">📋 Lịch sử thay đổi</h3>
              <button onClick={() => setAuditModal(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              #{auditModal.commission.referral_number} · {auditModal.commission.affiliate_email} · {fmt(auditModal.commission.commission_amount)}
            </p>
            <div className="flex-1 overflow-y-auto">
              {auditModal.logs.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">Chưa có thay đổi nào được ghi lại</p>
              ) : (
                <div className="space-y-2">
                  {[...auditModal.logs].reverse().map(log => (
                    <div key={log.id} className="bg-slate-50 rounded-lg p-3 text-xs">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <StatusBadge status={log.old_status} />
                        <span className="text-slate-400 font-bold">→</span>
                        <StatusBadge status={log.new_status} />
                      </div>
                      <p className="text-slate-700 font-medium">{log.reason}</p>
                      <p className="text-slate-400 mt-1">{fmtDT(log.timestamp)} · {log.changed_by}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ MANUAL COMMISSION MODAL ══════════════ */}
      {manualOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => !savingManual && setManualOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md my-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-800 mb-1">➕ Thêm giao dịch thủ công</h3>
            <p className="text-xs text-slate-500 mb-5">Tạo commission bonus/bù trừ/điều chỉnh.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Affiliate Email *</label>
                <input list="aff-list" value={manualForm.affiliate_email}
                  onChange={e => setManualForm(f => ({ ...f, affiliate_email: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="email@example.com" />
                <datalist id="aff-list">
                  {affiliates.map(a => <option key={a.email} value={a.email} />)}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-2">Loại giao dịch *</label>
                <div className="space-y-1.5">
                  {([
                    ['BONUS',            'Thưởng',               'Cộng tiền, không gắn đơn hàng'],
                    ['COMPENSATION',     'Bù trừ',               'Bù trừ commission lỗi'],
                    ['MANUAL_REFERRAL',  'Giới thiệu thủ công',  'Admin attribute cho affiliate'],
                    ['ADJUSTMENT_PLUS',  'Điều chỉnh cộng',      'Lý do khác'],
                    ['ADJUSTMENT_MINUS', 'Điều chỉnh trừ',       'Trừ tiền khỏi số dư'],
                  ] as const).map(([val, label, desc]) => (
                    <label key={val}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                        manualForm.manual_type === val ? 'bg-violet-50 border-violet-300' : 'border-slate-200 hover:bg-slate-50'
                      }`}>
                      <input type="radio" value={val} checked={manualForm.manual_type === val}
                        onChange={() => setManualForm(f => ({ ...f, manual_type: val }))}
                        className="accent-violet-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-slate-700">{label}</span>
                        <span className="text-xs text-slate-400"> — {desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Số tiền (VNĐ) *</label>
                  <input type="number" value={manualForm.amount}
                    onChange={e => setManualForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    placeholder="101000" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Trạng thái ban đầu</label>
                  <select value={manualForm.initial_status}
                    onChange={e => setManualForm(f => ({ ...f, initial_status: e.target.value as CommissionStatus }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400">
                    <option value="available">{STATUS_CFG.available.label}</option>
                    <option value="paid_out">{STATUS_CFG.paid_out.label}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Lý do * (hiển thị với affiliate)</label>
                <textarea value={manualForm.reason}
                  onChange={e => setManualForm(f => ({ ...f, reason: e.target.value }))} rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                  placeholder="VD: Thưởng top affiliate tháng 5" />
              </div>

              {manualForm.manual_type === 'MANUAL_REFERRAL' && (
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Email người mua (tùy chọn)</label>
                  <input value={manualForm.buyer_email}
                    onChange={e => setManualForm(f => ({ ...f, buyer_email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    placeholder="buyer@example.com" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={submitManual} disabled={savingManual}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition text-sm">
                {savingManual ? 'Đang tạo...' : 'Tạo giao dịch'}
              </button>
              <button onClick={() => setManualOpen(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
