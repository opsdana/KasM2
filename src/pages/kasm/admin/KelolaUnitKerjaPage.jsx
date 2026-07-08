import { useState, useEffect, useCallback } from 'react'
import { callApiGet, callApiPost, callApiDelete } from '@/lib/api'
import { cn } from '@/lib/utils'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Plus, RefreshCw, X, CheckCircle, AlertCircle, Edit3, Trash2 } from 'lucide-react'

const EMPTY_FORM = {
  id: '',
  nip: '',
  namaPegawai: '',
  namaUnit: '',
  kodeWilayah: '',
  namaWilayah: '',
  kodeCabang: '',
  namaCabang: '',
}

export default function KelolaUnitKerjaPage() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [message, setMessage] = useState(null)

  const fetchUnits = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await callApiGet('/unit-kerja')
      setUnits(Array.isArray(data) ? data : [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat data unit kerja' })
      setUnits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  const openAddForm = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setMessage(null)
    setShowForm(true)
  }

  const openEditForm = (unit) => {
    setEditing(unit)
    setForm({
      id: unit.id ?? '',
      nip: unit.nip ?? '',
      namaPegawai: unit.nama_pegawai ?? '',
      namaUnit: unit.nama_unit ?? '',
      kodeWilayah: unit.kode_wilayah ?? '',
      namaWilayah: unit.nama_wilayah ?? '',
      kodeCabang: unit.kode_cabang ?? '',
      namaCabang: unit.nama_cabang ?? '',
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
        nip: form.nip.trim(),
        nama_pegawai: form.namaPegawai.trim(),
        nama_unit: form.namaUnit.trim(),
        kode_wilayah: form.kodeWilayah.trim(),
        nama_wilayah: form.namaWilayah.trim(),
        kode_cabang: form.kodeCabang.trim(),
        nama_cabang: form.namaCabang.trim(),
      }
      if (editing) payload.id = editing.id
      await callApiPost('/unit-kerja', payload)
      setMessage({
        type: 'success',
        text: editing ? `Data ${form.namaPegawai} berhasil diperbarui!` : `Data ${form.namaPegawai} berhasil ditambahkan!`,
      })
      closeForm()
      fetchUnits()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan data unit kerja' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (unit) => {
    const nama = unit.nama_pegawai ?? unit.id
    if (!confirm(`Hapus data pegawai "${nama}"? Tindakan ini tidak dapat dibatalkan.`)) return
    try {
      await callApiDelete(`/unit-kerja/${unit.id}`)
      setMessage({ type: 'success', text: `Data ${nama} berhasil dihapus!` })
      fetchUnits()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus data' })
    }
  }

  const columns = [
    { header: 'NIP', accessor: 'nip', render: (row) => row.nip ?? '-' },
    { header: 'Nama Pegawai', accessor: 'nama_pegawai', render: (row) => row.nama_pegawai ?? '-' },
    { header: 'Nama Unit', accessor: 'nama_unit', render: (row) => row.nama_unit ?? '-' },
    { header: 'Kode Wilayah', accessor: 'kode_wilayah', render: (row) => row.kode_wilayah ?? '-' },
    { header: 'Nama Wilayah', accessor: 'nama_wilayah', render: (row) => row.nama_wilayah ?? '-' },
    { header: 'Kode Cabang', accessor: 'kode_cabang', render: (row) => row.kode_cabang ?? '-' },
    { header: 'Nama Cabang', accessor: 'nama_cabang', render: (row) => row.nama_cabang ?? '-' },
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
        title="Kelola Unit Kerja"
        description="Manajemen data pegawai & unit kerja KasM2"
        actions={
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary"
          >
            <Plus className="h-4 w-4" /> Tambah
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
              {editing ? `Edit Data: ${editing.nama_pegawai ?? ''}` : 'Tambah Data Unit Kerja'}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP <span className="text-red-500">*</span></label>
              <input type="text" required value={form.nip} onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pegawai <span className="text-red-500">*</span></label>
              <input type="text" required value={form.namaPegawai} onChange={(e) => setForm((f) => ({ ...f, namaPegawai: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Unit <span className="text-red-500">*</span></label>
              <input type="text" required value={form.namaUnit} onChange={(e) => setForm((f) => ({ ...f, namaUnit: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Wilayah <span className="text-red-500">*</span></label>
              <input type="text" required value={form.kodeWilayah} onChange={(e) => setForm((f) => ({ ...f, kodeWilayah: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Wilayah</label>
              <input type="text" value={form.namaWilayah} onChange={(e) => setForm((f) => ({ ...f, namaWilayah: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Cabang</label>
              <input type="text" value={form.kodeCabang} onChange={(e) => setForm((f) => ({ ...f, kodeCabang: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Cabang</label>
              <input type="text" value={form.namaCabang} onChange={(e) => setForm((f) => ({ ...f, namaCabang: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : editing ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {submitting ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Data'}
              </button>
              <button type="button" onClick={closeForm}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">Batal</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={units}
        loading={loading}
        total={units.length}
        page={1}
        limit={units.length || 25}
        showPagination={false}
        emptyMessage="Belum ada data unit kerja"
      />
    </AppShell>
  )
}