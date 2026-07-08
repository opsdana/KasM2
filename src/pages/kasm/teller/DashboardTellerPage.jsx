import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'

export default function DashboardTellerPage() {
  return (
    <AppShell>
      <PageHeader title="Dashboard Teller/KF" description="Ringkasan aktivitas teller / kas fisik" />
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-center py-12">Halaman ini dalam pengembangan</p>
      </div>
    </AppShell>
  )
}