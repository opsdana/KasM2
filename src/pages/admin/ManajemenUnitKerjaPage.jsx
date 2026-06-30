import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatTanggal, cn } from '@/lib/utils'
import { TIPE_UNIT_LABEL, TIPE_UNIT_COLOR } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import { Plus, RefreshCw, X, CheckCircle, AlertCircle, Edit3, Power, PowerOff } from 'lucide-react'

const DEFAULT_FORM = {
  kode_unit: '',
  nama_unit: '',
  tipe_unit: 'CABANG_PEMBANTU',
  parent_kode: '',
  aktif: true,
}

export default function ManajemenUnitKerjaPage() {
  const [units, setUnits] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [editingUnit, setEditingUnit] = useState(null)
  const [form, setForm] = useState({ ...DEFAULT_FORM })
  const [parentUnits, setParentUnits] = useState([])

  const limit = 25

  const fetchUnits = useCallback(async () => {
    setLoading(true)
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1
      const { data, error, count } = await supabase
        .from('unit_kerja')
        .select('*', { count: 'exact' })
        .order('kode_unit', { ascending: true })
        .range(from, to)

      if (error) throw error
      setUnits(data || [])
      setTotal(count || 0)
    } catch (e) {
      console.error('Error fetching units:', e)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  // Load parent units dropdown — refresh setiap form dibuka
  useEffect(() => {
    if (!showForm) return
    supabase.from('unit_kerja')
      .select('kode_unit, nama_unit, tipe_unit')
      .eq('aktif', true)
      .order('kode_unit')
      .then(({ data }) => {
        if (data) setParentUnits(data)
      })
  }, [showForm])

  const openAddForm = () => {
    setEditingUnit(null)
    setForm({ ...DEFAULT_FORM })
    setMessage(null)
    setShowForm(true)
  }

  const openEditForm = (unit) => {
    setEditingUnit(unit)
    setForm({
      kode_unit: unit.kode_unit,
      nama_unit: unit.nama_unit,
      tipe_unit: unit.tipe_unit,
      parent_kode: unit.parent_kode || '',
      aktif: unit.aktif,
    })
    setMessage(null)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingUnit(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const payload = {
        nama_unit: form.nama_unit.trim(),
        tipe_unit: form.tipe_unit,
        parent_kode: form.parent_kode || null,
      }

      if (editingUnit) {
        // Edit existing
        payload.aktif = form.aktif
        const { error } = await supabase
          .from('unit_kerja')
          .update(payload)
          .eq('kode_unit', editingUnit.kode_unit)

        if (error) throw error
        setMessage({ type: 'success', text: `Unit ${editingUnit.kode_unit} berhasil diperbarui!` })
      } else {
        // Add new
        const { error } = await supabase
          .from('unit_kerja')
          .insert({
            kode_unit: form.kode_unit.trim(),
            ...payload,
          })

        if (error) {
          if (error.code === '23505') throw new Error(`Kode unit "${form.kode_unit}" sudah digunakan`)
          throw error
        }
        setMessage({ type: 'success', text: `Unit ${form.kode_unit} berhasil ditambahkan!` })
      }

      closeForm()
      fetchUnits()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan unit' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleAktif = async (unit) => {
    const aksi = unit.aktif ? 'nonaktifkan' : 'aktifkan'
    if (!confirm(`${aksi === 'nonaktifkan' ? 'Nonaktifkan' : 'Aktifkan'} unit ${unit.kode_unit}?`)) return
    try {
      const { error } = await supabase
        .from('unit_kerja')
        .update({ aktif: !unit.aktif })
        .eq('kode_unit', unit.kode_unit)

      if (error) throw error
      fetchUnits()
    } catch (e) {
      alert('Gagal: ' + e.message)
    }
  }

  const columns = [
    { header: 'Kode', accessor: 'kode_unit' },
    { header: 'Nama Unit', accessor: 'nama_unit' },
    {
      header: 'Tipe',
      accessor: 'tipe_unit',
      render: (row) => (
        <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', TIPE_UNIT_COLOR[row.tipe_unit])}>
          {TIPE_UNIT_LABEL[row.tipe_unit]}
        </span>
      ),
    },
    {
      header: 'Unit Induk',
      accessor: 'parent_kode',
      render: (row) => {
        if (!row.parent_kode) return <span className="text-gray-400">—</span>
        const parent = parentUnits.find((p) => p.kode_unit === row.parent_kode)
        return parent ? parent.nama_unit : row.parent_kode
      },
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
      header: 'Dibuat',
      accessor: 'created_at',
      render: (row) => formatTanggal(row.created_at, 'datetime'),
    },
    {
      header: 'Aksi',
      accessor: 'kode_unit',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEditForm(row) }}
            className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-secondary font-medium"
          >
            <Edit3 className="h-3 w-3" /> Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleAktif(row) }}
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              row.aktif ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
            )}
          >
            {row.aktif ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
            {row.aktif ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <AppShell>
      <PageHeader
        title="Manajemen Unit Kerja"
        description="Kelola data unit kerja: tambah, edit, dan nonaktifkan unit"
        actions={
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary"
          >
            <Plus className="h-4 w-4" /> Tambah Unit
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

      {/* Form Tambah / Edit Unit */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              {editingUnit ? `Edit Unit: ${editingUnit.kode_unit}` : 'Tambah Unit Baru'}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!!editingUnit}
                value={form.kode_unit}
                onChange={(e) => setForm((f) => ({ ...f, kode_unit: e.target.value }))}
                placeholder="Contoh: 009"
                className={cn(
                  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none',
                  !!editingUnit && 'bg-gray-100 text-gray-500 cursor-not-allowed'
                )}
              />
              {editingUnit && <p className="text-xs text-gray-400 mt-1">Kode unit tidak dapat diubah</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama_unit}
                onChange={(e) => setForm((f) => ({ ...f, nama_unit: e.target.value }))}
                placeholder="Nama unit kerja"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Unit <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.tipe_unit}
                onChange={(e) => setForm((f) => ({ ...f, tipe_unit: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
              >
                {Object.entries(TIPE_UNIT_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Induk</label>
              <select
                value={form.parent_kode}
                onChange={(e) => setForm((f) => ({ ...f, parent_kode: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
              >
                <option value="">— Tidak ada (Unit Induk Utama) —</option>
                {parentUnits
                  .filter((p) => p.kode_unit !== editingUnit?.kode_unit)
                  .map((p) => (
                    <option key={p.kode_unit} value={p.kode_unit}>
                      {p.kode_unit} — {p.nama_unit} ({TIPE_UNIT_LABEL[p.tipe_unit]})
                    </option>
                  ))}
              </select>
            </div>
            {/* Aktif checkbox for edit mode */}
            {editingUnit && (
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.aktif}
                    onChange={(e) => setForm((f) => ({ ...f, aktif: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-secondary"
                  />
                  <span className="text-sm font-medium text-gray-700">Unit Aktif</span>
                </label>
              </div>
            )}
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60"
              >
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {submitting ? 'Menyimpan...' : editingUnit ? 'Simpan Perubahan' : 'Tambah Unit'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={units}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        emptyMessage="Belum ada data unit kerja"
      />
    </AppShell>
  )
}
