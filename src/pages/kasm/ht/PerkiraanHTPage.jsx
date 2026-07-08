import { useState, useEffect, useCallback, useMemo } from 'react'
import { callApiGet } from '@/lib/api'
import { cn, formatRupiah, formatTanggal, exportToCSV } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Calendar, RefreshCw, CheckCircle, AlertCircle, MapPin, FileSpreadsheet, Download } from 'lucide-react'

function todayStr() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

const WILAYAH_OPTIONS = [
  { value: '009', label: '009 - Cabang Induk' },
  { value: '043', label: '043 - Cabang Pembantu' },
  { value: '106', label: '106 - Cabang Pembantu' },
  { value: '175', label: '175 - Cabang Pembantu' },
  { value: '200', label: '200 - Cabang Pembantu' },
]

const FIELDS = [
  { key: 'userEstim', label: 'User Estim', money: false },
  { key: 'p100k_setor', label: 'P100K Setor', money: true },
  { key: 'p100k_bon', label: 'P100K Bon', money: true },
  { key: 'p50k_setor', label: 'P50K Setor', money: true },
  { key: 'p50k_bon', label: 'P50K Bon', money: true },
]

function getField(r, key) {
  if (r[key] != null) return r[key]
  const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  return r[camel]
}

function num(v) {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function rowTotal(r) {
  return FIELDS.filter((f) => f.money).reduce((s, f) => s + num(getField(r, f.key)), 0)
}

export default function PerkiraanHTPage() {
  const { profile } = useAuth()
  const [tanggal, setTanggal] = useState(todayStr())
  const [kodeWilayah, setKodeWilayah] = useState('ALL')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const kw = kodeWilayah === 'ALL' ? '' : kodeWilayah
      const res = await callApiGet('/perkiraan', { tanggal, kodeWilayah: kw })
      let list = []
      if (Array.isArray(res)) list = res
      else if (res && Array.isArray(res.rows)) list = res.rows
      else if (res && Array.isArray(res.data)) list = res.data
      else if (res) list = [res]
      setRows(list)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat perkiraan' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [tanggal, kodeWilayah])

  useEffect(() => {
    if (profile) fetchData()
  }, [fetchData, profile])

  const totals = useMemo(() => {
    const t = { p100k_setor: 0, p100k_bon: 0, p50k_setor: 0, p50k_bon: 0, total: 0 }
    for (const r of rows) {
      t.p100k_setor += num(getField(r, 'p100k_setor'))
      t.p100k_bon += num(getField(r, 'p100k_bon'))
      t.p50k_setor += num(getField(r, 'p50k_setor'))
      t.p50k_bon += num(getField(r, 'p50k_bon'))
      t.total += rowTotal(r)
    }
    return t
  }, [rows])

  const handleExport = () => {
    if (!rows.length) return
    const exportRows = rows.map((r) => {
      const o = { userEstim: getField(r, 'userEstim') ?? '' }
      for (const f of FIELDS) if (f.money) o[f.label] = num(getField(r, f.key))
      o['Total'] = rowTotal(r)
      return o
    })
    exportToCSV(exportRows, `perkiraan_${tanggal}${kodeWilayah !== 'ALL' ? `_${kodeWilayah}` : ''}.csv`)
  }

  return (
    <AppShell>
      <PageHeader
        title="Rekap Perkiraan Bon/Setor"
        description="Perkiraan bon dan setor Khasanah per teller"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={!rows.length}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export CSV
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
            </button>
          </div>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:w-56">
          <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
            />
          </div>
        </div>
        <div className="w-full sm:w-56">
          <label className="mb-1 block text-sm font-medium text-gray-700">Kode Wilayah</label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={kodeWilayah}
              onChange={(e) => setKodeWilayah(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
            >
              <option value="ALL">ALL - Semua Wilayah</option>
              {WILAYAH_OPTIONS.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500">{formatTanggal(tanggal, 'full')}</p>
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
      ) : rows.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400">
            <Download className="h-8 w-8" />
            <p className="text-sm">Belum ada data perkiraan untuk tanggal ini.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">User Estim</th>
                  {FIELDS.filter((f) => f.money).map((f) => (
                    <th key={f.key} className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{f.label}</th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{getField(r, 'userEstim') ?? '-'}</td>
                    {FIELDS.filter((f) => f.money).map((f) => (
                      <td key={f.key} className="px-4 py-3 text-sm text-right tabular-nums font-medium text-gray-900 whitespace-nowrap">{formatRupiah(num(getField(r, f.key)))}</td>
                    ))}
                    <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-brand-primary whitespace-nowrap">{formatRupiah(rowTotal(r))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">TOTAL</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-gray-900">{formatRupiah(totals.p100k_setor)}</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-gray-900">{formatRupiah(totals.p100k_bon)}</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-gray-900">{formatRupiah(totals.p50k_setor)}</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-gray-900">{formatRupiah(totals.p50k_bon)}</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-brand-primary">{formatRupiah(totals.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  )
}
