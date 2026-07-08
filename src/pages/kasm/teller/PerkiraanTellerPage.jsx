import { useState, useEffect, useCallback } from 'react'
import { callApiGet, callApiPost } from '@/lib/api'
import { cn, formatRupiah, formatTanggal } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function parseNum(v) {
  if (v === '' || v == null) return 0
  const n = Number(String(v).replace(/[^\d]/g, ''))
  return isNaN(n) ? 0 : n
}

const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan']

function terbilangRatusan(n) {
  let hasil = ''
  if (n >= 100) {
    const ratus = Math.floor(n / 100)
    if (ratus === 1) hasil += 'seratus '
    else hasil += SATUAN[ratus] + ' ratus '
    n %= 100
  }
  if (n >= 20) {
    const puluh = Math.floor(n / 10)
    hasil += SATUAN[puluh] + ' puluh '
    n %= 10
    if (n > 0) hasil += SATUAN[n] + ' '
  } else if (n >= 10) {
    if (n === 10) hasil += 'sepuluh '
    else if (n === 11) hasil += 'sebelas '
    else hasil += SATUAN[n - 10] + ' belas '
  } else if (n > 0) {
    hasil += SATUAN[n] + ' '
  }
  return hasil
}

function terbilang(num) {
  num = Math.max(0, Math.floor(Number(num) || 0))
  if (num === 0) return 'nol rupiah'
  const triliun = Math.floor(num / 1e12)
  const sisaT = num % 1e12
  const miliar = Math.floor(sisaT / 1e9)
  const sisaM = sisaT % 1e9
  const juta = Math.floor(sisaM / 1e6)
  const sisaJ = sisaM % 1e6
  const ribu = Math.floor(sisaJ / 1e3)
  const sisaR = sisaJ % 1e3
  let out = ''
  if (triliun > 0) out += terbilangRatusan(triliun) + 'triliun '
  if (miliar > 0) out += terbilangRatusan(miliar) + 'miliar '
  if (juta > 0) out += terbilangRatusan(juta) + 'juta '
  if (ribu > 0) out += (ribu === 1 ? 'seribu ' : terbilangRatusan(ribu) + 'ribu ')
  if (sisaR > 0) out += terbilangRatusan(sisaR)
  return out.trim() + ' rupiah'
}

const EMPTY_FORM = {
  tanggal: todayStr(),
  p100k_setor: '',
  p100k_bon: '',
  p50k_setor: '',
  p50k_bon: '',
}

export default function PerkiraanTellerPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const loadData = useCallback(async (tanggal) => {
    if (!tanggal) return
    setLoading(true)
    setMessage(null)
    try {
      const data = await callApiGet('/perkiraan', {
        tanggal,
        userEstim: profile?.kode_unit ?? '',
      })
      if (data && Object.keys(data).length > 0) {
        setForm({
          tanggal,
          p100k_setor: data.p100k_setor ?? '',
          p100k_bon: data.p100k_bon ?? '',
          p50k_setor: data.p50k_setor ?? '',
          p50k_bon: data.p50k_bon ?? '',
        })
      } else {
        setForm((f) => ({ ...EMPTY_FORM, tanggal }))
      }
      setLoaded(true)
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal memuat data perkiraan' })
      setLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    loadData(form.tanggal)
  }, [loadData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        tanggal: form.tanggal,
        userEstim: profile?.kode_unit ?? '',
        kodeWilayah: profile?.kode_unit ?? '',
        p100k_setor: parseNum(form.p100k_setor),
        p100k_bon: parseNum(form.p100k_bon),
        p50k_setor: parseNum(form.p50k_setor),
        p50k_bon: parseNum(form.p50k_bon),
      }
      await callApiPost('/perkiraan', payload)
      setMessage({ type: 'success', text: 'Data perkiraan berhasil disimpan!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan data perkiraan' })
    } finally {
      setSubmitting(false)
    }
  }

  const p100kSetor = parseNum(form.p100k_setor) * 100000
  const p50kSetor = parseNum(form.p50k_setor) * 50000
  const p100kBon = parseNum(form.p100k_bon) * 100000
  const p50kBon = parseNum(form.p50k_bon) * 50000
  const totalSetor = p100kSetor + p50kSetor
  const totalBon = p100kBon + p50kBon
  const selisih = totalSetor - totalBon

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none'

  return (
    <AppShell>
      <PageHeader title="Perkiraan Bon & Setor" description="Input perkiraan setor dan bon teller" />

      {message && (
        <div className={cn('mb-4 rounded-lg px-4 py-3 text-sm flex items-center gap-2',
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200')}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
              <input type="date" required value={form.tanggal} onChange={(e) => { setForm((f) => ({ ...f, tanggal: e.target.value })); loadData(e.target.value) }} className={inputClass} />
              <p className="text-xs text-gray-400 mt-1">{form.tanggal ? formatTanggal(form.tanggal, 'full') : '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Estim</label>
              <input type="text" readOnly value={profile?.kode_unit ?? ''} className={cn(inputClass, 'bg-gray-50')} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { key: 'p100k_setor', label: 'P100K Setor', val: p100kSetor },
              { key: 'p100k_bon', label: 'P100K Bon', val: p100kBon },
              { key: 'p50k_setor', label: 'P50K Setor', val: p50kSetor },
              { key: 'p50k_bon', label: 'P50K Bon', val: p50kBon },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{item.label} (lembar)</label>
                <input type="number" min="0" value={form[item.key]} onChange={(e) => setForm((f) => ({ ...f, [item.key]: e.target.value }))} className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">= {formatRupiah(item.val)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-xs font-medium text-green-700">Total Setor</p>
              <p className="text-lg font-bold text-green-800">{formatRupiah(totalSetor)}</p>
            </div>
            <div className="rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
              <p className="text-xs font-medium text-orange-700">Total Bon</p>
              <p className="text-lg font-bold text-orange-800">{formatRupiah(totalBon)}</p>
            </div>
            <div className={cn('rounded-lg px-4 py-3 border',
              selisih >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200')}>
              <p className={cn('text-xs font-medium', selisih >= 0 ? 'text-blue-700' : 'text-red-700')}>Selisih (Setor − Bon)</p>
              <p className={cn('text-lg font-bold', selisih >= 0 ? 'text-blue-800' : 'text-red-800')}>{formatRupiah(selisih)}</p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 mb-6">
            <p className="text-xs font-medium text-gray-500 mb-1">Terbilang Total Setor</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">{terbilang(totalSetor)}</p>
            <p className="text-xs font-medium text-gray-500 mt-2 mb-1">Terbilang Total Bon</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">{terbilang(totalBon)}</p>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary disabled:opacity-60">
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? 'Menyimpan...' : 'Simpan Perkiraan'}
            </button>
          </div>
        </form>
      )}
    </AppShell>
  )
}