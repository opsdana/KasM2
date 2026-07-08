import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ROLE } from '@/lib/constants'
import LoginPage from '@/pages/LoginPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'

import DashboardPage from '@/pages/DashboardPage'

import KelolaUserPage from '@/pages/kasm/admin/KelolaUserPage'
import KelolaUnitKerjaPage from '@/pages/kasm/admin/KelolaUnitKerjaPage'
import HariLiburPage from '@/pages/kasm/admin/HariLiburPage'
import SettingWAGatewayPage from '@/pages/kasm/admin/SettingWAGatewayPage'

import DashboardHTPage from '@/pages/kasm/ht/DashboardHTPage'
import SaldoAwalPage from '@/pages/kasm/ht/SaldoAwalPage'
import HistoryHTPage from '@/pages/kasm/ht/HistoryHTPage'
import PerkiraanHTPage from '@/pages/kasm/ht/PerkiraanHTPage'
import TabularisPage from '@/pages/kasm/ht/TabularisPage'
import DataPejabatHTPage from '@/pages/kasm/ht/DataPejabatHTPage'
import ViewPosisiHTPage from '@/pages/kasm/ht/ViewPosisiHTPage'
import ViewRincianKFPage from '@/pages/kasm/ht/ViewRincianKFPage'
import RekapGlobalTellerPage from '@/pages/kasm/ht/RekapGlobalTellerPage'
import LapPosisiHarianPage from '@/pages/kasm/ht/LapPosisiHarianPage'
import LapSaldoKasPage from '@/pages/kasm/ht/LapSaldoKasPage'
import LapMutasiPage from '@/pages/kasm/ht/LapMutasiPage'
import LapCluisPage from '@/pages/kasm/ht/LapCluisPage'
import CibPage from '@/pages/kasm/ht/CibPage'
import CisPage from '@/pages/kasm/ht/CisPage'
import CitPage from '@/pages/kasm/ht/CitPage'
import CitAtmRekapPage from '@/pages/kasm/ht/CitAtmRekapPage'
import CitTukabPage from '@/pages/kasm/ht/CitTukabPage'

import DashboardTellerPage from '@/pages/kasm/teller/DashboardTellerPage'
import DataPegawaiPage from '@/pages/kasm/teller/DataPegawaiPage'
import PesananNasabahPage from '@/pages/kasm/teller/PesananNasabahPage'
import TukabInputPage from '@/pages/kasm/teller/TukabInputPage'
import TrxKasPage from '@/pages/kasm/teller/TrxKasPage'
import HistoryBonSetorPage from '@/pages/kasm/teller/HistoryBonSetorPage'
import PosisiKasTellerPage from '@/pages/kasm/teller/PosisiKasTellerPage'
import HistoryPosisiKasPage from '@/pages/kasm/teller/HistoryPosisiKasPage'
import DataAtmPage from '@/pages/kasm/teller/DataAtmPage'
import CitAtmInputPage from '@/pages/kasm/teller/CitAtmInputPage'
import PerkiraanTellerPage from '@/pages/kasm/teller/PerkiraanTellerPage'
import CetakKFPage from '@/pages/kasm/teller/CetakKFPage'

const ALL_ROLES = [ROLE.SUPER_ADMIN, ROLE.ADMIN, ROLE.HT, ROLE.TELLER, ROLE.KF, ROLE.CAPEM]
const ADMIN_ROLES = [ROLE.SUPER_ADMIN, ROLE.ADMIN]
const HT_ROLES = [ROLE.SUPER_ADMIN, ROLE.HT]
const TELLER_ROLES = [ROLE.SUPER_ADMIN, ROLE.TELLER]
const KF_ROLES = [ROLE.SUPER_ADMIN, ROLE.KF]
const CAPEM_ROLES = [ROLE.SUPER_ADMIN, ROLE.CAPEM]

