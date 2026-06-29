import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useNasabah } from '@/hooks/useNasabah'
import { usePatroli } from '@/hooks/usePatroli'
import { supabase } from '@/lib/supabase'
import { formatRupiah, cn } from '@/lib/utils'
import { ROLE } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/shared/StatCard'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Shield,
  FileCheck,
  Building2,
  Star,
  Activity,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts'

export default function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { fetchRingkasan, fetchTrenNasabah } = useNasabah()
  const { fetchSkorKepatuhan, fetchTrenSkor } = usePatroli()

  const [ringkasan, setRingkasan] = useState(null)
  const [ringkasanPerUnit, setRingkasanPerUnit] = useState([])
  const [skorKepatuhan, setSkorKepatuhan] = useState(null)
  const [trenNasabah, setTrenNasabah] = useState([])
  const [trenSkor, setTrenSkor] = useState([])
  const [patroliTerakhir, setPatroliTerakhir] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isInduk = profile?.role === ROLE.SUPER_ADMIN || profile?.role === ROLE.CABANG_INDUK

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const bulanIni = today.slice(0, 7)

      if (isInduk) {
        // CABANG_INDUK: aggregat semua unit
        const [ringkasanData, skorData, trenData, skorTren, patroliList] = await Promise.all([
          fetchRingkasan(null, today),
          fetchSkorKepatuhan(null, bulanIni + '-01'),
          fetchTrenNasabah(null, 7),
          fetchTrenSkor(null, 6),
          supabase
            .from('patroli_kepatuhan')
            .select('*, unit_kerja:kode_unit(nama_unit)')
            .order('tanggal_patroli', { ascending: false })
            .limit(5),
        ])

        // Agregat ringkasan
        const totalNasabah = ringkasanData.reduce((s, r) => s + Number(r.total_rekening), 0)
        const totalPerhatian = ringkasanData.reduce((s, r) => s + Number(r.perlu_perhatian), 0)
        const avgSkor = skorData.length > 0
          ? skorData.reduce((s, r) => s + Number(r.rata_skor), 0) / skorData.length
          : 0
        const patroliSelesai = skorData.reduce((s, r) => s + Number(r.patroli_selesai), 0)
        const totalPatroli = skorData.reduce((s, r) => s + Number(r.jumlah_patroli), 0)

        setRingkasan({
          totalNasabah,
          totalPerhatian,
          avgSkor: avgSkor.toFixed(1),
          patroliSelesai,
          totalPatroli,
        })
        setRingkasanPerUnit(skorData)
        setSkorKepatuhan({ rata_skor: avgSkor.toFixed(1), jumlah_patroli: totalPatroli, patroli_selesai: patroliSelesai })
        setTrenNasabah(trenData)
        setTrenSkor(skorTren)
        setPatroliTerakhir(patroliList.data || [])
      } else {
        // Unit biasa: data unit sendiri
        const kodeUnit = profile?.kode_unit
        const [ringkasanData, skorData, trenData, skorTren, patroliList] = await Promise.all([
          fetchRingkasan(kodeUnit, today),
          fetchSkorKepatuhan(kodeUnit, bulanIni + '-01'),
          fetchTrenNasabah(kodeUnit, 14),
          fetchTrenSkor(kodeUnit, 6),
          supabase
            .from('patroli_kepatuhan')
            .select('*')
            .eq('kode_unit', kodeUnit)
            .order('tanggal_patroli', { ascending: false })
            .limit(5),
        ])

        const unitData = ringkasanData[0] || {}
        const skorUnit = skorData[0] || {}

        setRingkasan({
          totalNasabah: Number(unitData.total_rekening || 0),
          aktif: Number(unitData.aktif || 0),
          totalPerhatian: Number(unitData.perlu_perhatian || 0),
          avgSkor: Number(skorUnit.rata_skor || 0).toFixed(1),
        })
        setSkorKepatuhan(skorUnit)
        setTrenNasabah(trenData)
        setTrenSkor(skorTren)
        setPatroliTerakhir(patroliList.data || [])
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [profile, isInduk, fetchRingkasan, fetchSkorKepatuhan, fetchTrenNasabah, fetchTrenSkor])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (loading) return <AppShell><LoadingSpinner size="lg" text="Memuat dashboard..." /></AppShell>
  if (error) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <p className="text-red-500">Error: {error}</p>
          <button onClick={loadDashboard} className="mt-4 text-brand-secondary hover:underline">Coba lagi</button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description={`Selamat datang, ${profile?.nama_lengkap}. Berikut ringkasan monitoring hari ini.`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isInduk ? (
          <>
            <StatCard
              title="Total Nasabah Hari Ini"
              value={ringkasan?.totalNasabah?.toLocaleString('id-ID') || '0'}
              icon={Users}
              color="default"
            />
            <StatCard
              title="Nasabah Flag Perhatian"
              value={ringkasan?.totalPerhatian?.toLocaleString('id-ID') || '0'}
              icon={AlertTriangle}
              color="red"
            />
            <StatCard
              title="Skor Kepatuhan Rata-rata"
              value={`${ringkasan?.avgSkor || '0'} ⭐`}
              icon={Star}
              color="blue"
            />
            <StatCard
              title="Patroli Bulan Ini"
              value={`${ringkasan?.patroliSelesai || 0}/${ringkasan?.totalPatroli || 0}`}
              icon={Shield}
              color="purple"
              trend={ringkasan?.totalPatroli ? Math.round((ringkasan.patroliSelesai / ringkasan.totalPatroli) * 100) : 0}
              trendLabel="selesai"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Nasabah Hari Ini"
              value={ringkasan?.totalNasabah?.toLocaleString('id-ID') || '0'}
              icon={Users}
              color="default"
            />
            <StatCard
              title="Nasabah Aktif"
              value={ringkasan?.aktif?.toLocaleString('id-ID') || '0'}
              icon={Activity}
              color="default"
            />
            <StatCard
              title="Perlu Perhatian"
              value={ringkasan?.totalPerhatian?.toLocaleString('id-ID') || '0'}
              icon={AlertTriangle}
              color="orange"
            />
            <StatCard
              title="Skor Kepatuhan Bulan Ini"
              value={`${ringkasan?.avgSkor || '0'} ⭐`}
              icon={Star}
              color="blue"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart - Nasabah */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {isInduk ? 'Perbandingan Nasabah per Unit (7 Hari)' : 'Tren Nasabah 14 Hari Terakhir'}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {isInduk ? (
                <BarChart data={trenNasabah}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" name="Total" fill="#16a37b" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={trenNasabah}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#16a37b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Skor Kepatuhan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Tren Skor Kepatuhan 6 Bulan Terakhir
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trenSkor}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rata_skor" name="Rata Skor" stroke="#0f7b6c" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ringkasan per Unit (khusus CABANG_INDUK) */}
      {isInduk && ringkasanPerUnit.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Ringkasan Per Unit Kerja</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Skor</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Patroli</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ringkasanPerUnit.map((unit, i) => (
                  <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/patroli?unit=${unit.kode_unit}`)}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{unit.kode_unit}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={cn(
                        'font-semibold',
                        Number(unit.rata_skor) >= 80 ? 'text-green-600' :
                        Number(unit.rata_skor) >= 60 ? 'text-yellow-600' : 'text-red-600'
                      )}>
                        {Number(unit.rata_skor).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{unit.jumlah_patroli}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{unit.patroli_selesai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patroli Terakhir */}
      {patroliTerakhir.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">5 Patroli Terakhir</h3>
            <button
              onClick={() => navigate('/patroli')}
              className="text-sm text-brand-secondary hover:underline font-medium"
            >
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jenis</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Skor</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status TL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patroliTerakhir.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/patroli/${p.id}`)}>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.tanggal_patroli}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.unit_kerja?.nama_unit || p.kode_unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.jenis_patroli}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={cn(
                        'font-semibold',
                        Number(p.skor_kepatuhan) >= 80 ? 'text-green-600' :
                        Number(p.skor_kepatuhan) >= 60 ? 'text-yellow-600' : 'text-red-600'
                      )}>
                        {Number(p.skor_kepatuhan).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                        p.status_tindak_lanjut === 'SELESAI' ? 'bg-green-100 text-green-800' :
                        p.status_tindak_lanjut === 'PROSES' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {p.status_tindak_lanjut}
                      </span>
                    </td>
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
