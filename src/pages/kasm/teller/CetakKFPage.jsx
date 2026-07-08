import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { callApiGet } from '@/lib/api'
import { cn, formatRupiah, formatTanggal, formatHariIni } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Printer, Calendar, CheckCircle, AlertCircle } from 'lucide-react'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function CetakKFPage() {
  const { mode } = useParams()
  const currentMode = mode === 'rincian' ? 'rincian' : 'setorbon'
  const { profile } = useAuth()
  const userEstim = profile?.kode_unit ?? ''
  const [tanggal, setTanggal] = useState(todayStr())
  const [setor, setSetor] = useState([])
  const [bon, setBon] = useState([])
  const [rincian, setRincian] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const fetchData = useCallback(async (tg) => {
    if (!tg) return
    setLoading(true)
    setMessage(null)
    setSetor([])
    setBon([])
    setRincian(null)
    try {
      if (currentMode === 'setorbon') {
        const data = await callApiGet('/bon-setor', { tanggal: tg, userEstim })
        if (Array.isArray(data)) {
          setSetor(data.filter((d) => (d.tipe ?? d.jenis ?? 'setor') === 'setor' || d.p100k_setor != null || d.p50k_setor != null))
          setBon(data.filter((d) => (d.tipe ?? d.jenis ?? 'bon') === 'bon' || d.p100k_bon != null || d.p50k_bon != null))
        }
      } else {
        const data = await callApiGet('/posisi-kas', { userEstim, tanggal: tg })
        setRincian(data ?? null)
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat data' })
    } finally {
      setLoading(false)
    }
  }, [currentMode, userEstim])

  useEffect(() => {
    fetchData(tanggal)
  }, [fetchData, tanggal])

  const totalSetor = setor.reduce((s, r) => s + (r.p100k_setor ?? 0) * 100000 + (r.p50k_setor ?? 0) * 50000 + (r.nominal ?? 0), 0)
  const totalBon = bon.reduce((s, r) => s + (r.p100k_bon ?? 0) * 100000 + (r.p50k_bon ?? 0) * 50000 + (r.nominal ?? 0), 0)

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none'

  return (
    <AppShell>
      <PageHeader
        title={currentMode === 'setorbon' ? 'Cetak Setor & Bon' : 'Cetak Rincian Kas'}
        description="Cetak dokumen kas fisik teller"
        actions={
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary">
            <Printer className="h-4 w-4" /> Cetak
          </button>
        }
      />

      {message && (
        <div className={cn('mb-4 rounded-lg px-4 py-3 text-sm flex items-center gap-2',
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200')}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Tanggal Cetak</label>
          </div>
          <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={inputClass} />
          <p className="text-xs text-gray-400 sm:ml-2">{formatHariIni()}</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8" style={{ minHeight: '60vh' }}>
          {/* Kop Surat */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-lg font-bold uppercase tracking-wide">BANK KAS MANUAL — KAS FISIK (KF)</h1>
            <p className="text-sm text-gray-600 mt-1">Unit: {profile?.unit_kerja?.nama_unit ?? profile?.kode_unit ?? '-'} &nbsp;|&nbsp; User Estim: {userEstim || '-'}</p>
            <p className="text-sm text-gray-600">{tanggal ? formatTanggal(tanggal, 'full') : formatHariIni()}</p>
          </div>

          {currentMode === 'setorbon' ? (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Ringkasan Setor &amp; Bon</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">Total Setor</h3>
                  <p className="text-2xl font-bold text-green-800">{formatRupiah(totalSetor)}</p>
                  <ul className="mt-3 text-sm text-gray-700 space-y-1">
                    {setor.length === 0 ? (
                      <li className="text-gray-400 italic">Tidak ada data setor</li>
                    ) : (
                      setor.map((r, i) => (
                        <li key={r.id ?? i} className="flex justify-between">
                          <span>{r.namaNasabah ?? r.keterangan ?? 'Setor'}</span>
                          <span>{formatRupiah((r.p100k_setor ?? 0) * 100000 + (r.p50k_setor ?? 0) * 50000 + (r.nominal ?? 0))}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <h3 className="text-sm font-semibold text-orange-800 mb-2">Total Bon</h3>
                  <p className="text-2xl font-bold text-orange-800">{formatRupiah(totalBon)}</p>
                  <ul className="mt-3 text-sm text-gray-700 space-y-1">
                    {bon.length === 0 ? (
                      <li className="text-gray-400 italic">Tidak ada data bon</li>
                    ) : (
                      bon.map((r, i) => (
                        <li key={r.id ?? i} className="flex justify-between">
                          <span>{r.namaNasabah ?? r.keterangan ?? 'Bon'}</span>
                          <span>{formatRupiah((r.p100k_bon ?? 0) * 100000 + (r.p50k_bon ?? 0) * 50000 + (r.nominal ?? 0))}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Rincian Kas</h2>
              {!rincian ? (
                <p className="text-sm text-gray-400 italic">Tidak ada rincian kas untuk tanggal ini</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Saldo Kemarin</p>
                    <p className="font-bold text-gray-900">{formatRupiah(rincian.saldoKemarin ?? 0)}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Penerimaan Total</p>
                    <p className="font-bold text-green-700">{formatRupiah(rincian.penerimaanTotal ?? 0)}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Pembayaran Total</p>
                    <p className="font-bold text-red-700">{formatRupiah(rincian.pembayaranTotal ?? 0)}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Saldo Hari Ini</p>
                    <p className="font-bold text-gray-900">{formatRupiah(rincian.saldoHariIni ?? 0)}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Saldo Fisik</p>
                    <p className="font-bold text-gray-900">{formatRupiah(rincian.saldoFisik ?? 0)}</p>
                  </div>
                  <div className={cn('rounded-lg border p-3', (rincian.selisih ?? 0) === 0 ? 'border-gray-200' : 'border-red-200 bg-red-50')}>
                    <p className="text-xs text-gray-500">Selisih</p>
                    <p className={cn('font-bold', (rincian.selisih ?? 0) === 0 ? 'text-gray-900' : 'text-red-700')}>{formatRupiah(rincian.selisih ?? 0)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tanda tangan */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-4">
            <div className="text-center">
              <p className="text-sm text-gray-700">Mengetahui,</p>
              <p className="text-sm text-gray-700 mb-16">Pimkas</p>
              <div className="border-t border-gray-400 pt-1 mx-8"></div>
              <p className="text-sm font-medium text-gray-900">(________________)</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-700">Dibuat oleh,</p>
              <p className="text-sm text-gray-700 mb-16">Teller</p>
              <div className="border-t border-gray-400 pt-1 mx-8"></div>
              <p className="text-sm font-medium text-gray-900">(________________)</p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}