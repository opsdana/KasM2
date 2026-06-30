import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatTanggal } from '@/lib/utils'
import { ROLE, ROLE_LABEL, ROLE_COLOR } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { cn } from '@/lib/utils'
import { Plus, UserX, RefreshCw, X, CheckCircle, AlertCircle } from 'lucide-react'

export default function ManajemenUserPage() {
  const { profile, getToken } = useAuth()

  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [units, setUnits] = useState([])

  const [form, setForm] = useState({
    email: '',
    password: '',
    nama_lengkap: '',
    nip: '',
    kode_unit: '',
    role: 'CABANG_PEMBANTU',
    jabatan: '',
  })

  const limit = 25

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*, unit_kerja:kode_unit(nama_unit, tipe_unit)', { count: 'exact' })

      // CABANG_INDUK lihat unit sendiri + bawahan
      if (profile?.role === ROLE.CABANG_INDUK) {
        const { data: unitData } = await supabase
          .from('unit_kerja')
          .select('kode_unit')
          .or('kode_unit.eq.009,parent_kode.eq.009')

        const kodeUnits = (unitData || []).map((u) => u.kode_unit)
        if (kodeUnits.length > 0) {
          query = query.in('kode_unit', kodeUnits)
        }
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      setUsers(data || [])
      setTotal(count || 0)
    } catch (e) {
      console.error('Error fetching users:', e)
    } finally {
      setLoading(false)
    }
  }, [page, profile])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    supabase.from('unit_kerja').select('kode_unit, nama_unit, tipe_unit').order('kode_unit').then(({ data }) => {
      if (data) setUnits(data)
    })
  }, [])

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      // Call Edge Function (pakai service_role di backend)
      const token = await getToken()

      if (!token) {
        throw new Error('Sesi tidak valid. Silakan login ulang.')
      }

      const res = await fetch(
        'https://zaycilkvyoftkldiokmj.supabase.co/functions/v1/create-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            nama_lengkap: form.nama_lengkap,
            nip: form.nip || null,
            kode_unit: form.kode_unit,
            role: form.role,
            jabatan: form.jabatan || null,
          }),
        }
      )

      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      setMessage({ type: 'success', text: `User ${form.email} berhasil dibuat!` })
      setShowForm(false)
      setForm({ email: '', password: '', nama_lengkap: '', nip: '', kode_unit: '', role: 'CABANG_PEMBANTU', jabatan: '' })
      fetchUsers()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal membuat user' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleNonaktifkan = async (userId) => {
    if (!confirm('Nonaktifkan user ini?')) return
    try {
      await supabase.from('profiles').update({ aktif: false }).eq('id', userId)
      fetchUsers()
    } catch (e) {
      alert('Gagal: ' + e.message)
    }
  }

  const columns = [
    { header: 'Nama', accessor: 'nama_lengkap' },
    { header: 'NIP', accessor: 'nip', render: (row) => row.nip || '-' },
    {
      header: 'Unit',
      accessor: 'kode_unit',
      render: (row) => (
        <span className="text-sm">{row.unit_kerja?.nama_unit || row.kode_unit}</span>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', ROLE_COLOR[row.role])}>
          {ROLE_LABEL[row.role]}
        </span>
      ),
    },
    { header: 'Jabatan', accessor: 'jabatan', render: (row) => row.jabatan || '-' },
    {
      header: 'Last Login',
      accessor: 'last_login',
      render: (row) => row.last_login ? formatTanggal(row.last_login, 'datetime') : 'Belum pernah',
    },
    {
      header: 'Status',
      accessor: 'aktif',
      render: (row) => (
        <span className={cn(
          'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
          row.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        )}>
          {row.aktif ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.aktif && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNonaktifkan(row.id) }}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
            >
              <UserX className="h-3 w-3" /> Nonaktifkan
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <AppShell>
      <PageHeader
        title="Manajemen User"
        description="Kelola user dan akses sistem"
        actions={
          <button
            onClick={() => { setShowForm(!showForm); setMessage(null) }}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary"
          >
            <Plus className="h-4 w-4" /> Tambah User
          </button>
        }
      />

      {message && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Form Tambah User */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Tambah User Baru</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <input type="text" required value={form.nama_lengkap} onChange={(e) => setForm((f) => ({ ...f, nama_lengkap: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
              <input type="text" value={form.nip} onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja <span className="text-red-500">*</span></label>
              <select required value={form.kode_unit} onChange={(e) => setForm((f) => ({ ...f, kode_unit: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none">
                <option value="">Pilih Unit</option>
                {units.map((u) => <option key={u.kode_unit} value={u.kode_unit}>{u.kode_unit} — {u.nama_unit}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
              <select required value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none">
                {Object.entries(ROLE_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
              <input type="text" value={form.jabatan} onChange={(e) => setForm((f) => ({ ...f, jabatan: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {submitting ? 'Membuat...' : 'Buat User'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">Batal</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        emptyMessage="Belum ada user terdaftar"
      />
    </AppShell>
  )
}
