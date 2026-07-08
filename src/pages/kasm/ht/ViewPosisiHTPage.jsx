import { useState, useEffect, useCallback } from 'react'
import { callApiGet } from '@/lib/api'
import { cn, formatRupiah, formatTanggal } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Calendar, RefreshCw, CheckCircle, AlertCircle, MapPin } from 'lucide-react'

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

export default function ViewPosisiHTPage() {
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
      const res = await callApiGet('/posisi-kas', {
        action: 'view-posisi',
        tanggal,
        kodeWilayah: kw,
      })
      setRows(Array.isArray(res) ? res : [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat posisi kas' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [tanggal, kodeWilayah])

  useEffect(() => {
    if (profile) fetchData()
  }, [fetchData, profile])

  const columns = [
    {
      header: 'User Estim',
      accessor: 'userEstim',
      render: (row) => row.userEstim ?? row.user_estim ?? '-',
    },
    {
      header: 'Nama Unit',
      accessor: 'namaUnit',
      render: (row) => row.namaUnit ?? row.nama_unit ?? '-',
    },
    {
      header: 'Kode Cabang',
      accessor: 'kodeCabang',
      render: (row) => row.kodeCabang ?? row.kode_cabang ?? '-',
    },
    {
      header: 'Saldo Hari Ini',
      accessor: 'saldoHariIni',
      render: (row) => formatRupiah(Number(row.saldoHariIni ?? row.saldo_hari_ini ?? 0)),
    },
    {
      header: 'Saldo Fisik',
      accessor: 'saldoFisik',
      render: (row) => formatRupiah(Number(row.saldoFisik ?? row.saldo_fisik ?? 0)),
    },
    {
      header: 'Selisih',
      accessor: 'selisih',
      render: (row) => {
        const v = Number(row.selisih ?? 0)
        return (
          <span className={cn('font-medium', v >= 0 ? 'text-green-600' : 'text-red-600')}>
            {formatRupiah(v)}
          </span>
        )
      },
    },
  ]

  return (
    <AppShell>
      <PageHeader
        title="View Posisi Kas"
        description="Posisi kas seluruh teller per tanggal"
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
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          loading={false}
          total={rows.length}
          page={1}
          limit={rows.length || 25}
          showPagination={false}
          emptyMessage="Belum ada data posisi kas untuk tanggal ini"
        />
      )}
    </AppShell>
  )
}