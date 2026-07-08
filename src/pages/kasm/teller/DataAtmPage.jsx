import { useState, useEffect, useCallback } from 'react'
import { callApiGet, callApiPost, callApiDelete } from '@/lib/api'
import { cn } from '@/lib/utils'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import { Plus, RefreshCw, X, CheckCircle, AlertCircle, Edit3, Trash2 } from 'lucide-react'

const DENOM_OPTIONS = ['100000', '50000', '20000', '10000', '5000', '2000', '1000']

const EMPTY_FORM = {
  id: '',
  namaAtm: '',
  denom: '100000',
}

export default function DataAtmPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [message, setMessage] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await callApiGet('/data-atm')
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat data ATM' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openAddForm = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setMessage(null)
    setShowForm(true)
  }

  const openEditForm = (row) => {
    setEditing(row)
    setForm({
      id: row.id ?? '',
      namaAtm: row.namaAtm ?? '',
      denom: String(row.denom ?? '100000'),
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
        namaAtm: form.namaAtm.trim(),
        denom: form.denom,
      }
      if (editing) payload.id = editing.id
      await callApiPost('/data-atm', payload)
      setMessage({
        type: 'success',
        text: editing ? 'Data ATM berhasil diperbarui!' : 'Data ATM berhasil ditambahkan!',
      })
      closeForm()
      fetchData()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan data ATM' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (row) => {
    const nama = row.namaAtm ?? row.id
    if (!confirm(`Hapus data ATM "${nama}"?`)) return
    try {
      await callApiDelete(`/data-atm/${row.id}`)
      setMessage({ type: 'success', text: `Data ATM ${nama} berhasil dihapus!` })
      fetchData()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus data ATM' })
    }
  }

  const columns = [
    { header: 'Nama ATM', accessor: 'namaAtm', render: (r) => r.namaAtm || '-' },
    {
      header: 'Denom',
      accessor: 'denom',
      render: (r) => {
        const d = Number(r.denom ?? 0)
        return (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-brand-light text-brand-primary">
            {isNaN(d) ? r.denom : `Rp${d.toLocaleString('id-ID')}`}
          </span>
        )
      },
    },
    {
      header: 'Aksi',
      accessor: 'id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditForm(row)} className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-secondary font-medium">
            <Edit3 className="h-3 w-3" /> Edit
          </button>
          <button onClick={() => handleDelete(row)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
            <Trash2 className="h-3 w-3" /> Hapus
          </button>
        </div>
      ),
    },
  ]

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none'

  return (
    <AppShell>
      <PageHeader
        title="Data ATM"
        description="Manajemen data master ATM"
        actions={
          <button onClick={openAddForm} className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary">
            <Plus className="h-4 w-4" /> Tambah ATM
          </button>
        }
      />

      {message && (
        <div className={cn('mb-4 rounded-lg px-4 py-3 text-sm flex items-center gap-2',
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200')}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">{editing ? 'Edit Data ATM' : 'Tambah Data ATM'}</h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama ATM <span className="text-red-500">*</span></label>
              <input type="text" required value={form.namaAtm} onChange={(e) => setForm((f) => ({ ...f, namaAtm: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Denom <span className="text-red-500">*</span></label>
              <select required value={form.denom} onChange={(e) => setForm((f) => ({ ...f, denom: e.target.value }))} className={inputClass}>
                {DENOM_OPTIONS.map((d) => <option key={d} value={d}>{`Rp${Number(d).toLocaleString('id-ID')}`}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : editing ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah ATM'}
              </button>
              <button type="button" onClick={closeForm} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">Batal</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={rows} loading={loading} total={rows.length} page={1} limit={rows.length || 25} showPagination={false} emptyMessage="Belum ada data ATM" />
    </AppShell>
  )
}