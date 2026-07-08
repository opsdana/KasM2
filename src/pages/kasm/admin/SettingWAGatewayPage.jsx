import { useState, useEffect, useCallback } from 'react'
import { callApiGet, callApiPost } from '@/lib/api'
import { cn } from '@/lib/utils'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

const EMPTY_FORM = {
  id: '',
  kodeWilayah: '',
  noHp: '',
  apiKey: '',
  waktu: '',
  targetKF: '',
  targetTukab: '',
  targetInputTukab: '',
  waktuPerkiraanH1: '',
  targetPerkiraanH1: '',
  targetPosisiKas: '',
  notifEnabled: true,
}

export default function SettingWAGatewayPage() {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await callApiGet('/setting-wa-gateway')
      const list = Array.isArray(data) ? data : []
      const existing = list.length > 0 ? list[0] : null
      if (existing) {
        setForm({
          id: existing.id ?? '',
          kodeWilayah: existing.kodeWilayah ?? '',
          noHp: existing.noHp ?? '',
          apiKey: existing.apiKey ?? '',
          waktu: existing.waktu ?? '',
          targetKF: existing.targetKF ?? '',
          targetTukab: existing.targetTukab ?? '',
          targetInputTukab: existing.targetInputTukab ?? '',
          waktuPerkiraanH1: existing.waktuPerkiraanH1 ?? '',
          targetPerkiraanH1: existing.targetPerkiraanH1 ?? '',
          targetPosisiKas: existing.targetPosisiKas ?? '',
          notifEnabled: existing.notifEnabled ?? true,
        })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat pengaturan WA Gateway' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = { ...form }
      if (!payload.id) delete payload.id
      await callApiPost('/setting-wa-gateway', payload)
      setMessage({ type: 'success', text: 'Pengaturan WA Gateway berhasil disimpan!' })
      fetchSettings()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan pengaturan' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none'

  return (
    <AppShell>
      <PageHeader
        title="Setting WA Gateway"
        description="Konfigurasi WhatsApp Gateway untuk notifikasi otomatis"
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

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <LoadingSpinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Wilayah</label>
              <input type="text" value={form.kodeWilayah} onChange={(e) => setForm((f) => ({ ...f, kodeWilayah: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
              <input type="text" value={form.noHp} onChange={(e) => setForm((f) => ({ ...f, noHp: e.target.value }))} placeholder="Contoh: 628xxxxxxxxxx" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input type="text" value={form.apiKey} onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
              <input type="time" value={form.waktu} onChange={(e) => setForm((f) => ({ ...f, waktu: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Perkiraan H-1</label>
              <input type="time" value={form.waktuPerkiraanH1} onChange={(e) => setForm((f) => ({ ...f, waktuPerkiraanH1: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target KF</label>
              <input type="text" value={form.targetKF} onChange={(e) => setForm((f) => ({ ...f, targetKF: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target TUKAB</label>
              <input type="text" value={form.targetTukab} onChange={(e) => setForm((f) => ({ ...f, targetTukab: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Input TUKAB</label>
              <input type="text" value={form.targetInputTukab} onChange={(e) => setForm((f) => ({ ...f, targetInputTukab: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Perkiraan H-1</label>
              <input type="text" value={form.targetPerkiraanH1} onChange={(e) => setForm((f) => ({ ...f, targetPerkiraanH1: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Posisi Kas</label>
              <input type="text" value={form.targetPosisiKas} onChange={(e) => setForm((f) => ({ ...f, targetPosisiKas: e.target.value }))} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Notifikasi</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, notifEnabled: !f.notifEnabled }))}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    form.notifEnabled ? 'bg-green-500' : 'bg-gray-300'
                  )}
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    form.notifEnabled ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  form.notifEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                )}>
                  {form.notifEnabled ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-gray-100 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60"
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}
    </AppShell>
  )
}