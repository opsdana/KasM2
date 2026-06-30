import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ROLE } from '@/lib/constants'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import DataNasabahHarianPage from '@/pages/nasabah/DataNasabahHarianPage'
import InputNasabahPage from '@/pages/nasabah/InputNasabahPage'
import DetailNasabahPage from '@/pages/nasabah/DetailNasabahPage'
import PatroliKepatuhanPage from '@/pages/patroli/PatroliKepatuhanPage'
import FormPatroliPage from '@/pages/patroli/FormPatroliPage'
import DetailPatroliPage from '@/pages/patroli/DetailPatroliPage'
import ManajemenUserPage from '@/pages/admin/ManajemenUserPage'
import ManajemenUnitKerjaPage from '@/pages/admin/ManajemenUnitKerjaPage'
import LogAktivitasPage from '@/pages/admin/LogAktivitasPage'

export default function App() {
  return (
    <BrowserRouter basename="/DataNasabah">
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected — Data Nasabah */}
          <Route
            path="/nasabah/harian"
            element={
              <ProtectedRoute>
                <DataNasabahHarianPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nasabah/harian/:id"
            element={
              <ProtectedRoute>
                <DetailNasabahPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nasabah/input"
            element={
              <ProtectedRoute
                allowedRoles={[ROLE.SUPER_ADMIN, ROLE.CABANG_INDUK, ROLE.KANTOR_FUNGSIONAL]}
              >
                <InputNasabahPage />
              </ProtectedRoute>
            }
          />

          {/* Protected — Patroli */}
          <Route
            path="/patroli"
            element={
              <ProtectedRoute>
                <PatroliKepatuhanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patroli/form"
            element={
              <ProtectedRoute>
                <FormPatroliPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patroli/:id"
            element={
              <ProtectedRoute>
                <DetailPatroliPage />
              </ProtectedRoute>
            }
          />

          {/* Protected — Admin */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={[ROLE.SUPER_ADMIN, ROLE.CABANG_INDUK]}>
                <ManajemenUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/log"
            element={
              <ProtectedRoute allowedRoles={[ROLE.SUPER_ADMIN]}>
                <LogAktivitasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/unit-kerja"
            element={
              <ProtectedRoute allowedRoles={[ROLE.SUPER_ADMIN]}>
                <ManajemenUnitKerjaPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
