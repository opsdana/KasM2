import { useState, useEffect, useCallback } from 'react'
import { callApiGet, callApiPost, callApiDelete } from '@/lib/api'
import { cn, formatTanggal } from '@/lib/utils'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Plus, RefreshCw, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'

export default function HariLiburPage() {
  const [hariLibur, setHariLibur] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({ tanggal: '', keterangan: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await callApiGet('/hari-libur')
      const list = Array.isArray(data) ? data : []
      list.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
      setHariLibur(list)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat data hari libur' })
      setHariLibur([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.tanggal || !form.keterangan.trim()) return
    setSubmitting(true)
    setMessage(null)
    try {
      await callApiPost('/hari-libur', {
        tanggal: form.tanggal,
        keterangan: form.keterangan.trim(),
      })
      setMessage({ type: 'success', text: 'Hari libur berhasil ditambahkan!' })
      setForm({ tanggal: '', keterangan: '' })
      fetchData()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menambahkan hari libur' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Hapus hari libur "${item.keterangan}" pada ${formatTanggal(item.tanggal)}?`)) return
    try {
      await callApiDelete(`/hari-libur/${item.tanggal}`)
      setMessage({ type: 'success', text: 'Hari libur berhasil dihapus!' })
      fetchData()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menghapus hari libur' })
    }
  }

  const columns = [
    {
      header: 'Tanggal',
      accessor: 'tanggal',
      render: (row) => formatTanggal(row.tanggal),
    },
    { header: 'Keterangan', accessor: 'keterangan' },
    {
      header: 'Aksi',
      accessor: 'tanggal',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(row) }}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
        >
          <Trash2 className="h-3 w-3" /> Hapus
        </button>
      ),
    },
  ]

  return (
    <AppShell>
      <PageHeader
        title="Hari Libur"
        description="Kelola daftar hari libur nasional / cuti bersama"
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Tambah Hari Libur</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
            <input
              type="date"
              required
              value={form.tanggal}
              onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={form.keterangan}
              onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))}
              placeholder="Contoh: Libur Nasional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60"
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? 'Menambah...' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>

      <DataTable
        columns={columns}
        data={hariLibur}
        loading={loading}
        total={hariLibur.length}
        page={1}
        limit={hariLibur.length || 25}
        showPagination={false}
        emptyMessage="Belum ada data hari libur"
      />
    </AppShell>
  )
}