import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Shield,
  Users,
  TrendingUp,
} from 'lucide-react'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)

  // Cek apakah user datang dari link reset password Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        // Supabase akan set session otomatis via hash `type=recovery`
        if (session) {
          setHasValidSession(true)
        }
      } catch (e) {
        console.error('Session check error:', e)
      } finally {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Password baru harus diisi')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      setSuccess(true)
    } catch (err) {
      if (err.message.includes('same as your old')) {
        setError('Password baru tidak boleh sama dengan password lama')
      } else {
        setError(err.message || 'Gagal mereset password. Link mungkin sudah kadaluarsa.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Memverifikasi link reset...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-surface-dark via-gray-900 to-brand-primary relative overflow-hidden">
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

      {/* Right: Reset Password Form */}
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
            {!hasValidSession ? (
              <>
                <div className="mb-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                      <AlertCircle className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Link Tidak Valid</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Link reset password tidak valid atau sudah kadaluarsa.
                    Silakan minta link reset yang baru.
                  </p>
                </div>

                <Link
                  to="/forgot-password"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors"
                >
                  Minta Link Baru
                </Link>

                <div className="mt-4 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-primary hover:text-brand-secondary transition-colors font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Login
                  </Link>
                </div>
              </>
            ) : !success ? (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Masukkan password baru untuk akun Anda.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password Baru
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all"
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all"
                        autoComplete="new-password"
                      />
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Password tidak cocok</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-primary hover:text-brand-secondary transition-colors font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Password Berhasil Direset!</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Password baru Anda telah disimpan.
                    Silakan login dengan password baru.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-secondary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Ke Halaman Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
