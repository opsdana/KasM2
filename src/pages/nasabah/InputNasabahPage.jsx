import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useNasabah } from '@/hooks/useNasabah'
import { formatRupiah, isValidNoRekening } from '@/lib/utils'
import { JENIS_PRODUK, ROLE } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

export default function InputNasabahPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { createNasabah } = useNasabah()

  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    tanggal: today,
    no_rekening: '',
    nama_nasabah: '',
    jenis_nasabah: 'PERORANGAN',
    jenis_produk: 'Tabungan',
    status_rekening: 'AKTIF',
    saldo: '',
    catatan: '',
    flag_perhatian: false,
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error'
  const [submitMessage, setSubmitMessage] = useState('')

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const errs = {}

    if (!form.tanggal) errs.tanggal = 'Tanggal harus diisi'
    if (!form.no_rekening.trim()) {
      errs.no_rekening = 'No. Rekening harus diisi'
    } else if (!isValidNoRekening(form.no_rekening)) {
      errs.no_rekening = 'Format no. rekening tidak valid (5-30 digit angka)'
    }
    if (!form.nama_nasabah.trim()) errs.nama_nasabah = 'Nama nasabah harus diisi'
    if (!form.jenis_nasabah) errs.jenis_nasabah = 'Jenis nasabah harus dipilih'
    if (!form.jenis_produk) errs.jenis_produk = 'Jenis produk harus dipilih'
    if (!form.status_rekening) errs.status_rekening = 'Status rekening harus dipilih'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus(null)

    if (!validate()) return

    setSubmitting(true)
    try {
      await createNasabah({
        ...form,
        saldo: form.saldo ? parseFloat(form.saldo.replace(/\D/g, '')) : 0,
      })
      setSubmitStatus('success')
      setSubmitMessage('Data nasabah berhasil disimpan!')

      // Reset form
      setForm({
        tanggal: today,
        no_rekening: '',
        nama_nasabah: '',
        jenis_nasabah: 'PERORANGAN',
        jenis_produk: 'Tabungan',
        status_rekening: 'AKTIF',
        saldo: '',
        catatan: '',
        flag_perhatian: false,
      })

      // Redirect setelah 1.5 detik
      setTimeout(() => {
        navigate('/nasabah/harian')
      }, 1500)
    } catch (err) {
      setSubmitStatus('error')
      setSubmitMessage(err.message || 'Gagal menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all ${
      errors[field] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand-secondary'
    }`

  return (
    <AppShell>
      <PageHeader
        title="Input Data Nasabah Baru"
        description="Tambahkan data nasabah baru ke dalam sistem"
        breadcrumbs={[
          { label: 'Data Nasabah', href: '/nasabah/harian' },
          { label: 'Input Baru' },
        ]}
        actions={
          <button
            onClick={() => navigate('/nasabah/harian')}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
        }
      />

      {/* Status message */}
      {submitStatus && (
        <div className={`mb-6 rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
          submitStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitStatus === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {submitMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => handleChange('tanggal', e.target.value)}
                className={inputClass('tanggal')}
              />
              {errors.tanggal && <p className="mt-1 text-xs text-red-500">{errors.tanggal}</p>}
            </div>

            {/* Kode Unit (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Unit</label>
              <input
                type="text"
                value={profile?.kode_unit || ''}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
              />
            </div>

            {/* No. Rekening */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                No. Rekening <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.no_rekening}
                onChange={(e) => handleChange('no_rekening', e.target.value)}
                placeholder="Masukkan no. rekening (5-30 digit)"
                className={inputClass('no_rekening')}
              />
              {errors.no_rekening && <p className="mt-1 text-xs text-red-500">{errors.no_rekening}</p>}
            </div>

            {/* Nama Nasabah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Nasabah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nama_nasabah}
                onChange={(e) => handleChange('nama_nasabah', e.target.value)}
                placeholder="Nama lengkap nasabah"
                className={inputClass('nama_nasabah')}
              />
              {errors.nama_nasabah && <p className="mt-1 text-xs text-red-500">{errors.nama_nasabah}</p>}
            </div>

            {/* Jenis Nasabah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jenis Nasabah <span className="text-red-500">*</span>
              </label>
              <select
                value={form.jenis_nasabah}
                onChange={(e) => handleChange('jenis_nasabah', e.target.value)}
                className={inputClass('jenis_nasabah')}
              >
                <option value="PERORANGAN">Perorangan</option>
                <option value="BADAN_USAHA">Badan Usaha</option>
              </select>
              {errors.jenis_nasabah && <p className="mt-1 text-xs text-red-500">{errors.jenis_nasabah}</p>}
            </div>

            {/* Jenis Produk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jenis Produk <span className="text-red-500">*</span>
              </label>
              <select
                value={form.jenis_produk}
                onChange={(e) => handleChange('jenis_produk', e.target.value)}
                className={inputClass('jenis_produk')}
              >
                {JENIS_PRODUK.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.jenis_produk && <p className="mt-1 text-xs text-red-500">{errors.jenis_produk}</p>}
            </div>

            {/* Status Rekening */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status Rekening <span className="text-red-500">*</span>
              </label>
              <select
                value={form.status_rekening}
                onChange={(e) => handleChange('status_rekening', e.target.value)}
                className={inputClass('status_rekening')}
              >
                <option value="AKTIF">AKTIF</option>
                <option value="PASIF">PASIF</option>
                <option value="BLOKIR">BLOKIR</option>
                <option value="TUTUP">TUTUP</option>
              </select>
              {errors.status_rekening && <p className="mt-1 text-xs text-red-500">{errors.status_rekening}</p>}
            </div>

            {/* Saldo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Saldo</label>
              <input
                type="text"
                value={form.saldo ? formatRupiah(parseFloat(form.saldo.replace(/\D/g, '')) || 0) : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, '')
                  handleChange('saldo', raw)
                }}
                placeholder="Rp0"
                className={inputClass('saldo')}
              />
            </div>
          </div>

          {/* Flag Perhatian */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.flag_perhatian}
                onChange={(e) => handleChange('flag_perhatian', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
              />
              <span className="text-sm text-gray-700">
                🚩 Tandai sebagai nasabah yang perlu perhatian
              </span>
            </label>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan</label>
            <textarea
              value={form.catatan}
              onChange={(e) => handleChange('catatan', e.target.value)}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitting ? 'Menyimpan...' : 'Simpan Data'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/nasabah/harian')}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
