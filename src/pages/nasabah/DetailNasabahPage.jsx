import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNasabah } from '@/hooks/useNasabah'
import { supabase } from '@/lib/supabase'
import { formatRupiah, formatTanggal, cn } from '@/lib/utils'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { ArrowLeft, Edit3, Save, X, AlertTriangle, CheckCircle } from 'lucide-react'

export default function DetailNasabahPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchNasabahById, updateNasabah } = useNasabah()

  const [record, setRecord] = useState(null)
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchNasabahById(id)
      setRecord(data)
      setForm({
        status_rekening: data.status_rekening,
        saldo: data.saldo?.toString() || '',
        catatan: data.catatan || '',
        flag_perhatian: data.flag_perhatian,
      })

      // Fetch riwayat perubahan
      const { data: logs } = await supabase
        .from('log_aktivitas')
        .select('*, profiles:user_id(nama_lengkap)')
        .eq('record_id', id)
        .order('created_at', { ascending: false })
        .limit(20)

      setRiwayat(logs || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateNasabah(id, {
        ...form,
        saldo: form.saldo ? parseFloat(form.saldo.replace(/\D/g, '')) : 0,
      })
      setEditing(false)
      loadData()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <AppShell><LoadingSpinner size="lg" text="Memuat detail nasabah..." /></AppShell>
  }

  if (error && !record) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <p className="text-red-500">Error: {error}</p>
          <button onClick={() => navigate('/nasabah/harian')} className="mt-4 text-brand-secondary hover:underline">
            Kembali ke daftar
          </button>
        </div>
      </AppShell>
    )
  }

  if (!record) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <p className="text-gray-500">Data tidak ditemukan</p>
          <button onClick={() => navigate('/nasabah/harian')} className="mt-4 text-brand-secondary hover:underline">
            Kembali ke daftar
          </button>
        </div>
      </AppShell>
    )
  }

  const statusBadge = (status) => {
    const colors = {
      AKTIF: 'bg-green-100 text-green-800',
      PASIF: 'bg-yellow-100 text-yellow-800',
      BLOKIR: 'bg-red-100 text-red-800',
      TUTUP: 'bg-gray-100 text-gray-600',
    }
    return (
      <span className={cn('inline-block px-2.5 py-1 rounded-full text-sm font-medium', colors[status] || '')}>
        {status}
      </span>
    )
  }

  return (
    <AppShell>
      <PageHeader
        title="Detail Nasabah"
        description={`No. Rekening: ${record.no_rekening}`}
        breadcrumbs={[
          { label: 'Data Nasabah', href: '/nasabah/harian' },
          { label: 'Detail' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/nasabah/harian')}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </button>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary"
              >
                <Edit3 className="h-4 w-4" /> Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" /> Batal
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Utama */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Informasi Nasabah</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="No. Rekening" value={record.no_rekening} mono />
              <InfoField label="Nama Nasabah" value={record.nama_nasabah} />
              <InfoField label="Jenis Nasabah" value={record.jenis_nasabah === 'PERORANGAN' ? 'Perorangan' : 'Badan Usaha'} />
              <InfoField label="Jenis Produk" value={record.jenis_produk} />
              <InfoField label="Status Rekening" value={statusBadge(record.status_rekening)} isComponent />
              <InfoField label="Saldo" value={formatRupiah(record.saldo)} />
              <InfoField label="Tanggal Data" value={formatTanggal(record.tanggal)} />
              <InfoField label="Kode Unit" value={record.unit_kerja?.nama_unit || record.kode_unit} />
              <InfoField
                label="Flag Perhatian"
                value={record.flag_perhatian ? '🚩 Perlu Perhatian' : '✅ Normal'}
              />
              <InfoField label="Diinput Oleh" value={record.profiles?.nama_lengkap || '-'} />
              <InfoField label="Terakhir Diupdate" value={formatTanggal(record.updated_at, 'datetime')} />
            </div>
            {record.catatan && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-1">Catatan</p>
                <p className="text-sm text-gray-600">{record.catatan}</p>
              </div>
            )}
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="bg-white rounded-xl border border-brand-secondary/30 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-brand-secondary" /> Edit Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Rekening</label>
                  <select
                    value={form.status_rekening}
                    onChange={(e) => setForm((f) => ({ ...f, status_rekening: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="PASIF">PASIF</option>
                    <option value="BLOKIR">BLOKIR</option>
                    <option value="TUTUP">TUTUP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Saldo</label>
                  <input
                    type="text"
                    value={form.saldo ? formatRupiah(parseInt(form.saldo.replace(/\D/g, '')) || 0) : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, '')
                      setForm((f) => ({ ...f, saldo: raw }))
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={form.catatan}
                    onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.flag_perhatian}
                      onChange={(e) => setForm((f) => ({ ...f, flag_perhatian: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
                    />
                    <span className="text-sm text-gray-700">🚩 Nasabah perlu perhatian</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Riwayat */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Riwayat Perubahan</h3>
            {riwayat.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada riwayat perubahan</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {riwayat.map((log, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={cn(
                        'h-2 w-2 rounded-full',
                        log.aksi === 'CREATE' ? 'bg-green-500' :
                        log.aksi === 'UPDATE' ? 'bg-blue-500' : 'bg-gray-400'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{log.profiles?.nama_lengkap || 'Sistem'}</span>
                        {' '}{log.aksi === 'CREATE' ? 'membuat' : 'mengubah'} data
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTanggal(log.created_at, 'datetime')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function InfoField({ label, value, mono, isComponent }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {isComponent ? (
        value
      ) : (
        <p className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>
          {value || '-'}
        </p>
      )}
    </div>
  )
}