function Protected({ children, roles }) {
  return <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <BrowserRouter basename="/KasM2">
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected — Dashboard (template) */}
          <Route path="/dashboard" element={<Protected roles={ALL_ROLES}><DashboardPage /></Protected>} />

          {/* Protected — Admin */}
          <Route path="/admin/kelola-user" element={<Protected roles={ADMIN_ROLES}><KelolaUserPage /></Protected>} />
          <Route path="/admin/kelola-unit-kerja" element={<Protected roles={ADMIN_ROLES}><KelolaUnitKerjaPage /></Protected>} />
          <Route path="/admin/hari-libur" element={<Protected roles={ADMIN_ROLES}><HariLiburPage /></Protected>} />
          <Route path="/admin/setting-wa" element={<Protected roles={ADMIN_ROLES}><SettingWAGatewayPage /></Protected>} />

          {/* Protected — HT */}
          <Route path="/ht/dashboard" element={<Protected roles={HT_ROLES}><DashboardHTPage /></Protected>} />
          <Route path="/ht/saldo-awal" element={<Protected roles={HT_ROLES}><SaldoAwalPage /></Protected>} />
          <Route path="/ht/history" element={<Protected roles={HT_ROLES}><HistoryHTPage /></Protected>} />
          <Route path="/ht/perkiraan" element={<Protected roles={HT_ROLES}><PerkiraanHTPage /></Protected>} />
          <Route path="/ht/tabularis" element={<Protected roles={HT_ROLES}><TabularisPage /></Protected>} />
          <Route path="/ht/pejabat" element={<Protected roles={HT_ROLES}><DataPejabatHTPage /></Protected>} />
          <Route path="/ht/view-posisi" element={<Protected roles={HT_ROLES}><ViewPosisiHTPage /></Protected>} />
          <Route path="/ht/view-rincian" element={<Protected roles={HT_ROLES}><ViewRincianKFPage /></Protected>} />
          <Route path="/ht/rekap-global" element={<Protected roles={HT_ROLES}><RekapGlobalTellerPage /></Protected>} />
          <Route path="/ht/lap-posisi-harian" element={<Protected roles={HT_ROLES}><LapPosisiHarianPage /></Protected>} />
          <Route path="/ht/lap-saldo-kas" element={<Protected roles={HT_ROLES}><LapSaldoKasPage /></Protected>} />
          <Route path="/ht/lap-mutasi/:mode" element={<Protected roles={HT_ROLES}><LapMutasiPage /></Protected>} />
          <Route path="/ht/lap-cluis" element={<Protected roles={HT_ROLES}><LapCluisPage /></Protected>} />
          <Route path="/ht/cib" element={<Protected roles={HT_ROLES}><CibPage /></Protected>} />
          <Route path="/ht/cis" element={<Protected roles={HT_ROLES}><CisPage /></Protected>} />
          <Route path="/ht/cit" element={<Protected roles={HT_ROLES}><CitPage /></Protected>} />
          <Route path="/ht/cit-atm" element={<Protected roles={HT_ROLES}><CitAtmRekapPage /></Protected>} />
          <Route path="/ht/cit-tukab" element={<Protected roles={HT_ROLES}><CitTukabPage /></Protected>} />

          {/* Protected — Teller */}
          <Route path="/teller/dashboard" element={<Protected roles={TELLER_ROLES}><DashboardTellerPage /></Protected>} />
          <Route path="/teller/pegawai" element={<Protected roles={TELLER_ROLES}><DataPegawaiPage /></Protected>} />
          <Route path="/teller/pesanan" element={<Protected roles={TELLER_ROLES}><PesananNasabahPage /></Protected>} />
          <Route path="/teller/perkiraan-ht" element={<Protected roles={TELLER_ROLES}><PerkiraanHTPage /></Protected>} />
          <Route path="/teller/tukab" element={<Protected roles={TELLER_ROLES}><TukabInputPage /></Protected>} />
          <Route path="/teller/trx/:mode" element={<Protected roles={TELLER_ROLES}><TrxKasPage /></Protected>} />
          <Route path="/teller/history-trx" element={<Protected roles={TELLER_ROLES}><HistoryBonSetorPage /></Protected>} />
          <Route path="/teller/posisi-kas" element={<Protected roles={TELLER_ROLES}><PosisiKasTellerPage /></Protected>} />
          <Route path="/teller/history-posisi" element={<Protected roles={TELLER_ROLES}><HistoryPosisiKasPage /></Protected>} />
          <Route path="/teller/data-atm" element={<Protected roles={TELLER_ROLES}><DataAtmPage /></Protected>} />
          <Route path="/teller/cit-atm-input" element={<Protected roles={TELLER_ROLES}><CitAtmInputPage /></Protected>} />

          {/* Protected — KF */}
          <Route path="/kf/dashboard" element={<Protected roles={KF_ROLES}><DashboardTellerPage /></Protected>} />
          <Route path="/kf/pegawai" element={<Protected roles={KF_ROLES}><DataPegawaiPage /></Protected>} />
          <Route path="/kf/perkiraan" element={<Protected roles={KF_ROLES}><PerkiraanTellerPage /></Protected>} />
          <Route path="/kf/trx/:mode" element={<Protected roles={KF_ROLES}><TrxKasPage /></Protected>} />
          <Route path="/kf/history-trx" element={<Protected roles={KF_ROLES}><HistoryBonSetorPage /></Protected>} />
          <Route path="/kf/posisi-kas" element={<Protected roles={KF_ROLES}><PosisiKasTellerPage /></Protected>} />
          <Route path="/kf/history-posisi" element={<Protected roles={KF_ROLES}><HistoryPosisiKasPage /></Protected>} />
          <Route path="/kf/cetak/:mode" element={<Protected roles={KF_ROLES}><CetakKFPage /></Protected>} />
          <Route path="/kf/data-atm" element={<Protected roles={KF_ROLES}><DataAtmPage /></Protected>} />
          <Route path="/kf/cit-atm-input" element={<Protected roles={KF_ROLES}><CitAtmInputPage /></Protected>} />

          {/* Protected — Capem */}
          <Route path="/capem/perkiraan" element={<Protected roles={CAPEM_ROLES}><PerkiraanTellerPage /></Protected>} />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
