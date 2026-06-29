import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatTanggal, exportToCSV } from '@/lib/utils'
import { AKSI_LOG } from '@/lib/constants'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/shared/DataTable'
import { Download } from 'lucide-react'

export default function LogAktivitasPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 25

  // Filter
  const [tanggalDari, setTanggalDari] = useState('')
  const [tanggalSampai, setTanggalSampai] = useState('')
  const [aksi, setAksi] = useState('')
  const [searchUser, setSearchUser] = useState('')

  const fetchLog = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('log_aktivitas')
        .select('*, profiles:user_id(nama_lengkap, kode_unit)', { count: 'exact' })

      if (tanggalDari) query = query.gte('created_at', tanggalDari + 'T00:00:00')
      if (tanggalSampai) query = query.lte('created_at', tanggalSampai + 'T23:59:59')
      if (aksi) query = query.eq('aksi', aksi)

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data: result, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      setData(result || [])
      setTotal(count || 0)
    } catch (e) {
      console.error('Error fetching logs:', e)
    } finally {
      setLoading(false)
    }
  }, [page, tanggalDari, tanggalSampai, aksi])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  const handleExport = () => {
    exportToCSV(data, `log-aktivitas-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const aksiBadge = (aksi) => {
    const colors = {
      LOGIN: 'bg-blue-100 text-blue-800',
      LOGOUT: 'bg-gray-100 text-gray-700',
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      EXPORT: 'bg-purple-100 text-purple-800',
    }
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[aksi] || 'bg-gray-100'}`}>
        {aksi}
      </span>
    )
  }

  const columns = [
    {
      header: 'Waktu',
      accessor: 'created_at',
      render: (row) => (
        <span className="text-xs text-gray-500">{formatTanggal(row.created_at, 'datetime')}</span>
      ),
    },
    {
      header: 'User',
      accessor: 'user_id',
      render: (row) => row.profiles?.nama_lengkap || row.user_id?.slice(0, 8) || '-',
    },
    {
      header: 'Unit',
      accessor: 'kode_unit',
      render: (row) => row.profiles?.kode_unit || row.kode_unit || '-',
    },
    {
      header: 'Aksi',
      accessor: 'aksi',
      render: (row) => aksiBadge(row.aksi),
    },
    {
      header: 'Target',
      accessor: 'tabel_target',
      render: (row) => row.tabel_target || '-',
    },
    {
      header: 'Detail',
      accessor: 'detail',
      render: (row) => (
        <span className="text-xs text-gray-500 max-w-[200px] truncate block">
          {row.detail ? JSON.stringify(row.detail).slice(0, 100) : '-'}
        </span>
      ),
    },
  ]

  return (
    <AppShell>
      <PageHeader
        title="Log Aktivitas"
        description="Catatan aktivitas pengguna sistem"
        actions={
          <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
            <input type="date" value={tanggalDari} onChange={(e) => { setTanggalDari(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sampai</label>
            <input type="date" value={tanggalSampai} onChange={(e) => { setTanggalSampai(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Aksi</label>
            <select value={aksi} onChange={(e) => { setAksi(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none">
              <option value="">Semua Aksi</option>
              {Object.values(AKSI_LOG).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        emptyMessage="Belum ada log aktivitas"
      />
    </AppShell>
  )
}
