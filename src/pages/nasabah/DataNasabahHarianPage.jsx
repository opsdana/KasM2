import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useNasabah } from '@/hooks/useNasabah'
import { supabase } from '@/lib/supabase'
import { formatRupiah, exportToCSV, cn } from '@/lib/utils'
import { ROLE, JENIS_PRODUK, STATUS_REKENING_COLOR } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import {
  Plus,
  Download,
  Search,
  Filter,
  X,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'

export default function DataNasabahHarianPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data, total, loading, fetchNasabah } = useNasabah()

  const isInduk = profile?.role === ROLE.SUPER_ADMIN || profile?.role === ROLE.CABANG_INDUK

  // Filter state
  const today = new Date().toISOString().slice(0, 10)
  const [tanggal, setTanggal] = useState(today)
  const [kodeUnit, setKodeUnit] = useState(profile?.kode_unit || '')
  const [statusRekening, setStatusRekening] = useState('')
  const [jenisProduk, setJenisProduk] = useState('')
  const [flagPerhatian, setFlagPerhatian] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [units, setUnits] = useState([])

  // Load unit list untuk dropdown CABANG_INDUK
  useEffect(() => {
    if (isInduk) {
      supabase
        .from('unit_kerja')
        .select('kode_unit, nama_unit, tipe_unit')
        .order('kode_unit')
        .then(({ data }) => {
          if (data) setUnits(data)
        })
    }
  }, [isInduk])

  // Fetch data saat filter berubah
  useEffect(() => {
    fetchNasabah({
      tanggal,
      kodeUnit: isInduk ? (kodeUnit || null) : profile?.kode_unit,
      statusRekening: statusRekening || null,
      jenisProduk: jenisProduk || null,
      flagPerhatian,
      search: search || null,
      page,
      limit: 25,
    })
  }, [tanggal, kodeUnit, statusRekening, jenisProduk, flagPerhatian, search, page, isInduk, profile, fetchNasabah])

  const handleExport = () => {
    exportToCSV(data, `nasabah-${tanggal}.csv`)
  }

  const handleClearFilter = () => {
    setTanggal(today)
    setKodeUnit('')
    setStatusRekening('')
    setJenisProduk('')
    setFlagPerhatian(null)
    setSearch('')
    setPage(1)
  }

  const hasFilter = statusRekening || jenisProduk || flagPerhatian !== null || search

  const statusBadge = (status) => {
    const colors = {
      AKTIF: 'bg-green-100 text-green-800 border-green-200',
      PASIF: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      BLOKIR: 'bg-red-100 text-red-800 border-red-200',
      TUTUP: 'bg-gray-100 text-gray-600 border-gray-200',
    }
    return (
      <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium border', colors[status] || '')}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      header: 'No. Rekening',
      accessor: 'no_rekening',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.flag_perhatian && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
          <span className="font-mono text-sm">{row.no_rekening}</span>
        </div>
      ),
    },
    { header: 'Nama Nasabah', accessor: 'nama_nasabah' },
    { header: 'Jenis', accessor: 'jenis_nasabah' },
    { header: 'Produk', accessor: 'jenis_produk' },
    {
      header: 'Status',
      accessor: 'status_rekening',
      render: (row) => statusBadge(row.status_rekening),
    },
    {
      header: 'Saldo',
      accessor: 'saldo',
      render: (row) => <span className="font-mono text-sm">{formatRupiah(row.saldo)}</span>,
    },
    {
      header: 'Aksi',
      accessor: 'id',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/nasabah/harian/${row.id}`) }}
          className="flex items-center gap-1 text-sm text-brand-secondary hover:text-brand-primary font-medium"
        >
          Detail <ChevronRight className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <AppShell>
      <PageHeader
        title="Data Nasabah Harian"
        description="Kelola dan pantau data nasabah harian"
        breadcrumbs={[
          { label: 'Data Nasabah', href: '/nasabah/harian' },
          { label: 'Data Harian' },
        ]}
        actions={
          <>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button
              onClick={() => navigate('/nasabah/input')}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-secondary transition-colors"
            >
              <Plus className="h-4 w-4" /> Input Data Baru
            </button>
          </>
        }
      />

      {/* Filter Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          {/* Tanggal */}
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => { setTanggal(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
            />
          </div>

          {/* Unit (CABANG_INDUK only) */}
          {isInduk && (
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-500 mb-1">Unit Kerja</label>
              <select
                value={kodeUnit}
                onChange={(e) => { setKodeUnit(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
              >
                <option value="">Semua Unit</option>
                {units.map((u) => (
                  <option key={u.kode_unit} value={u.kode_unit}>{u.kode_unit} — {u.nama_unit}</option>
                ))}
              </select>
            </div>
          )}

          {/* Status Rekening */}
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={statusRekening}
              onChange={(e) => { setStatusRekening(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
            >
              <option value="">Semua Status</option>
              <option value="AKTIF">AKTIF</option>
              <option value="PASIF">PASIF</option>
              <option value="BLOKIR">BLOKIR</option>
              <option value="TUTUP">TUTUP</option>
            </select>
          </div>

          {/* Jenis Produk */}
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-500 mb-1">Produk</label>
            <select
              value={jenisProduk}
              onChange={(e) => { setJenisProduk(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
            >
              <option value="">Semua Produk</option>
              {JENIS_PRODUK.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Flag Perhatian Toggle */}
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-500 mb-1">Flag</label>
            <select
              value={flagPerhatian === null ? '' : flagPerhatian.toString()}
              onChange={(e) => {
                const val = e.target.value
                setFlagPerhatian(val === '' ? null : val === 'true')
                setPage(1)
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
            >
              <option value="">Semua</option>
              <option value="true">🚩 Perhatian</option>
              <option value="false">Normal</option>
            </select>
          </div>

          {/* Search */}
          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Cari</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="No. rekening atau nama..."
                className="w-full rounded-lg border border-gray-300 pl-9 pr-9 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Clear Filter */}
          {hasFilter && (
            <button
              onClick={handleClearFilter}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors py-2"
            >
              <X className="h-4 w-4" /> Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        limit={25}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/nasabah/harian/${row.id}`)}
        emptyMessage="Belum ada data nasabah untuk filter yang dipilih"
      />
    </AppShell>
  )
}
