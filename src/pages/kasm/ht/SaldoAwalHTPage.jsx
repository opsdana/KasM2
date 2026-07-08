import { useState, useEffect, useMemo, useCallback } from 'react'
import { callApiGet, callApiPost } from '@/lib/api'
import { cn, formatRupiah, formatTanggal } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Save, Calendar, RefreshCw, CheckCircle, AlertCircle, Wallet } from 'lucide-react'

const KATEGORI = 'KHASANAH'
const PECAHAN_LIST = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100]

function todayStr() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

function parseNum(v) {
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10)
  return isNaN(n) ? 0 : n
}

function fmtInput(n) {
  if (!n) return ''
  return new Intl.NumberFormat('id-ID').format(n)
}

function labelPecahan(p) {
  return p >= 1000 ? `Rp ${p / 1000}K` : `Rp ${p}`
}

export default function SaldoAwalHTPage() {
  const { profile } = useAuth()
  const [tanggal, setTanggal] = useState(todayStr())
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const kodeUnit = profile?.kode_unit || ''

  const fetchData = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await callApiGet('/saldo-awal-ht', {
        tanggal,
        userEstim: kodeUnit,
        kodeWilayah: kodeUnit,
      })
      const arr = Array.isArray(res) ? res : res?.rows || res?.data || []
      const nv = {}
      for (const r of arr) {
        const pc = r.pecahan
        if (pc != null) nv[pc] = Number(r.nominal ?? 0)
      }
      setValues(nv)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat saldo awal' })
      setValues({})
    } finally {
      setLoading(false)
    }
  }, [tanggal, kodeUnit])

  useEffect(() => {
    if (profile) fetchData()
  }, [fetchData, profile])

  const total = useMemo(() => {
    let s = 0
    for (const p of PECAHAN_LIST) s += parseNum(values[p])
    return s
  }, [values])

  const handleChange = (p, raw) => {
    setValues((v) => ({ ...v, [p]: parseNum(raw) }))
  }

  const handleLembar = (p, lembar) => {
    setValues((v) => ({ ...v, [p]: parseNum(lembar) * p }))
  }

  const handleSimpan = async () => {
    setMessage(null)
    if (total <= 0) {
      setMessage({ type: 'error', text: 'Total nominal masih 0. Isi pecahan terlebih dahulu.' })
      return
    }
    setSubmitting(true)
    try {
      const rows = PECAHAN_LIST.map((p) => {
        const nominal = parseNum(values[p])
        return {
          kategori: KATEGORI,
          pecahan: p,
          lembar: nominal > 0 ? Math.round(nominal / p) : 0,
          nominal,
        }
      }).filter((r) => r.nominal > 0)
      await callApiPost('/saldo-awal-ht', { rows })
      setMessage({ type: 'success', text: 'Saldo awal Khasanah berhasil disimpan.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan saldo awal' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Saldo Awal Khasanah"
        description="Input saldo awal uang Khasanah per pecahan"
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
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Wallet className="h-4 w-4 text-brand-primary" /> {KATEGORI}
            </h3>
            <span className="text-sm font-semibold text-brand-primary">{formatRupiah(total)}</span>
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
                {PECAHAN_LIST.map((p) => {
                  const nom = parseNum(values[p])
                  const lembar = nom > 0 ? Math.round(nom / p) : ''
                  return (
                    <tr key={p} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-2 text-gray-700">{labelPecahan(p)}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={lembar}
                          onChange={(e) => handleLembar(p, e.target.value)}
                          placeholder="0"
                          className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={fmtInput(nom)}
                          onChange={(e) => handleChange(p, e.target.value)}
                          placeholder="0"
                          className="w-40 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900" colSpan={2}>Total</td>
                  <td className="px-4 py-3 text-right text-base font-bold text-brand-primary">{formatRupiah(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-medium text-gray-500">Total Nominal</span>
          <span className="text-2xl font-bold text-gray-900">{formatRupiah(total)}</span>
        </div>
        <button
          onClick={handleSimpan}
          disabled={submitting || total <= 0}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60"
        >
          {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </AppShell>
  )
}
