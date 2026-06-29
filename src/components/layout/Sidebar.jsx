import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE, ROLE_LABEL, ROLE_COLOR } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  PlusCircle,
  Search,
  Shield,
  FileCheck,
  ClipboardList,
  Settings,
  Activity,
  ChevronDown,
  ChevronRight,
  X,
  Building2,
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: Object.values(ROLE),
  },
  {
    label: 'Data Nasabah',
    icon: Users,
    roles: Object.values(ROLE),
    children: [
      {
        label: 'Lihat Data Hari Ini',
        icon: Search,
        href: '/nasabah/harian',
        roles: Object.values(ROLE),
      },
      {
        label: 'Input Data Baru',
        icon: PlusCircle,
        href: '/nasabah/input',
        roles: [ROLE.SUPER_ADMIN, ROLE.CABANG_INDUK, ROLE.KANTOR_FUNGSIONAL],
      },
    ],
  },
  {
    label: 'Patroli Kepatuhan',
    icon: Shield,
    roles: Object.values(ROLE),
    children: [
      {
        label: 'Daftar Patroli',
        icon: ClipboardList,
        href: '/patroli',
        roles: Object.values(ROLE),
      },
      {
        label: 'Form Patroli Baru',
        icon: FileCheck,
        href: '/patroli/form',
        roles: Object.values(ROLE),
      },
    ],
  },
  {
    label: 'Administrasi',
    icon: Settings,
    roles: [ROLE.SUPER_ADMIN, ROLE.CABANG_INDUK],
    children: [
      {
        label: 'Manajemen User',
        icon: Users,
        href: '/admin/users',
        roles: [ROLE.SUPER_ADMIN, ROLE.CABANG_INDUK],
      },
      {
        label: 'Log Aktivitas',
        icon: Activity,
        href: '/admin/log',
        roles: [ROLE.SUPER_ADMIN],
      },
    ],
  },
]

function MenuGroup({ item, onClose }) {
  const location = useLocation()
  const { profile } = useAuth()
  const [expanded, setExpanded] = useState(
    item.children?.some(
      (child) => location.pathname === child.href || location.pathname.startsWith(child.href + '/')
    )
  )

  if (!item.roles.includes(profile?.role)) return null

  if (!item.children) {
    const isActive = location.pathname === item.href
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-brand-secondary/15 text-brand-secondary border-l-3 border-brand-secondary'
            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span>{item.label}</span>
      </NavLink>
    )
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all duration-200"
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {expanded && (
        <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-4">
          {item.children.map((child) => {
            if (!child.roles.includes(profile?.role)) return null
            const isActive = location.pathname === child.href
            return (
              <NavLink
                key={child.href}
                to={child.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                  isActive
                    ? 'bg-brand-secondary/10 text-brand-secondary'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                <child.icon className="h-4 w-4" />
                <span>{child.label}</span>
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  const { profile } = useAuth()

  const sidebarContent = (
    <div className="flex h-full flex-col bg-surface-dark">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-secondary">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">Bank Monitor</h1>
          <p className="text-xs text-brand-secondary font-medium">Monitoring Nasabah</p>
        </div>
      </div>

      {/* Unit Info */}
      {profile && (
        <div className="mx-4 mt-4 rounded-lg bg-white/5 p-3">
          <p className="text-xs text-gray-500 mb-1">Unit Kerja</p>
          <p className="text-sm font-medium text-white">
            {profile.unit_kerja?.nama_unit || profile.kode_unit}
          </p>
          <p className="text-xs text-gray-400">{profile.kode_unit}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {menuItems.map((item) => (
          <MenuGroup key={item.label} item={item} onClose={onClose} />
        ))}
      </nav>

      {/* Role Badge & User Info di bawah */}
      {profile && (
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary/20 text-brand-secondary text-sm font-bold">
              {profile.nama_lengkap?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile.nama_lengkap}
              </p>
              <span className={cn(
                'inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5',
                ROLE_COLOR[profile.role] || 'bg-gray-100 text-gray-800'
              )}>
                {ROLE_LABEL[profile.role] || profile.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 w-64 z-50 animate-slide-in-left">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 rounded-full p-1 text-gray-400 hover:text-white hover:bg-white/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
