import { useState, useEffect, useCallback } from 'react'
import { callApiGet, callApiPost, callApiDelete } from '@/lib/api'
import { cn } from '@/lib/utils'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Plus, RefreshCw, X, CheckCircle, AlertCircle, Edit3, Trash2 } from 'lucide-react'

const EMPTY_FORM = {
  id: '',
  kodeWilayah: '',
  nipPenyelia: '',
  namaPenyelia: '',
  nipPBO: '',
  namaPBO: '',
}

export default function DataPejabatHTPage() {
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
      const data = await callApiGet('/pejabat-ht')
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat data pejabat' })
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
      kodeWilayah: row.kodeWilayah ?? row.kode_wilayah ?? '',
      nipPenyelia: row.nipPenyelia ?? row.nip_penyelia ?? '',
      namaPenyelia: row.namaPenyelia ?? row.nama_penyelia ?? '',
      nipPBO: row.nipPBO ?? row.nip_pbo ?? '',
      namaPBO: row.namaPBO ?? row.nama_pbo ?? '',
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
        nipPenyelia: form.nipPenyelia.trim(),
        namaPenyelia: form.namaPenyelia.trim(),
        nipPBO: form.nipPBO.trim(),
        namaPBO: form.namaPBO.trim(),
      }
      if (editing) payload.id = editing.id
      await callApiPost('/pejabat-ht', payload)
      setMessage({
        type: 'success',
        text: editing ? 'Data pejabat berhasil diperbarui!' : 'Data pejabat berhasil ditambahkan!',
      })
      closeForm()
      fetchData()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan data pejabat' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (row) => {
    const nama = row.namaPenyelia ?? row.kodeWilayah ?? row.id
    if (!confirm(`Hapus data pejabat "${nama}"?`)) return
    try {
      await callApiDelete(`/pejabat-ht/${row.id}`)
      setMessage({ type: 'success', text: `Data pejabat ${nama} berhasil dihapus!` })
      fetchData()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus data pejabat' })
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none'

  return (
    <AppShell>
      <PageHeader
        title="Data Pejabat HT"
        description="Manajemen data pejabat Khasanah Teller"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary"
            >
              <Plus className="h-4 w-4" /> Tambah Pejabat
            </button>
          </div>
        }
      />

      {message && (
        <div className={cn(
          'mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
          message.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-red-200 bg-red-50 text-red-800'
        )}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">{editing ? 'Edit Data Pejabat' : 'Tambah Data Pejabat'}</h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Wilayah <span className="text-red-500">*</span></label>
              <input type="text" required value={form.kodeWilayah} onChange={(e) => setForm((f) => ({ ...f, kodeWilayah: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP Penyelia</label>
              <input type="text" value={form.nipPenyelia} onChange={(e) => setForm((f) => ({ ...f, nipPenyelia: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penyelia <span className="text-red-500">*</span></label>
              <input type="text" required value={form.namaPenyelia} onChange={(e) => setForm((f) => ({ ...f, namaPenyelia: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP PBO</label>
              <input type="text" value={form.nipPBO} onChange={(e) => setForm((f) => ({ ...f, nipPBO: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama PBO</label>
              <input type="text" value={form.namaPBO} onChange={(e) => setForm((f) => ({ ...f, namaPBO: e.target.value }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : editing ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Pejabat'}
              </button>
              <button type="button" onClick={closeForm} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">Batal</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : rows.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-center py-12">Belum ada data pejabat.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Kode Wilayah</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">NIP Penyelia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama Penyelia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">NIP PBO</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Nama PBO</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                  <tr key={r.id ?? i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.kodeWilayah ?? r.kode_wilayah ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.nipPenyelia ?? r.nip_penyelia ?? '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{r.namaPenyelia ?? r.nama_penyelia ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{r.nipPBO ?? r.nip_pbo ?? '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{r.namaPBO ?? r.nama_pbo ?? '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditForm(r)} className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-secondary font-medium">
                          <Edit3 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(r)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                          <Trash2 className="h-3 w-3" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  )
}
