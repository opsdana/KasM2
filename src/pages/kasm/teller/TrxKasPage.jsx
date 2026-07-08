import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { callApiGet, callApiPost } from '@/lib/api'
import { cn, formatRupiah } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Save, Calendar, RefreshCw, CheckCircle, AlertCircle, History } from 'lucide-react'

const CONFIG_UANG = {
  'KHASANAH': [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100],
  'HEAD TELLER': [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100],
  'ULE Campuran': [50000, 20000, 10000, 5000, 2000, 1000],
  'UTLE Campuran': [50000, 20000, 10000, 5000, 2000, 1000],
  'Lainnya': ['Logam', 'Valas'],
}

const TIPE_BY_MODE = {
  'SALDO AWAL': ['Saldo Awal'],
  'BON PAGI': ['Bon', 'Setor'],
  'TAMBAHAN': ['Bon Tambahan', 'Setor Tambahan'],
  'SETOR SORE': ['Setor', 'Bon'],
}

const SCOPE_OPTIONS = ['HEAD TELLER', 'KHASANAH']

function todayStr() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

function genIdTrx() {
  const s = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return s.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function parseNum(v) {
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10)
  return isNaN(n) ? 0 : n
}

function fmtInput(n) {
  if (!n) return ''
  return new Intl.NumberFormat('id-ID').format(n)
}

