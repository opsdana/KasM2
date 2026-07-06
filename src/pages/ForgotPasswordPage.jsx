import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Building2,
  Shield,
  Users,
  TrendingUp,
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email harus diisi')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      if (err.message.includes('rate limit') || err.message.includes('too many')) {
        setError('Terlalu banyak permintaan. Silakan tunggu beberapa saat.')
      } else {
        setError('Gagal mengirim email reset. Pastikan email terdaftar.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding — sama persis dengan LoginPage */}
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

      {/* Right: Forgot Password Form */}
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
            {!sent ? (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Lupa Password</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Masukkan email Anda. Kami akan mengirimkan link untuk mereset password.
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@bank.co.id"
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all"
                        autoComplete="email"
                        autoFocus
                      />
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
                      <Mail className="h-4 w-4" />
                    )}
                    {loading ? 'Mengirim...' : 'Kirim Link Reset'}
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
                  <h3 className="text-xl font-bold text-gray-900">Email Terkirim!</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Link reset password telah dikirim ke{' '}
                    <span className="font-semibold text-gray-700">{email}</span>.
                    Silakan cek inbox (dan folder spam) Anda.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">Tidak menerima email?</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                    <li>Periksa folder spam / junk</li>
                    <li>Tunggu 1-2 menit</li>
                    <li>Pastikan email yang dimasukkan sudah benar</li>
                  </ul>
                </div>

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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
