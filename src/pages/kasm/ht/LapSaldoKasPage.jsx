import { useState, useEffect, useCallback } from 'react'
import { callApiGet } from '@/lib/api'
import { cn, formatRupiah, formatTanggal } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/shared/StatCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Calendar, RefreshCw, CheckCircle, AlertCircle, MapPin, Wallet, Landmark, Users, Download } from 'lucide-react'

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

const CURRENCY_HEADERS = ['saldo', 'nominal', 'jumlah', 'total', 'debet', 'kredit', 'selisih', 'grand', 'vault', 'teller']

function headerLabel(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function isCurrencyHeader(key) {
  return CURRENCY_HEADERS.some((h) => key.toLowerCase().includes(h.toLowerCase()))
}

function renderCell(key, value) {
  if (value == null) return '-'
  if (typeof value === 'number' && isCurrencyHeader(key)) return formatRupiah(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function sumArray(arr) {
  if (!Array.isArray(arr)) return null
  let s = 0
  for (const r of arr) {
    const v = r.nominal ?? r.jumlah ?? r.saldo ?? r.total ?? r.nominalKas
    if (typeof v === 'number') s += v
    else if (v != null) s += Number(v) || 0
  }
  return s
}

function FlexibleTable({ title, rows }) {
  if (!Array.isArray(rows) || rows.length === 0) return null
  const cols = Object.keys(rows[0])
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              {cols.map((key, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{headerLabel(key)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-gray-50 transition-colors">
                {cols.map((key, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      'px-4 py-3 text-sm text-gray-700 whitespace-nowrap',
                      isCurrencyHeader(key) && typeof row[key] === 'number' && 'text-right tabular-nums font-medium'
                    )}
                  >
                    {renderCell(key, row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function LapSaldoKasPage() {
  const { profile } = useAuth()
  const [tanggal, setTanggal] = useState(todayStr())
  const [kodeWilayah, setKodeWilayah] = useState('ALL')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const kw = kodeWilayah === 'ALL' ? '' : kodeWilayah
      const res = await callApiGet('/laporan-ht', { action: 'saldo-kas', tanggal, kodeWilayah: kw })
      setData(res)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat rincian saldo khasanah' })
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [tanggal, kodeWilayah])

  useEffect(() => {
    if (profile) fetchData()
  }, [fetchData, profile])

  const grandTotal = Number(data?.grandTotal ?? 0)
  const vaultVal = typeof data?.vault === 'number' ? data.vault : sumArray(data?.vault)
  const tellerVal = typeof data?.teller === 'number' ? data.teller : sumArray(data?.teller)

  const vaultArr = Array.isArray(data?.vault) ? data.vault : null
  const tellerArr = Array.isArray(data?.teller) ? data.teller : null

  const otherSections = []
  if (data && typeof data === 'object') {
    for (const [k, v] of Object.entries(data)) {
      if (['grandTotal', 'vault', 'teller'].includes(k)) continue
      if (Array.isArray(v) && v.length) otherSections.push({ title: headerLabel(k), rows: v })
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Rincian Saldo Khasanah"
        description="Laporan rincian saldo Khasanah"
        actions={
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
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
      ) : !data ? (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400">
            <Download className="h-8 w-8" />
            <p className="text-sm">Belum ada data rincian saldo khasanah untuk tanggal ini.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <StatCard title="Grand Total Saldo Khasanah" value={formatRupiah(grandTotal)} icon={Wallet} color="purple" />
            {vaultVal != null && <StatCard title="Saldo Vault" value={formatRupiah(vaultVal)} icon={Landmark} color="blue" />}
            {tellerVal != null && <StatCard title="Saldo Teller" value={formatRupiah(tellerVal)} icon={Users} color="default" />}
          </div>

          <div className="space-y-4">
            {vaultArr && <FlexibleTable title="Rincian Vault" rows={vaultArr} />}
            {tellerArr && <FlexibleTable title="Rincian Cashbox Teller" rows={tellerArr} />}
            {otherSections.map((s) => (
              <FlexibleTable key={s.title} title={s.title} rows={s.rows} />
            ))}
            {!vaultArr && !tellerArr && otherSections.length === 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-center py-12">Tidak ada rincian breakdown tersedia.</p>
              </div>
            )}
          </div>
        </>
      )}
    </AppShell>
  )
}
