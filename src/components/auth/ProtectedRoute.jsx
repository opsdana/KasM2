import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-page">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Memuat sesi..." />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Cek role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile?.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-page">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500">
            Anda tidak memiliki izin untuk mengakses halaman ini.
            Silakan hubungi administrator.
          </p>
        </div>
      </div>
    )
  }

  return children
}
