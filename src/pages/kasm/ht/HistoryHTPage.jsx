import { useState, useEffect, useCallback } from 'react'
import { callApiGet } from '@/lib/api'
import { cn, formatRupiah, formatTanggal } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Eye, Calendar, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react'

function currentMonth() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 7)
}

export default function HistoryHTPage() {
  const { profile } = useAuth()
  const [bulanTahun, setBulanTahun] = useState(currentMonth())
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [detail, setDetail] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await callApiGet('/bon-setor', {
        action: 'history',
        userEstim: profile?.kode_unit || '',
        bulanTahun,
      })
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat history' })
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [profile, bulanTahun])

  useEffect(() => {
    if (profile) fetchData()
  }, [fetchData, profile])

  return (
    <AppShell>
      <PageHeader
        title="History Transaksi Khasanah"
        description="Riwayat transaksi Khasanah per bulan"
        actions={
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        }
      />

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-gray-700">Bulan</label>
        <div className="relative w-full sm:w-56">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="month"
            value={bulanTahun}
            onChange={(e) => setBulanTahun(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
          />
        </div>
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
          <p className="text-gray-500 text-center py-12">Belum ada transaksi pada bulan ini.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">ID Transaksi</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r, i) => {
                const tgl = r.tanggal ?? r.tgl ?? '-'
                const idTrx = r.idTrx ?? r.id_trx ?? `trx-${i}`
                const total = Number(r.totalNominal ?? r.total_nominal ?? r.total ?? 0)
                const tipe = r.tipe ?? r.type ?? '-'
                return (
                  <tr key={`${idTrx}-${i}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{tgl ? formatTanggal(tgl, 'short') : '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{idTrx}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{tipe}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{formatRupiah(total)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDetail(r)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="h-3 w-3" /> Detail
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900">
                Detail Transaksi <span className="font-mono text-xs text-gray-500">{detail.idTrx ?? detail.id_trx}</span>
              </h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 py-4 text-sm">
              <div>
                <p className="text-gray-500">Tanggal</p>
                <p className="font-medium text-gray-900">{detail.tanggal ? formatTanggal(detail.tanggal, 'full') : '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Tipe</p>
                <p className="font-medium text-gray-900">{detail.tipe ?? detail.type ?? '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">User Estim</p>
                <p className="font-medium text-gray-900">{detail.userEstim ?? detail.user_estim ?? '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-medium text-gray-900">{formatRupiah(Number(detail.totalNominal ?? detail.total_nominal ?? detail.total ?? 0))}</p>
              </div>
            </div>
            <div className="overflow-x-auto border-t border-gray-100">
              {Array.isArray(detail.rincian ?? detail.detail ?? detail.rows) && (detail.rincian ?? detail.detail ?? detail.rows).length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                      <th className="px-5 py-2 font-medium">Kategori</th>
                      <th className="px-5 py-2 font-medium">Pecahan</th>
                      <th className="px-5 py-2 text-right font-medium">Lembar</th>
                      <th className="px-5 py-2 text-right font-medium">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.rincian ?? detail.detail ?? detail.rows).map((d, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-2 text-gray-700">{d.kategori ?? d.kat ?? '-'}</td>
                        <td className="px-5 py-2 text-gray-700">{d.pecahan ?? '-'}</td>
                        <td className="px-5 py-2 text-right text-gray-700">{d.lembar ?? '-'}</td>
                        <td className="px-5 py-2 text-right font-medium text-gray-900">{formatRupiah(Number(d.nominal ?? 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-5 py-6 text-center text-sm text-gray-500">Rincian pecahan tidak tersedia.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
