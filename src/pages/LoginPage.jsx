import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Building2,
  Shield,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  LogIn,
} from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email harus diisi')
      return
    }
    if (!password) {
      setError('Password harus diisi')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err.message.includes('Invalid login')) {
        setError('Email atau password salah')
      } else if (err.message.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Silakan cek inbox Anda.')
      } else {
        setError(err.message || 'Gagal masuk. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-surface-dark via-gray-900 to-brand-primary relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full border-[40px] border-white" />
          <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full border-[60px] border-white" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-secondary">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CIF Monitor Cabang Lumajang</h1>
                <p className="text-brand-light text-sm">Sistem Monitoring Kepatuhan Data Nasabah</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: Shield,
                title: 'Kepatuhan Terintegrasi',
                desc: 'Pantau kepatuhan data nasabah di seluruh unit kerja secara real-time.',
              },
              {
                icon: Users,
                title: 'Data Nasabah Terpusat',
                desc: 'Satu database untuk seluruh data nasabah dari semua cabang dan unit.',
              },
              {
                icon: TrendingUp,
                title: 'Analisis & Pelaporan',
                desc: 'Dashboard interaktif dengan grafik dan laporan yang dapat diekspor.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-5 w-5 text-brand-light" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2 bg-surface-page">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary">
                <Building2 className="h-7 w-7 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Monitoring Data Nasabah</h2>
            <p className="text-gray-500">Satu Platform, Seluruh Unit Kerja</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Masuk ke Sistem</h3>
              <p className="text-sm text-gray-500 mt-1">
                Masukkan email dan password Anda
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@bank.co.id"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-brand-primary hover:text-brand-secondary transition-colors font-medium"
              >
                Lupa password?
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              Akses dibatasi sesuai unit kerja Anda
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
