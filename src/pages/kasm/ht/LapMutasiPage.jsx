import { useParams } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'

export default function LapMutasiPage() {
  const { mode } = useParams()
  const currentMode = mode || 'SETOR'
  return (
    <AppShell>
      <PageHeader
        title={currentMode === 'SETOR' ? 'Setoran Khasanah' : 'Pengeluaran Khasanah'}
        description={`Laporan mutasi khasanah — ${currentMode}`}
      />
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center py-12">Halaman ini dalam pengembangan</p>
      </div>
    </AppShell>
  )
}