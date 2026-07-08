import { useState, useEffect, useCallback } from 'react'
import { callApiGet } from '@/lib/api'
import { cn, formatRupiah, formatTanggal, exportToCSV } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Calendar, RefreshCw, CheckCircle, AlertCircle, FileSpreadsheet, Download } from 'lucide-react'

function todayStr() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

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

export default function CitTukabPage() {
  const { profile } = useAuth()
  const [tanggal, setTanggal] = useState(todayStr())
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await callApiGet('/cit-atm', { action: 'tukab', tanggal })
      setRows(Array.isArray(res) ? res : res?.rows || res?.data || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat data CIT TUKAB' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [tanggal])

  useEffect(() => {
    if (profile) fetchData()
  }, [fetchData, profile])

  const columns = rows.length > 0 ? Object.keys(rows[0]) : []

  const handleExport = () => {
    if (!rows.length) return
    exportToCSV(rows, `cit_tukab_${tanggal}.csv`)
  }

  return (
    <AppShell>
      <PageHeader
        title="CIT TUKAB"
        description="CIT Tukar Uang Kaspoffice"
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
            <p className="text-sm">Belum ada data CIT TUKAB untuk tanggal ini.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  {columns.map((key, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{headerLabel(key)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-gray-50 transition-colors">
                    {columns.map((key, ci) => (
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
      )}
    </AppShell>
  )
}
