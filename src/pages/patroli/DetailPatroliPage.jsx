import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePatroli } from '@/hooks/usePatroli'
import { formatTanggal, cn, getSkorColor, getSkorBgColor } from '@/lib/utils'
import { ROLE, STATUS_TINDAK_LANJUT, TINGKAT_RISIKO_COLOR } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { ArrowLeft, CheckCircle, Shield, AlertTriangle, FileText } from 'lucide-react'

export default function DetailPatroliPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { fetchPatroliById, fetchDetailTemuan, updatePatroli, verifikasiPatroli } = usePatroli()

  const [patroli, setPatroli] = useState(null)
  const [temuan, setTemuan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const canVerify = profile?.role === ROLE.SUPER_ADMIN || profile?.role === ROLE.CABANG_INDUK

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [p, t] = await Promise.all([
        fetchPatroliById(id),
        fetchDetailTemuan(id),
      ])
      setPatroli(p)
      setTemuan(t)
      setNewStatus(p.status_tindak_lanjut)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === patroli?.status_tindak_lanjut) return
    setUpdating(true)
    try {
      await updatePatroli(id, { status_tindak_lanjut: newStatus })
      loadData()
    } catch (e) {
      setError(e.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleVerifikasi = async () => {
    setUpdating(true)
    try {
      await verifikasiPatroli(id)
      loadData()
    } catch (e) {
      setError(e.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <AppShell><LoadingSpinner size="lg" text="Memuat detail patroli..." /></AppShell>

  if (error || !patroli) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <p className="text-red-500">{error || 'Data tidak ditemukan'}</p>
          <button onClick={() => navigate('/patroli')} className="mt-4 text-brand-secondary hover:underline">Kembali</button>
        </div>
      </AppShell>
    )
  }

  const skor = Number(patroli.skor_kepatuhan)

  return (
    <AppShell>
      <PageHeader
        title="Detail Patroli"
        description={`${patroli.jenis_patroli} — ${formatTanggal(patroli.tanggal_patroli)}`}
        breadcrumbs={[{ label: 'Patroli Kepatuhan', href: '/patroli' }, { label: 'Detail' }]}
        actions={
          <button onClick={() => navigate('/patroli')} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Patroli */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Informasi Patroli</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Tanggal Patroli" value={formatTanggal(patroli.tanggal_patroli)} />
              <InfoField label="Unit" value={patroli.unit_kerja?.nama_unit || patroli.kode_unit} />
              <InfoField label="Jenis Patroli" value={patroli.jenis_patroli} />
              <InfoField label="Periode" value={patroli.periode} />
              <InfoField label="Total Rekening Dipatroli" value={patroli.total_rekening_dipatroli} />
              <InfoField label="Rekening Bermasalah" value={patroli.rekening_bermasalah} />
              <InfoField label="Petugas" value={patroli.profiles?.nama_lengkap || '-'} />
              <InfoField label="Diverifikasi Oleh" value={patroli.tanggal_verifikasi ? `${formatTanggal(patroli.tanggal_verifikasi, 'datetime')}` : 'Belum diverifikasi'} />
            </div>
          </div>

          {/* Temuan Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{patroli.temuan_kritis}</p>
              <p className="text-xs font-medium text-red-600 mt-1">Temuan Kritis</p>
            </div>
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
              <p className="text-2xl font-bold text-orange-700">{patroli.temuan_sedang}</p>
              <p className="text-xs font-medium text-orange-600 mt-1">Temuan Sedang</p>
            </div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{patroli.temuan_ringan}</p>
              <p className="text-xs font-medium text-yellow-600 mt-1">Temuan Ringan</p>
            </div>
          </div>

          {/* Deskripsi Temuan */}
          {patroli.deskripsi_temuan && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Deskripsi Temuan</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{patroli.deskripsi_temuan}</p>
            </div>
          )}

          {/* Detail Temuan Table */}
          {temuan.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Detail Temuan ({temuan.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">No. Rek</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Nama</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Jenis Temuan</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Risiko</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Deskripsi</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Rekomendasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {temuan.map((t, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-sm font-mono">{t.no_rekening || '-'}</td>
                        <td className="px-3 py-2 text-sm">{t.nama_nasabah || '-'}</td>
                        <td className="px-3 py-2 text-sm">{t.jenis_temuan}</td>
                        <td className="px-3 py-2">
                          <span className={cn(
                            'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                            t.tingkat_risiko === 'KRITIS' ? 'bg-red-100 text-red-800' :
                            t.tingkat_risiko === 'SEDANG' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                          )}>{t.tingkat_risiko}</span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">{t.deskripsi_temuan}</td>
                        <td className="px-3 py-2 text-sm text-gray-600">{t.rekomendasi || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Skor Gauge */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Skor Kepatuhan</h3>
            <div className="inline-flex items-center justify-center h-32 w-32 rounded-full border-[6px] border-gray-100 mb-3"
              style={{
                borderColor: skor >= 80 ? '#16a37b' : skor >= 60 ? '#f59e0b' : '#ef4444',
              }}>
              <span className={cn('text-4xl font-bold', getSkorColor(skor))}>{skor}</span>
            </div>
            <p className={cn('text-sm font-semibold', getSkorColor(skor))}>
              {skor >= 80 ? 'Baik' : skor >= 60 ? 'Cukup' : 'Perlu Perbaikan'}
            </p>
          </div>

          {/* Status Tindak Lanjut */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Tindak Lanjut</h3>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Status Saat Ini</p>
              <span className={cn(
                'inline-block px-2.5 py-1 rounded-full text-sm font-medium',
                (STATUS_TINDAK_LANJUT[patroli.status_tindak_lanjut] || {}).color
              )}>
                {(STATUS_TINDAK_LANJUT[patroli.status_tindak_lanjut] || {}).label}
              </span>
            </div>

            {/* Update Status */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-gray-700">Update Status</label>
              <div className="flex gap-2">
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none">
                  <option value="BELUM">Belum</option>
                  <option value="PROSES">Proses</option>
                  <option value="SELESAI">Selesai</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === patroli.status_tindak_lanjut}
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary disabled:opacity-50 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>

            {patroli.catatan_tindak_lanjut && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Catatan</p>
                <p className="text-sm text-gray-700">{patroli.catatan_tindak_lanjut}</p>
              </div>
            )}

            {patroli.deadline_tindak_lanjut && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Deadline</p>
                <p className="text-sm font-medium text-gray-900">{formatTanggal(patroli.deadline_tindak_lanjut)}</p>
              </div>
            )}
          </div>

          {/* Verifikasi (CABANG_INDUK / SUPER_ADMIN only) */}
          {canVerify && !patroli.tanggal_verifikasi && (
            <button
              onClick={handleVerifikasi}
              disabled={updating}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Verifikasi Patroli
            </button>
          )}

          {patroli.tanggal_verifikasi && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Terverifikasi pada {formatTanggal(patroli.tanggal_verifikasi, 'datetime')}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900">{value || '-'}</p>
    </div>
  )
}
