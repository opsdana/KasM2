import { useState, useEffect, useCallback } from 'react'
import { callApiGet } from '@/lib/api'
import { cn, formatRupiah, formatTanggal } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/shared/StatCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Scale, Calendar, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

function todayStr() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

export default function DashboardTellerPage() {
  const { profile } = useAuth()
  const [tanggal, setTanggal] = useState(todayStr())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await callApiGet('/dashboard', {
        action: 'teller',
        userEstim: profile?.kode_unit || '',
        kodeWilayah: '',
        tanggal,
      })
      setData(res)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat dashboard' })
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [profile, tanggal])

  useEffect(() => {
    if (profile) fetchData()
  }, [fetchData, profile])

  const saldo = Number(data?.saldoHariIni ?? data?.saldo ?? 0)
  const penerimaan = Number(data?.penerimaan ?? data?.penerimaanDebet ?? 0)
  const pembayaran = Number(data?.pembayaran ?? data?.pembayaranKredit ?? 0)
  const selisih = Number(data?.selisih ?? saldo - pembayaran + penerimaan)

  return (
    <AppShell>
      <PageHeader
        title="Dashboard Teller"
        description="Ringkasan posisi & mutasi kas harian"
        actions={
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="w-full sm:w-64">
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
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Saldo Hari Ini" value={formatRupiah(saldo)} icon={Wallet} color="blue" />
          <StatCard title="Penerimaan" value={formatRupiah(penerimaan)} icon={ArrowDownToLine} color="default" />
          <StatCard title="Pembayaran" value={formatRupiah(pembayaran)} icon={ArrowUpFromLine} color="orange" />
          <StatCard title="Selisih" value={formatRupiah(selisih)} icon={Scale} color={selisih >= 0 ? 'default' : 'red'} />
        </div>
      )}

      {!loading && !data && !message && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-center py-12">Belum ada data untuk tanggal ini.</p>
        </div>
      )}
    </AppShell>
  )
}