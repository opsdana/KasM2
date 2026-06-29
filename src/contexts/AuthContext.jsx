import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile dari tabel profiles
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*, unit_kerja:kode_unit(nama_unit, tipe_unit)')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } else {
      setProfile(data)
    }
  }, [])

  // Catat log aktivitas
  const catatLog = useCallback(async (aksi, detail = {}) => {
    if (!user) return
    try {
      await supabase.from('log_aktivitas').insert({
        user_id: user.id,
        kode_unit: profile?.kode_unit,
        aksi,
        detail,
      })
    } catch (e) {
      console.error('Log error:', e)
    }
  }, [user, profile])

  // Login dengan email & password
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Update last_login & catat log
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)

      await supabase.from('log_aktivitas').insert({
        user_id: data.user.id,
        kode_unit: null,
        aksi: 'LOGIN',
        detail: { email },
      })
    }

    return data
  }, [])

  // Logout
  const logout = useCallback(async () => {
    if (user) {
      await supabase.from('log_aktivitas').insert({
        user_id: user.id,
        kode_unit: profile?.kode_unit,
        aksi: 'LOGOUT',
        detail: {},
      })
    }
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [user, profile])

  // Listen auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    // Inisialisasi: cek session awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const value = {
    user,
    profile,
    loading,
    login,
    logout,
    catatLog,
    isAuthenticated: !!user && !!profile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
