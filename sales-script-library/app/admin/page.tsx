'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { INDUSTRY_LABELS, SITUATION_LABELS } from '@/lib/constants'

interface Script {
  id: string; title: string; industry: string; situation: string
  preview: string; content: string; psychology: string; examples: string; createdAt: string
}
interface Member { id: string; name: string; email: string; phone?: string; status?: 'pending' | 'active'; createdAt: string; expiresAt?: string }

const INDUSTRIES = ['bds', 'bao-hiem', 'my-pham', 'fb', 'khac'] as const
const SITUATIONS = ['chot-sale', 'xu-ly-tu-choi', 'khach-che-dat', 'khach-im-lang', 'follow-up'] as const

const EMPTY_FORM = { title: '', industry: 'bds', situation: 'chot-sale', preview: '', content: '', psychology: '', examples: '' }

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Đang tải...</div>}>
      <AdminPageInner />
    </Suspense>
  )
}

function AdminPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'scripts' | 'members'>('scripts')
  const [scripts, setScripts] = useState<Script[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [memberForm, setMemberForm] = useState({ name: '', email: '', password: '' })
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.isAdmin) { router.push('/admin/login'); return }
      setAuthed(true)
      loadScripts()
      loadMembers()
    })
  }, [])

  useEffect(() => {
    const editParam = searchParams.get('edit')
    if (editParam && scripts.length > 0) {
      const s = scripts.find(x => x.id === editParam)
      if (s) openEdit(s)
    }
  }, [searchParams, scripts])

  const loadScripts = () => fetch('/api/scripts').then(r => r.json()).then(setScripts)
  const loadMembers = () => fetch('/api/members').then(r => r.json()).then(setMembers)

  const openEdit = (s: Script) => {
    setForm({ title: s.title, industry: s.industry, situation: s.situation, preview: s.preview, content: s.content, psychology: s.psychology, examples: s.examples })
    setEditId(s.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(false) }

  const saveScript = async () => {
    const url = editId ? `/api/scripts/${editId}` : '/api/scripts'
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) {
      setMsg(editId ? 'Đã cập nhật kịch bản!' : 'Đã thêm kịch bản mới!')
      resetForm()
      loadScripts()
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const delScript = async (id: string) => {
    if (!confirm('Xóa kịch bản này?')) return
    await fetch(`/api/scripts/${id}`, { method: 'DELETE' })
    loadScripts()
  }

  const saveMember = async () => {
    const res = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(memberForm) })
    const data = await res.json()
    if (res.ok) {
      setMsg('Đã thêm thành viên!'); setMemberForm({ name: '', email: '', password: '' }); setShowMemberForm(false); loadMembers(); setTimeout(() => setMsg(''), 3000)
    } else { setMsg(data.error) }
  }

  const delMember = async (id: string) => {
    if (!confirm('Xóa thành viên này?')) return
    await fetch('/api/members', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    loadMembers()
  }

  const activateMember = async (id: string) => {
    const res = await fetch('/api/members/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { setMsg('Đã kích hoạt tài khoản thành công!'); loadMembers(); setTimeout(() => setMsg(''), 3000) }
  }

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }

  if (authed === null) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Đang tải...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin navbar */}
      <nav className="bg-slate-900 text-slate-900 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-amber-600 font-bold text-sm">📚 KB Sales</Link>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-medium">Admin</span>
        </div>
        <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-900 transition">Đăng xuất</button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {msg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
            ✅ {msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('scripts')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'scripts' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-400'}`}>
            📝 Kịch bản ({scripts.length})
          </button>
          <button onClick={() => setTab('members')} className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${tab === 'members' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-400'}`}>
            👥 Thành viên ({members.length})
            {members.filter(m => m.status === 'pending').length > 0 && (
              <span className="bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded-full">
                {members.filter(m => m.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Scripts tab */}
        {tab === 'scripts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Quản lý Kịch bản</h2>
              <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl transition">
                {showForm && !editId ? '✕ Đóng' : '+ Thêm mới'}
              </button>
            </div>

            {/* Script form */}
            {showForm && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-slate-700 mb-4">{editId ? '✏️ Chỉnh sửa kịch bản' : '➕ Thêm kịch bản mới'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Tiêu đề *</label>
                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2744]" placeholder="Tiêu đề kịch bản" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Ngành *</label>
                    <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2744]">
                      {INDUSTRIES.map(v => <option key={v} value={v}>{INDUSTRY_LABELS[v]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Tình huống *</label>
                    <select value={form.situation} onChange={e => setForm({ ...form, situation: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2744]">
                      {SITUATIONS.map(v => <option key={v} value={v}>{SITUATION_LABELS[v]}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Preview (tóm tắt ngắn) *</label>
                    <textarea value={form.preview} onChange={e => setForm({ ...form, preview: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2744] resize-none" placeholder="Mô tả ngắn hiển thị trên card" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Nội dung kịch bản (Markdown) *</label>
                    <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0f2744] resize-y" placeholder="Viết kịch bản đầy đủ..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Phân tích tâm lý</label>
                    <textarea value={form.psychology} onChange={e => setForm({ ...form, psychology: e.target.value })} rows={5} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0f2744] resize-y" placeholder="Giải thích tâm lý học đằng sau kịch bản..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Ví dụ áp dụng</label>
                    <textarea value={form.examples} onChange={e => setForm({ ...form, examples: e.target.value })} rows={5} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0f2744] resize-y" placeholder="Các ví dụ thực tế..." />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={saveScript} className="bg-[#0f2744] hover:bg-[#1e3f7a] text-slate-900 text-sm font-semibold px-5 py-2 rounded-xl transition">
                    {editId ? 'Lưu thay đổi' : 'Thêm kịch bản'}
                  </button>
                  <button onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition">
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Scripts list */}
            <div className="space-y-3">
              {scripts.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{INDUSTRY_LABELS[s.industry as keyof typeof INDUSTRY_LABELS]}</span>
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{SITUATION_LABELS[s.situation as keyof typeof SITUATION_LABELS]}</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(s.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/scripts/${s.id}`} target="_blank" className="text-xs text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition">
                      Xem
                    </Link>
                    <button onClick={() => openEdit(s)} className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition">
                      Sửa
                    </button>
                    <button onClick={() => delScript(s.id)} className="text-xs text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition">
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members tab */}
        {tab === 'members' && (
          <div>
            {/* Pending members alert */}
            {members.filter(m => m.status === 'pending').length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-5">
                <p className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                  ⏳ Chờ kích hoạt ({members.filter(m => m.status === 'pending').length} tài khoản)
                </p>
                <div className="space-y-2">
                  {members.filter(m => m.status === 'pending').map(m => (
                    <div key={m.id} className="bg-white border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                        <p className="text-xs text-slate-500 truncate">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                        <p className="text-xs text-slate-400">Đăng ký: {new Date(m.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => activateMember(m.id)}
                          className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          ✓ Kích hoạt
                        </button>
                        <button onClick={() => delMember(m.id)} className="text-xs text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Thành viên đang hoạt động</h2>
              <button onClick={() => setShowMemberForm(!showMemberForm)} className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl transition">
                {showMemberForm ? '✕ Đóng' : '+ Thêm thủ công'}
              </button>
            </div>

            {showMemberForm && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-slate-700 mb-4">➕ Thêm thành viên (kích hoạt ngay)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Họ tên *</label>
                    <input value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Email *</label>
                    <input type="email" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Mật khẩu *</label>
                    <input type="text" value={memberForm.password} onChange={e => setMemberForm({ ...memberForm, password: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Mật khẩu" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={saveMember} className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">Thêm & kích hoạt</button>
                  <button onClick={() => setShowMemberForm(false)} className="text-sm text-slate-500 px-4 py-2 rounded-xl border border-slate-200">Hủy</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {members.filter(m => m.status !== 'pending').length === 0 ? (
                <p className="text-center text-slate-500 py-8 text-sm">Chưa có thành viên nào đang hoạt động</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Tên</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Email</th>
                      <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden sm:table-cell">Hạn dùng</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.filter(m => m.status !== 'pending').map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{m.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{m.email}</td>
                        <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">
                          {m.expiresAt ? new Date(m.expiresAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => delMember(m.id)} className="text-xs text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