export default function TrxKasPage() {
  const { mode } = useParams()
  const currentMode = mode || 'SALDO AWAL'
  const { profile } = useAuth()

  const role = (profile?.role || '').toUpperCase()
  const isHT = role === 'HT'
  const userEstim = profile?.kode_unit || ''
  const kodeCabang = profile?.kode_unit || ''
  const kodeWilayah = profile?.kode_wilayah || profile?.kodeWilayah || ''

  const [tanggal, setTanggal] = useState(todayStr())
  const [idTrx, setIdTrx] = useState(genIdTrx)
  const [tipe, setTipe] = useState(TIPE_BY_MODE[currentMode]?.[0] || '')
  const [scope, setScope] = useState(isHT ? 'KHASANAH' : 'KHASANAH')
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setTipe(TIPE_BY_MODE[currentMode]?.[0] || '')
    setIdTrx(genIdTrx())
    setValues({})
    setMessage(null)
  }, [currentMode])

  const kategoriList = useMemo(() => {
    if (isHT) return ['KHASANAH']
    return ['KHASANAH', 'HEAD TELLER', 'ULE Campuran', 'UTLE Campuran', 'Lainnya']
  }, [isHT])

  const totals = useMemo(() => {
    const byKat = {}
    let grand = 0
    for (const kat of kategoriList) {
      let s = 0
      for (const p of CONFIG_UANG[kat] || []) {
        const v = parseNum(values[`${kat}|${p}`])
        s += v
        grand += v
      }
      byKat[kat] = s
    }
    return { byKat, grand }
  }, [values, kategoriList])

  const handleChange = (kat, p, raw) => {
    const n = parseNum(raw)
    setValues((v) => ({ ...v, [`${kat}|${p}`]: n }))
  }

  const handleLembar = (kat, p, lembar) => {
    const denom = typeof p === 'number' ? p : 0
    const l = parseNum(lembar)
    setValues((v) => ({ ...v, [`${kat}|${p}`]: l * denom }))
  }

  const buildRows = useCallback(() => {
    const rows = []
    for (const kat of kategoriList) {
      for (const p of CONFIG_UANG[kat] || []) {
        const nominal = parseNum(values[`${kat}|${p}`])
        if (nominal > 0) {
          const lembar = typeof p === 'number' && p > 0 ? Math.round(nominal / p) : 0
          rows.push([
            idTrx,
            tanggal,
            userEstim,
            tipe,
            kat,
            String(p),
            String(lembar),
            nominal,
            kodeCabang,
            kodeWilayah,
            scope,
          ])
        }
      }
    }
    return rows
  }, [kategoriList, values, idTrx, tanggal, userEstim, tipe, kodeCabang, kodeWilayah, scope])

  const handleSimpan = async () => {
    setMessage(null)
    if (totals.grand <= 0) {
      setMessage({ type: 'error', text: 'Total nominal masih 0. Isi pecahan terlebih dahulu.' })
      return
    }
    setSubmitting(true)
    try {
      const rows = buildRows()
      await callApiPost('/bon-setor', { rows })
      setMessage({ type: 'success', text: `Transaksi ${currentMode} berhasil disimpan (ID: ${idTrx}).` })
      setValues({})
      setIdTrx(genIdTrx())
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan transaksi' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleTarikKemarin = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const tgl = new Date()
      tgl.setDate(tgl.getDate() - 1)
      const kemarin = new Date(tgl.getTime() - tgl.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
      const data = await callApiGet('/dashboard', {
        action: 'teller',
        userEstim,
        kodeWilayah: '',
        tanggal: kemarin,
      })
      const next = await callApiGet('/next-working-day').catch(() => null)
      if (next?.tanggal || next?.nextWorkingDay) {
        setTanggal(next.tanggal || next.nextWorkingDay)
      } else {
        setTanggal(todayStr())
      }
      const det = data?.detail || data?.rincian || data?.rows || []
      const nv = {}
      if (Array.isArray(det)) {
        for (const r of det) {
          const kat = r.kategori || r.kat
          const pc = r.pecahan ?? r.pecahan
          const nom = Number(r.nominal ?? 0)
          if (kat && pc != null) nv[`${kat}|${pc}`] = nom
        }
      }
      setValues(nv)
      setMessage({ type: 'success', text: 'Data hari kemarin berhasil ditarik.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menarik data kemarin' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <PageHeader title={`Transaksi Kas: ${currentMode}`} description="Input transaksi fisik tunai" />

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-4">
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tipe</label>
            <select
              value={tipe}
              onChange={(e) => setTipe(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
            >
              {(TIPE_BY_MODE[currentMode] || []).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              disabled={isHT}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 disabled:bg-gray-100"
            >
              {SCOPE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {currentMode === 'SETOR SORE' && (
          <button
            onClick={handleTarikKemarin}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <History className="h-4 w-4" /> Tarik Data Kemarin
          </button>
        )}
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

      {loading && <LoadingSpinner text="Memuat data..." />}

      <div className="space-y-6">
        {kategoriList.map((kat) => (
          <div key={kat} className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">{kat}</h3>
              <span className="text-sm font-semibold text-brand-primary">
                {formatRupiah(totals.byKat[kat] || 0)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                    <th className="px-4 py-2 font-medium">Pecahan</th>
                    <th className="px-4 py-2 font-medium">Lembar</th>
                    <th className="px-4 py-2 font-medium">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {(CONFIG_UANG[kat] || []).map((p) => {
                    const key = `${kat}|${p}`
                    const nom = parseNum(values[key])
                    const lembar = typeof p === 'number' && p > 0 && nom > 0 ? Math.round(nom / p) : ''
                    return (
                      <tr key={p} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2 text-gray-700">
                          {typeof p === 'number' ? formatRupiah(p).replace('Rp', 'Rp ') : p}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={lembar}
                            onChange={(e) => p > 0 && handleLembar(kat, p, e.target.value)}
                            placeholder="0"
                            className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={fmtInput(nom)}
                            onChange={(e) => handleChange(kat, p, e.target.value)}
                            placeholder="0"
                            className="w-40 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-medium text-gray-500">Total Nominal</span>
          <span className="text-2xl font-bold text-gray-900">{formatRupiah(totals.grand)}</span>
        </div>
        <button
          onClick={handleSimpan}
          disabled={submitting || totals.grand <= 0}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60"
        >
          {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </AppShell>
  )
}