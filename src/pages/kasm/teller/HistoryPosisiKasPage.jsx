import { useState, useEffect, useCallback } from 'react'
import { callApiGet } from '@/lib/api'
import { cn, formatRupiah, formatTanggal } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { CheckCircle, AlertCircle, Calendar } from 'lucide-react'

function currentMonth() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${m}`
}

export default function HistoryPosisiKasPage() {
  const { profile } = useAuth()
  const [bulanTahun, setBulanTahun] = useState(currentMonth())
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchData = useCallback(async (bt) => {
    setLoading(true)
    setMessage(null)
    setRows([])
    try {
      const data = await callApiGet('/posisi-kas', {
        action: 'history',
        userEstim: profile?.kode_unit ?? '',
        bulanTahun: bt,
      })
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat history posisi kas' })
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    fetchData(bulanTahun)
  }, [fetchData, bulanTahun])

  const totalPenerimaan = rows.reduce((s, r) => s + (r.penerimaanTotal ?? 0), 0)
  const totalPembayaran = rows.reduce((s, r) => s + (r.pembayaranTotal ?? 0), 0)

  return (
    <AppShell>
      <PageHeader title="History Posisi Kas" description="Riwayat posisi kas teller per bulan" />

      {message && (
        <div className={cn('mb-4 rounded-lg px-4 py-3 text-sm flex items-center gap-2',
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200')}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Bulan</label>
          </div>
          <input
            type="month"
            value={bulanTahun}
            onChange={(e) => setBulanTahun(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
          />
          <p className="text-xs text-gray-400 sm:ml-2">User Estim: {profile?.kode_unit ?? '-'}</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo Kemarin</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Penerimaan Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Pembayaran Total</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo Hari Ini</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo Fisik</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <p className="text-sm text-gray-400">Tidak ada data posisi kas</p>
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => {
                    const selisih = Number(r.selisih ?? 0)
                    return (
                      <tr key={r.id ?? i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {r.tanggal ? formatTanggal(r.tanggal, 'short') : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-right">{formatRupiah(r.saldoKemarin ?? 0)}</td>
                        <td className="px-4 py-3 text-sm text-green-700 whitespace-nowrap text-right">{formatRupiah(r.penerimaanTotal ?? 0)}</td>
                        <td className="px-4 py-3 text-sm text-red-700 whitespace-nowrap text-right">{formatRupiah(r.pembayaranTotal ?? 0)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-right font-semibold">{formatRupiah(r.saldoHariIni ?? 0)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap text-right">{formatRupiah(r.saldoFisik ?? 0)}</td>
                        <td className={cn('px-4 py-3 text-sm whitespace-nowrap text-right font-semibold',
                          selisih === 0 ? 'text-gray-700' : selisih > 0 ? 'text-green-700' : 'text-red-700')}>
                          {formatRupiah(selisih)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">-</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-700 text-right">{formatRupiah(totalPenerimaan)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-700 text-right">{formatRupiah(totalPembayaran)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">-</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">-</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">-</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </AppShell>
  )
}