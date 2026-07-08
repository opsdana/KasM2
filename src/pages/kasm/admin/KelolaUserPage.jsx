import { useState, useEffect, useCallback } from 'react'
import { callApiGet, callApiPost, callApiDelete } from '@/lib/api'
import { cn, formatTanggal } from '@/lib/utils'
import { KASM_ROLE_MAP } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Plus, RefreshCw, X, CheckCircle, AlertCircle, Edit3, Trash2, Search } from 'lucide-react'

const ROLE_OPTIONS = ['admin', 'ht', 'teller', 'kf', 'capem']

const ROLE_BADGE_COLOR = {
  admin: 'bg-red-100 text-red-800',
  ht: 'bg-blue-100 text-blue-800',
  teller: 'bg-green-100 text-green-800',
  kf: 'bg-teal-100 text-teal-800',
  capem: 'bg-orange-100 text-orange-800',
}

const EMPTY_FORM = {
  id: '',
  kodeWilayah: '',
  kodeCabang: '',
  namaUnit: '',
  namaUser: '',
  role: 'admin',
  userEstim: '',
  password: '',
}

export default function KelolaUserPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [message, setMessage] = useState(null)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await callApiGet('/users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat data user' })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const openAddForm = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setMessage(null)
    setShowForm(true)
  }

  const openEditForm = (user) => {
    setEditing(user)
    setForm({
      id: user.id ?? '',
      kodeWilayah: user.kodeWilayah ?? user.kode_wilayah ?? '',
      kodeCabang: user.kodeCabang ?? user.kode_cabang ?? '',
      namaUnit: user.namaUnit ?? user.nama_unit ?? '',
      namaUser: user.namaUser ?? user.nama_user ?? '',
      role: user.role ?? 'admin',
      userEstim: user.userEstim ?? user.user_estim ?? '',
      password: '',
    })
    setMessage(null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setForm({ ...EMPTY_FORM })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        kodeWilayah: form.kodeWilayah.trim(),
        kodeCabang: form.kodeCabang.trim(),
        namaUnit: form.namaUnit.trim(),
        namaUser: form.namaUser.trim(),
        role: form.role,
        userEstim: form.userEstim.trim(),
        password: form.password,
      }
      if (editing) {
        payload.id = editing.id
      }
      await callApiPost('/users', payload)
      setMessage({
        type: 'success',
        text: editing ? `User ${form.namaUser} berhasil diperbarui!` : `User ${form.namaUser} berhasil ditambahkan!`,
      })
      closeForm()
      fetchUsers()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan user' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (user) => {
    const nama = user.namaUser ?? user.nama_user ?? user.id
    if (!confirm(`Hapus user "${nama}"? Tindakan ini tidak dapat dibatalkan.`)) return
    try {
      await callApiDelete(`/users/${user.id}`)
      setMessage({ type: 'success', text: `User ${nama} berhasil dihapus!` })
      fetchUsers()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus user' })
    }
  }

  const filteredUsers = users.filter((u) => {
    const kw = (u.kodeWilayah ?? u.kode_wilayah ?? '').toLowerCase()
    return search.trim() === '' || kw.includes(search.trim().toLowerCase())
  })

  const columns = [
    {
      header: 'Kode Wilayah',
      accessor: 'kodeWilayah',
      render: (row) => row.kodeWilayah ?? row.kode_wilayah ?? '-',
    },
    {
      header: 'Kode Cabang',
      accessor: 'kodeCabang',
      render: (row) => row.kodeCabang ?? row.kode_cabang ?? '-',
    },
    {
      header: 'Nama Unit',
      accessor: 'namaUnit',
      render: (row) => row.namaUnit ?? row.nama_unit ?? '-',
    },
    {
      header: 'Nama User',
      accessor: 'namaUser',
      render: (row) => row.namaUser ?? row.nama_user ?? '-',
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => {
        const role = (row.role ?? '').toLowerCase()
        const color = ROLE_BADGE_COLOR[role] ?? 'bg-gray-100 text-gray-800'
        const label = KASM_ROLE_MAP[role] ?? role
        return (
          <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', color)}>
            {label}
          </span>
        )
      },
    },
    {
      header: 'User Estim',
      accessor: 'userEstim',
      render: (row) => row.userEstim ?? row.user_estim ?? '-',
    },
    {
      header: 'Aksi',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEditForm(row) }}
            className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-secondary font-medium"
          >
            <Edit3 className="h-3 w-3" /> Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row) }}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
          >
            <Trash2 className="h-3 w-3" /> Hapus
          </button>
        </div>
      ),
    },
  ]

  return (
    <AppShell>
      <PageHeader
        title="Kelola User"
        description="Manajemen pengguna KasM2"
        actions={
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary"
          >
            <Plus className="h-4 w-4" /> Tambah User
          </button>
        }
      />

      {message && (
        <div className={cn(
          'mb-4 rounded-lg px-4 py-3 text-sm flex items-center gap-2',
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        )}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              {editing ? `Edit User: ${editing.namaUser ?? editing.nama_user}` : 'Tambah User Baru'}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Wilayah <span className="text-red-500">*</span></label>
              <input type="text" required value={form.kodeWilayah} onChange={(e) => setForm((f) => ({ ...f, kodeWilayah: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Cabang <span className="text-red-500">*</span></label>
              <input type="text" required value={form.kodeCabang} onChange={(e) => setForm((f) => ({ ...f, kodeCabang: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Unit <span className="text-red-500">*</span></label>
              <input type="text" required value={form.namaUnit} onChange={(e) => setForm((f) => ({ ...f, namaUnit: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama User <span className="text-red-500">*</span></label>
              <input type="text" required value={form.namaUser} onChange={(e) => setForm((f) => ({ ...f, namaUser: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
              <select required value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none">
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{KASM_ROLE_MAP[r] ?? r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Estim</label>
              <input type="text" value={form.userEstim} onChange={(e) => setForm((f) => ({ ...f, userEstim: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {!editing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                required={!editing}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editing ? 'Kosongkan jika tidak ingin mengubah password' : ''}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : editing ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah User'}
              </button>
              <button type="button" onClick={closeForm}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan kode wilayah..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        total={filteredUsers.length}
        page={1}
        limit={filteredUsers.length || 25}
        showPagination={false}
        emptyMessage="Belum ada data user"
      />
    </AppShell>
  )
}