import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { formatHariIni } from '@/lib/utils'
import { ROLE_LABEL, ROLE_COLOR } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  Menu,
  LogOut,
  User,
  ChevronDown,
  Bell,
} from 'lucide-react'

export default function Topbar({ onMenuClick }) {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Page title dari path
  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard'
    if (location.pathname.startsWith('/nasabah/harian/')) return 'Detail Nasabah'
    if (location.pathname.startsWith('/nasabah/harian')) return 'Data Nasabah Harian'
    if (location.pathname.startsWith('/nasabah/input')) return 'Input Data Nasabah'
    if (location.pathname.startsWith('/patroli/form')) return 'Form Patroli Baru'
    if (location.pathname.startsWith('/patroli/')) return 'Detail Patroli'
    if (location.pathname.startsWith('/patroli')) return 'Patroli Kepatuhan'
    if (location.pathname.startsWith('/admin/users')) return 'Manajemen User'
    if (location.pathname.startsWith('/admin/unit-kerja')) return 'Manajemen Unit Kerja'
    if (location.pathname.startsWith('/admin/log')) return 'Log Aktivitas'
    return 'Monitoring Nasabah'
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Hamburger + Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-gray-500">{formatHariIni()}</p>
          </div>
        </div>

        {/* Right: Notification + User dropdown */}
        <div className="flex items-center gap-3">
          {/* Notifikasi */}
          <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white text-sm font-bold">
                {profile?.nama_lengkap?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {profile?.nama_lengkap}
                </p>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-medium',
                  ROLE_COLOR[profile?.role] || 'bg-gray-100 text-gray-800'
                )}>
                  {ROLE_LABEL[profile?.role] || profile?.role}
                </span>
              </div>
              <ChevronDown className="hidden md:block h-4 w-4 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{profile?.nama_lengkap}</p>
                  <p className="text-xs text-gray-500">{profile?.jabatan || profile?.kode_unit}</p>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/') }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  Profil Saya
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
