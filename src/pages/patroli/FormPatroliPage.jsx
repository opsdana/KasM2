import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePatroli } from '@/hooks/usePatroli'
import { hitungSkorKepatuhan, cn, getSkorColor } from '@/lib/utils'
import { JENIS_PATROLI, PERIODE_PATROLI, TINGKAT_RISIKO_COLOR } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Save, ArrowLeft, Plus, Trash2, Calculator, AlertCircle, CheckCircle } from 'lucide-react'

export default function FormPatroliPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { createPatroli } = usePatroli()

  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    tanggal_patroli: today,
    periode: 'HARIAN',
    jenis_patroli: 'KYC Nasabah Baru',
    total_rekening_dipatroli: 0,
    rekening_bermasalah: 0,
    temuan_kritis: 0,
    temuan_sedang: 0,
    temuan_ringan: 0,
    deskripsi_temuan: '',
    status_tindak_lanjut: 'BELUM',
    catatan_tindak_lanjut: '',
    deadline_tindak_lanjut: '',
  })

  const [detailTemuan, setDetailTemuan] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [submitMessage, setSubmitMessage] = useState('')

  const skor = hitungSkorKepatuhan(
    form.temuan_kritis || 0,
    form.temuan_sedang || 0,
    form.temuan_ringan || 0
  )

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const addTemuan = () => {
    setDetailTemuan((prev) => [
      ...prev,
      { no_rekening: '', nama_nasabah: '', jenis_temuan: '', tingkat_risiko: 'RINGAN', deskripsi_temuan: '', rekomendasi: '' },
    ])
  }

  const removeTemuan = (idx) => {
    setDetailTemuan((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateTemuan = (idx, field, value) => {
    setDetailTemuan((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)))
  }

  const validate = () => {
    const errs = {}
    if (!form.tanggal_patroli) errs.tanggal_patroli = 'Tanggal harus diisi'
    if (!form.jenis_patroli) errs.jenis_patroli = 'Jenis patroli harus dipilih'
    if (!form.total_rekening_dipatroli || form.total_rekening_dipatroli <= 0) errs.total_rekening_dipatroli = 'Minimal 1 rekening'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitStatus(null)
    try {
      await createPatroli(form, detailTemuan.filter((t) => t.jenis_temuan))
      setSubmitStatus('success')
      setSubmitMessage('Patroli berhasil disimpan!')
      setTimeout(() => navigate('/patroli'), 1500)
    } catch (err) {
      setSubmitStatus('error')
      setSubmitMessage(err.message || 'Gagal menyimpan patroli')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all ${
      errors[field] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-brand-secondary'
    }`

  return (
    <AppShell>
      <PageHeader
        title="Form Patroli Baru"
        description="Input hasil patroli kepatuhan data nasabah"
        breadcrumbs={[{ label: 'Patroli Kepatuhan', href: '/patroli' }, { label: 'Form Baru' }]}
        actions={
          <button onClick={() => navigate('/patroli')} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
        }
      />

      {submitStatus && (
        <div className={`mb-6 rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
          submitStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitStatus === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {submitMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Informasi Patroli</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Patroli <span className="text-red-500">*</span></label>
                <input type="date" value={form.tanggal_patroli} onChange={(e) => handleChange('tanggal_patroli', e.target.value)} className={inputClass('tanggal_patroli')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Unit</label>
                <input type="text" value={profile?.kode_unit || ''} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Periode <span className="text-red-500">*</span></label>
                <select value={form.periode} onChange={(e) => handleChange('periode', e.target.value)} className={inputClass('periode')}>
                  {PERIODE_PATROLI.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Patroli <span className="text-red-500">*</span></label>
                <select value={form.jenis_patroli} onChange={(e) => handleChange('jenis_patroli', e.target.value)} className={inputClass('jenis_patroli')}>
                  {JENIS_PATROLI.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Rekening Dipatroli <span className="text-red-500">*</span></label>
                <input type="number" min={0} value={form.total_rekening_dipatroli} onChange={(e) => handleChange('total_rekening_dipatroli', parseInt(e.target.value) || 0)} className={inputClass('total_rekening_dipatroli')} />
                {errors.total_rekening_dipatroli && <p className="mt-1 text-xs text-red-500">{errors.total_rekening_dipatroli}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rekening Bermasalah</label>
                <input type="number" min={0} value={form.rekening_bermasalah} onChange={(e) => handleChange('rekening_bermasalah', parseInt(e.target.value) || 0)} className={inputClass('rekening_bermasalah')} />
              </div>
            </div>
          </div>

          {/* Temuan */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Temuan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Temuan Kritis</label>
                <input type="number" min={0} value={form.temuan_kritis} onChange={(e) => handleChange('temuan_kritis', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Temuan Sedang</label>
                <input type="number" min={0} value={form.temuan_sedang} onChange={(e) => handleChange('temuan_sedang', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Temuan Ringan</label>
                <input type="number" min={0} value={form.temuan_ringan} onChange={(e) => handleChange('temuan_ringan', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Temuan</label>
              <textarea value={form.deskripsi_temuan} onChange={(e) => handleChange('deskripsi_temuan', e.target.value)} rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none resize-none" />
            </div>
          </div>

          {/* Tindak Lanjut */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Tindak Lanjut</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Tindak Lanjut</label>
                <select value={form.status_tindak_lanjut} onChange={(e) => handleChange('status_tindak_lanjut', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none">
                  <option value="BELUM">Belum</option>
                  <option value="PROSES">Proses</option>
                  <option value="SELESAI">Selesai</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
                <input type="date" value={form.deadline_tindak_lanjut} onChange={(e) => handleChange('deadline_tindak_lanjut', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Tindak Lanjut</label>
                <textarea value={form.catatan_tindak_lanjut} onChange={(e) => handleChange('catatan_tindak_lanjut', e.target.value)} rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none resize-none" />
              </div>
            </div>
          </div>

          {/* Detail Temuan */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Detail Temuan</h3>
              <button onClick={addTemuan} className="flex items-center gap-1.5 text-sm text-brand-secondary hover:text-brand-primary font-medium">
                <Plus className="h-4 w-4" /> Tambah Temuan
              </button>
            </div>
            {detailTemuan.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Belum ada detail temuan. Klik "Tambah Temuan" untuk menambah.</p>
            ) : (
              <div className="space-y-4">
                {detailTemuan.map((t, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 relative">
                    <button onClick={() => removeTemuan(idx)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" placeholder="No. Rekening" value={t.no_rekening} onChange={(e) => updateTemuan(idx, 'no_rekening', e.target.value)}
                        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/20 outline-none" />
                      <input type="text" placeholder="Nama Nasabah" value={t.nama_nasabah} onChange={(e) => updateTemuan(idx, 'nama_nasabah', e.target.value)}
                        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/20 outline-none" />
                      <select value={t.tingkat_risiko} onChange={(e) => updateTemuan(idx, 'tingkat_risiko', e.target.value)}
                        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/20 outline-none">
                        <option value="KRITIS">🔴 Kritis</option>
                        <option value="SEDANG">🟠 Sedang</option>
                        <option value="RINGAN">🟡 Ringan</option>
                      </select>
                      <input type="text" placeholder="Jenis Temuan" value={t.jenis_temuan} onChange={(e) => updateTemuan(idx, 'jenis_temuan', e.target.value)}
                        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/20 outline-none" />
                      <input type="text" placeholder="Rekomendasi" value={t.rekomendasi} onChange={(e) => updateTemuan(idx, 'rekomendasi', e.target.value)}
                        className="sm:col-span-2 rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/20 outline-none" />
                      <textarea placeholder="Deskripsi temuan..." value={t.deskripsi_temuan} onChange={(e) => updateTemuan(idx, 'deskripsi_temuan', e.target.value)} rows={2}
                        className="sm:col-span-3 rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary/20 outline-none resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Skor Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-20">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-brand-secondary" /> Preview Skor
            </h3>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center h-28 w-28 rounded-full border-4 border-gray-100">
                <span className={cn('text-3xl font-bold', getSkorColor(skor))}>{skor}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Skor Kepatuhan</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nilai dasar</span>
                <span className="font-semibold">100</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Kritis ({form.temuan_kritis} × 10)</span>
                <span>-{form.temuan_kritis * 10}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Sedang ({form.temuan_sedang} × 5)</span>
                <span>-{form.temuan_sedang * 5}</span>
              </div>
              <div className="flex justify-between text-yellow-600">
                <span>Ringan ({form.temuan_ringan} × 2)</span>
                <span>-{form.temuan_ringan * 2}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Skor Akhir</span>
                <span className={getSkorColor(skor)}>{skor}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitting ? 'Menyimpan...' : 'Simpan Patroli'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
