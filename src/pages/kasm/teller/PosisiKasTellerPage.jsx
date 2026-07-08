import { useState, useEffect, useMemo, useCallback } from 'react'
import { callApiGet, callApiPost } from '@/lib/api'
import { cn, formatRupiah } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Save, Calendar, RefreshCw, CheckCircle, AlertCircle, Calculator } from 'lucide-react'

function todayStr() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function parseNum(v) {
  const n = parseInt(String(v ?? '').replace(/[^\d]/g, ''), 10)
  return isNaN(n) ? 0 : n
}

function fmtInput(n) {
  if (!n) return ''
  return new Intl.NumberFormat('id-ID').format(n)
}

const FIELDS = [
  { key: 'saldoKemarin', label: 'Saldo Kemarin', readonly: true },
  { key: 'penerimaanDebet', label: 'Penerimaan Debet' },
  { key: 'penerimaanAntar', label: 'Penerimaan Antar Teller' },
  { key: 'pembayaranKredit', label: 'Pembayaran Kredit' },
  { key: 'pembayaranAntar', label: 'Pembayaran Antar Teller' },
  { key: 'saldoFisik', label: 'Saldo Fisik' },
]

export default function PosisiKasTellerPage() {
  const { profile } = useAuth()
  const userEstim = profile?.kode_unit || ''
  const [tanggal, setTanggal] = useState(todayStr())
  const [form, setForm] = useState({
    saldoKemarin: 0,
    penerimaanDebet: 0,
    penerimaanAntar: 0,
    pembayaranKredit: 0,
    pembayaranAntar: 0,
    saldoFisik: 0,
  })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const saldoHariIni = useMemo(() => {
    return (
      parseNum(form.saldoKemarin) +
      parseNum(form.penerimaanDebet) +
      parseNum(form.penerimaanAntar) -
      parseNum(form.pembayaranKredit) -
      parseNum(form.pembayaranAntar)
    )
  }, [form])

  const selisih = useMemo(() => parseNum(form.saldoFisik) - saldoHariIni, [form.saldoFisik, saldoHariIni])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await callApiGet('/posisi-kas', { tanggal, userEstim })
      if (data && typeof data === 'object') {
        setForm({
          saldoKemarin: parseNum(data.saldoKemarin ?? data.saldo_kemarin ?? data.saldoKemarin),
          penerimaanDebet: parseNum(data.penerimaanDebet ?? data.penerimaan_debet),
          penerimaanAntar: parseNum(data.penerimaanAntar ?? data.penerimaan_antar),
          pembayaranKredit: parseNum(data.pembayaranKredit ?? data.pembayaran_kredit),
          pembayaranAntar: parseNum(data.pembayaranAntar ?? data.pembayaran_antar),
          saldoFisik: parseNum(data.saldoFisik ?? data.saldo_fisik),
        })
      }
    } catch (err) {
      const sk = err?.message?.toLowerCase().includes('not found') || err?.message?.includes('404')
      setMessage({ type: sk ? 'error' : 'error', text: err.message || 'Gagal memuat posisi kas' })
    } finally {
      setLoading(false)
    }
  }, [tanggal, userEstim])

  useEffect(() => {
    if (profile) fetchData()
  }, [fetchData, profile])

  const handleChange = (key, raw) => {
    setForm((f) => ({ ...f, [key]: parseNum(raw) }))
  }

  const handleSimpan = async () => {
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        tanggal,
        userEstim,
        saldoKemarin: parseNum(form.saldoKemarin),
        penerimaanDebet: parseNum(form.penerimaanDebet),
        penerimaanAntar: parseNum(form.penerimaanAntar),
        pembayaranKredit: parseNum(form.pembayaranKredit),
        pembayaranAntar: parseNum(form.pembayaranAntar),
        saldoHariIni,
        saldoFisik: parseNum(form.saldoFisik),
        selisih,
      }
      await callApiPost('/posisi-kas', payload)
      setMessage({ type: 'success', text: `Posisi kas tanggal ${tanggal} berhasil disimpan.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan posisi kas' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <PageHeader title="Posisi Kas Teller" description="Hitung & simpan posisi kas harian" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
              />
            </div>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Muat Data
        </button>
      </div>

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

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={fmtInput(parseNum(form[f.key]))}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                    readOnly={f.readonly}
                    className={cn(
                      'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20',
                      f.readonly && 'bg-gray-100 text-gray-500'
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-brand-primary" />
              <h3 className="text-sm font-semibold text-gray-900">Perhitungan</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Saldo Hari Ini</span>
                <span className="font-semibold text-gray-900">{formatRupiah(saldoHariIni)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-gray-500">Selisih (Fisik - Hari Ini)</span>
                <span className={cn('font-semibold', selisih >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {formatRupiah(selisih)}
                </span>
              </div>
            </div>
            <button
              onClick={handleSimpan}
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60"
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? 'Menyimpan...' : 'Simpan Posisi Kas'}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}