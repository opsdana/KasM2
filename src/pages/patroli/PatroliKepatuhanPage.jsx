import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePatroli } from '@/hooks/usePatroli'
import { supabase } from '@/lib/supabase'
import { formatTanggal, exportToCSV, cn, getSkorColor, getSkorBgColor } from '@/lib/utils'
import { ROLE, JENIS_PATROLI, STATUS_TINDAK_LANJUT } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import StatCard from '@/components/shared/StatCard'
import { Plus, Download, Shield, Star, AlertTriangle, FileCheck } from 'lucide-react'

export default function PatroliKepatuhanPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data, total, loading, fetchPatroli, fetchSkorKepatuhan } = usePatroli()

  const isInduk = profile?.role === ROLE.SUPER_ADMIN || profile?.role === ROLE.CABANG_INDUK

  // Filter
  const today = new Date().toISOString().slice(0, 7) // YYYY-MM
  const [bulan, setBulan] = useState(today)
  const [kodeUnit, setKodeUnit] = useState('')
  const [jenisPatroli, setJenisPatroli] = useState('')
  const [statusTL, setStatusTL] = useState('')
  const [page, setPage] = useState(1)
  const [units, setUnits] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    if (isInduk) {
      supabase.from('unit_kerja').select('kode_unit, nama_unit').order('kode_unit').then(({ data }) => {
        if (data) setUnits(data)
      })
    }
  }, [isInduk])

  useEffect(() => {
    fetchPatroli({
      bulan,
      kodeUnit: isInduk ? (kodeUnit || null) : profile?.kode_unit,
      jenisPatroli: jenisPatroli || null,
      statusTindakLanjut: statusTL || null,
      page,
      limit: 25,
    })
  }, [bulan, kodeUnit, jenisPatroli, statusTL, page, isInduk, profile, fetchPatroli])

  // Summary cards untuk CABANG_INDUK
  useEffect(() => {
    if (isInduk) {
      fetchSkorKepatuhan(null, bulan + '-01').then((skorData) => {
        const avgSkor = skorData.length > 0
          ? skorData.reduce((s, r) => s + Number(r.rata_skor), 0) / skorData.length
          : 0
        const totalPatroli = skorData.reduce((s, r) => s + Number(r.jumlah_patroli), 0)
        const totalSelesai = skorData.reduce((s, r) => s + Number(r.patroli_selesai), 0)
        const totalKritis = skorData.reduce((s, r) => s + Number(r.total_temuan_kritis), 0)

        // Unit dengan skor terendah
        const sorted = [...skorData].sort((a, b) => Number(a.rata_skor) - Number(b.rata_skor))
        const lowest = sorted[0]

        setSummary({
          avgSkor: avgSkor.toFixed(1),
          totalPatroli,
          totalSelesai,
          totalKritis,
          lowestUnit: lowest,
        })
      })
    }
  }, [bulan, isInduk, fetchSkorKepatuhan])

  const handleExport = () => {
    exportToCSV(data, `patroli-${bulan}.csv`)
  }

  const skorBar = (skor) => (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${getSkorBgColor(skor)}`}
          style={{ width: `${Math.min(100, skor)}%` }}
        />
      </div>
      <span className={cn('text-sm font-semibold', getSkorColor(skor))}>
        {Number(skor).toFixed(1)}
      </span>
    </div>
  )

  const columns = [
    {
      header: 'Tanggal',
      accessor: 'tanggal_patroli',
      render: (row) => formatTanggal(row.tanggal_patroli),
    },
    {
      header: 'Unit',
      accessor: 'kode_unit',
      render: (row) => row.unit_kerja?.nama_unit || row.kode_unit,
    },
    { header: 'Jenis Patroli', accessor: 'jenis_patroli' },
    { header: 'Periode', accessor: 'periode' },
    {
      header: 'Temuan',
      accessor: 'temuan_kritis',
      render: (row) => (
        <div className="flex items-center gap-2 text-xs font-mono">
          {row.temuan_kritis > 0 && <span className="text-red-600 font-semibold">{row.temuan_kritis}K</span>}
          {row.temuan_sedang > 0 && <span className="text-orange-600 font-semibold">{row.temuan_sedang}S</span>}
          {row.temuan_ringan > 0 && <span className="text-yellow-600 font-semibold">{row.temuan_ringan}R</span>}
          {row.temuan_kritis === 0 && row.temuan_sedang === 0 && row.temuan_ringan === 0 && (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      header: 'Skor',
      accessor: 'skor_kepatuhan',
      render: (row) => skorBar(row.skor_kepatuhan),
    },
    {
      header: 'Status TL',
      accessor: 'status_tindak_lanjut',
      render: (row) => {
        const s = STATUS_TINDAK_LANJUT[row.status_tindak_lanjut] || {}
        return (
          <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', s.color)}>
            {s.label}
          </span>
        )
      },
    },
    {
      header: 'Aksi',
      accessor: 'id',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/patroli/${row.id}`) }}
          className="text-sm text-brand-secondary hover:text-brand-primary font-medium"
        >
          Detail
        </button>
      ),
    },
  ]

  return (
    <AppShell>
      <PageHeader
        title="Patroli Data Kepatuhan"
        description="Pantau hasil patroli kepatuhan data nasabah"
        breadcrumbs={[
          { label: 'Patroli Kepatuhan', href: '/patroli' },
          { label: 'Daftar Patroli' },
        ]}
        actions={
          <>
            <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button onClick={() => navigate('/patroli/form')} className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary">
              <Plus className="h-4 w-4" /> Patroli Baru
            </button>
          </>
        }
      />

      {/* Summary Cards (CABANG_INDUK) */}
      {isInduk && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Rata Skor Kepatuhan" value={`${summary.avgSkor} ⭐`} icon={Star} color="blue" />
          <StatCard title="Patroli Selesai" value={`${summary.totalSelesai}/${summary.totalPatroli}`} icon={FileCheck} color="default" />
          <StatCard title="Total Temuan Kritis" value={summary.totalKritis} icon={AlertTriangle} color="red" />
          <StatCard
            title="Unit Skor Terendah"
            value={summary.lowestUnit ? `${summary.lowestUnit.kode_unit} (${Number(summary.lowestUnit.rata_skor).toFixed(1)})` : '-'}
            icon={Shield}
            color="orange"
          />
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bulan</label>
            <input type="month" value={bulan} onChange={(e) => { setBulan(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
          </div>
          {isInduk && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
              <select value={kodeUnit} onChange={(e) => { setKodeUnit(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none">
                <option value="">Semua Unit</option>
                {units.map((u) => <option key={u.kode_unit} value={u.kode_unit}>{u.kode_unit} — {u.nama_unit}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Patroli</label>
            <select value={jenisPatroli} onChange={(e) => { setJenisPatroli(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none">
              <option value="">Semua Jenis</option>
              {JENIS_PATROLI.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status TL</label>
            <select value={statusTL} onChange={(e) => { setStatusTL(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none">
              <option value="">Semua Status</option>
              <option value="BELUM">Belum</option>
              <option value="PROSES">Proses</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        limit={25}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/patroli/${row.id}`)}
        emptyMessage="Belum ada data patroli untuk filter yang dipilih"
      />
    </AppShell>
  )
}
