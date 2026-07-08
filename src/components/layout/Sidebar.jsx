import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE, ROLE_LABEL, ROLE_COLOR } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarOff,
  MessageSquare,
  Wallet,
  History,
  FileBarChart,
  Table,
  UserCog,
  Eye,
  ScrollText,
  ClipboardList,
  PiggyBank,
  ArrowLeftRight,
  Calculator,
  Banknote,
  Landmark,
  Printer,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: [ROLE.SUPER_ADMIN, ROLE.ADMIN],
  },
  {
    label: 'Administrasi',
    icon: Settings,
    roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
    children: [
      { label: 'Kelola User', icon: Users, href: '/admin/kelola-user', roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
      { label: 'Kelola Unit Kerja', icon: Building2, href: '/admin/kelola-unit-kerja', roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
      { label: 'Setelan Hari Libur', icon: CalendarOff, href: '/admin/hari-libur', roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
      { label: 'Notifikasi WA', icon: MessageSquare, href: '/admin/setting-wa', roles: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
    ],
  },
  {
    label: 'Operasional Dana',
    icon: Landmark,
    roles: [ROLE.HT, ROLE.SUPER_ADMIN],
    children: [
      { label: 'Dashboard HT', icon: LayoutDashboard, href: '/ht/dashboard', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
      {
        label: 'Ops. Khasanah',
        icon: Wallet,
        roles: [ROLE.HT, ROLE.SUPER_ADMIN],
        children: [
          { label: 'Saldo Awal', icon: PiggyBank, href: '/ht/saldo-awal', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'History Trans. Khasanah', icon: History, href: '/ht/history', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'Rekap Perk. Bon/Setor', icon: FileBarChart, href: '/ht/perkiraan', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'Laporan Tabularis', icon: Table, href: '/ht/tabularis', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'Data Pejabat HT', icon: UserCog, href: '/ht/pejabat', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
        ],
      },
      {
        label: 'Laporan Posisi Kas',
        icon: Eye,
        roles: [ROLE.HT, ROLE.SUPER_ADMIN],
        children: [
          { label: 'View Kas Teller', icon: Eye, href: '/ht/view-posisi', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'View Rincian Saldo', icon: ScrollText, href: '/ht/view-rincian', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'Rekap Jurnal Teller', icon: ClipboardList, href: '/ht/rekap-global', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
        ],
      },
      {
        label: 'Laporan Akhir Hari',
        icon: FileBarChart,
        roles: [ROLE.HT, ROLE.SUPER_ADMIN],
        children: [
          { label: 'Posisi Harian Kas', icon: FileBarChart, href: '/ht/lap-posisi-harian', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'Rincian Saldo Khasanah', icon: Wallet, href: '/ht/lap-saldo-kas', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'Setoran Khasanah', icon: ArrowLeftRight, href: '/ht/lap-mutasi/SETOR', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'Pengeluaran Khasanah', icon: ArrowLeftRight, href: '/ht/lap-mutasi/BON', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'Sisa Dalam Khasanah', icon: PiggyBank, href: '/ht/lap-cluis', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
        ],
      },
      {
        label: 'Laporan CIB CIS CIT',
        icon: FileBarChart,
        roles: [ROLE.HT, ROLE.SUPER_ADMIN],
        children: [
          { label: 'CIB', icon: FileBarChart, href: '/ht/cib', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'CIS', icon: FileBarChart, href: '/ht/cis', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'CIT', icon: FileBarChart, href: '/ht/cit', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'CIT ATM', icon: Banknote, href: '/ht/cit-atm', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
          { label: 'CIT TUKAB', icon: Banknote, href: '/ht/cit-tukab', roles: [ROLE.HT, ROLE.SUPER_ADMIN] },
        ],
      },
    ],
  },
  {
    label: 'Operasional Teller',
    icon: Calculator,
    roles: [ROLE.TELLER, ROLE.SUPER_ADMIN],
    children: [
      { label: 'Dashboard Teller', icon: LayoutDashboard, href: '/teller/dashboard', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
      { label: 'Data Pegawai', icon: UserCog, href: '/teller/pegawai', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
      { label: 'Input Pesanan Nasabah', icon: ClipboardList, href: '/teller/pesanan', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
      { label: 'Rekap Perk. Bon/Setor', icon: FileBarChart, href: '/teller/perkiraan-ht', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
      { label: 'Input TUKAB', icon: Banknote, href: '/teller/tukab', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
      {
        label: 'Transaksi Kas Fisik',
        icon: ArrowLeftRight,
        roles: [ROLE.TELLER, ROLE.SUPER_ADMIN],
        children: [
          { label: 'Saldo Awal', icon: PiggyBank, href: '/teller/trx/SALDO AWAL', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
          { label: 'Bon Pagi', icon: Banknote, href: '/teller/trx/BON PAGI', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
          { label: 'Bon/Setor Tambahan', icon: ArrowLeftRight, href: '/teller/trx/TAMBAHAN', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
          { label: 'Setor Sore', icon: PiggyBank, href: '/teller/trx/SETOR SORE', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
          { label: 'History Transaksi', icon: History, href: '/teller/history-trx', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
        ],
      },
      {
        label: 'Posisi Kas Teller',
        icon: Calculator,
        roles: [ROLE.TELLER, ROLE.SUPER_ADMIN],
        children: [
          { label: 'Kalkulator Posisi Kas', icon: Calculator, href: '/teller/posisi-kas', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
          { label: 'History Posisi Kas', icon: History, href: '/teller/history-posisi', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
        ],
      },
      { label: 'Data ATM', icon: Landmark, href: '/teller/data-atm', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
      { label: 'Input CIT ATM', icon: Banknote, href: '/teller/cit-atm-input', roles: [ROLE.TELLER, ROLE.SUPER_ADMIN] },
    ],
  },
  {
    label: 'Operasional KF',
    icon: Wallet,
    roles: [ROLE.KF, ROLE.SUPER_ADMIN],
    children: [
      { label: 'Dashboard KF', icon: LayoutDashboard, href: '/kf/dashboard', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
      { label: 'Data Pegawai', icon: UserCog, href: '/kf/pegawai', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
      { label: 'Perkiraan Bon/Setor', icon: FileBarChart, href: '/kf/perkiraan', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
      {
        label: 'Transaksi Kas Fisik',
        icon: ArrowLeftRight,
        roles: [ROLE.KF, ROLE.SUPER_ADMIN],
        children: [
          { label: 'Saldo Awal', icon: PiggyBank, href: '/kf/trx/SALDO AWAL', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
          { label: 'Bon Pagi', icon: Banknote, href: '/kf/trx/BON PAGI', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
          { label: 'Setor Sore', icon: PiggyBank, href: '/kf/trx/SETOR SORE', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
          { label: 'History Transaksi', icon: History, href: '/kf/history-trx', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
        ],
      },
      {
        label: 'Posisi Kas KF',
        icon: Calculator,
        roles: [ROLE.KF, ROLE.SUPER_ADMIN],
        children: [
          { label: 'Kalkulator Posisi Kas', icon: Calculator, href: '/kf/posisi-kas', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
          { label: 'History Posisi Kas', icon: History, href: '/kf/history-posisi', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
        ],
      },
      {
        label: 'Cetak Dokumen',
        icon: Printer,
        roles: [ROLE.KF, ROLE.SUPER_ADMIN],
        children: [
          { label: 'Cetak Setor & Bon', icon: Printer, href: '/kf/cetak/setorbon', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
          { label: 'Cetak Rincian Kas', icon: Printer, href: '/kf/cetak/rincian', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
        ],
      },
      { label: 'Data ATM', icon: Landmark, href: '/kf/data-atm', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
      { label: 'Input CIT ATM', icon: Banknote, href: '/kf/cit-atm-input', roles: [ROLE.KF, ROLE.SUPER_ADMIN] },
    ],
  },
  {
    label: 'Operasional Capem',
    icon: Building2,
    roles: [ROLE.CAPEM, ROLE.SUPER_ADMIN],
    children: [
      { label: 'Perkiraan Bon/Setor', icon: FileBarChart, href: '/capem/perkiraan', roles: [ROLE.CAPEM, ROLE.SUPER_ADMIN] },
    ],
  },
]

function MenuGroup({ item, onClose, depth = 0 }) {
  const location = useLocation()
  const { profile } = useAuth()
  const [expanded, setExpanded] = useState(
    item.children?.some(
      (child) =>
        location.pathname === child.href ||
        location.pathname.startsWith(child.href + '/') ||
        child.children?.some((grandchild) => location.pathname.startsWith(grandchild.href))
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
          depth > 0 && 'ml-6',
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
        className={cn(
          'flex w-full items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all duration-200',
          depth > 0 && 'ml-6'
        )}
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
        <div className={cn('mt-1 space-y-1 border-l border-white/10', depth > 0 ? 'ml-10 pl-3' : 'ml-4 pl-4')}>
          {item.children.map((child) => (
            <MenuGroup key={child.label} item={child} onClose={onClose} depth={depth + 1} />
          ))}
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
          <Landmark className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">KasM</h1>
          <p className="text-xs text-brand-secondary font-medium">Kas Monitor</p>
        </div>
      </div>

      {/* Unit Info */}
      {profile && (
        <div className="mx-4 mt-4 rounded-lg bg-white/5 p-3">
          <p className="text-xs text-gray-500 mb-1">User</p>
          <p className="text-sm font-medium text-white">
            {profile.nama_lengkap}
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

      {/* Role Badge & User Info */}
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
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </aside>

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
