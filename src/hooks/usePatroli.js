import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { hitungSkorKepatuhan } from '@/lib/utils'

export function usePatroli() {
  const { profile, catatLog } = useAuth()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Fetch daftar patroli dengan filter
   */
  const fetchPatroli = useCallback(async ({
    bulan,
    kodeUnit,
    jenisPatroli,
    statusTindakLanjut,
    page = 1,
    limit = 25,
  } = {}) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('patroli_kepatuhan')
        .select('*, profiles:petugas_id(nama_lengkap), unit_kerja:kode_unit(nama_unit)', { count: 'exact' })

      if (bulan) {
        const start = `${bulan}-01`
        const [year, month] = bulan.split('-')
        const end = new Date(year, month, 0).toISOString().slice(0, 10)
        query = query.gte('tanggal_patroli', start).lte('tanggal_patroli', end)
      }

      if (kodeUnit) {
        query = query.eq('kode_unit', kodeUnit)
      }

      if (jenisPatroli) {
        query = query.eq('jenis_patroli', jenisPatroli)
      }

      if (statusTindakLanjut) {
        query = query.eq('status_tindak_lanjut', statusTindakLanjut)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data: result, error: err, count } = await query
        .order('tanggal_patroli', { ascending: false })
        .range(from, to)

      if (err) throw err

      setData(result || [])
      setTotal(count || 0)
    } catch (e) {
      setError(e.message)
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch satu patroli
   */
  const fetchPatroliById = useCallback(async (id) => {
    const { data, error } = await supabase
      .from('patroli_kepatuhan')
      .select('*, profiles:petugas_id(nama_lengkap), unit_kerja:kode_unit(nama_unit)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }, [])

  /**
   * Fetch detail temuan untuk satu patroli
   */
  const fetchDetailTemuan = useCallback(async (patroliId) => {
    const { data, error } = await supabase
      .from('detail_temuan_patroli')
      .select('*')
      .eq('patroli_id', patroliId)
      .order('tingkat_risiko', { ascending: true })

    if (error) throw error
    return data || []
  }, [])

  /**
   * Insert patroli baru + detail temuan
   */
  const createPatroli = useCallback(async (patroliData, detailTemuan = []) => {
    const skor = hitungSkorKepatuhan(
      patroliData.temuan_kritis || 0,
      patroliData.temuan_sedang || 0,
      patroliData.temuan_ringan || 0
    )

    const { data: patroli, error } = await supabase
      .from('patroli_kepatuhan')
      .insert({
        ...patroliData,
        kode_unit: profile.kode_unit,
        petugas_id: profile?.id,
        skor_kepatuhan: skor,
      })
      .select()
      .single()

    if (error) throw error

    // Insert detail temuan jika ada
    if (detailTemuan.length > 0) {
      const temuanWithPatroliId = detailTemuan.map((t) => ({
        ...t,
        patroli_id: patroli.id,
      }))

      const { error: detailError } = await supabase
        .from('detail_temuan_patroli')
        .insert(temuanWithPatroliId)

      if (detailError) throw detailError
    }

    await catatLog('CREATE', {
      tabel_target: 'patroli_kepatuhan',
      record_id: patroli.id,
      detail: { jenis_patroli: patroliData.jenis_patroli, skor },
    })

    return patroli
  }, [profile, catatLog])

  /**
   * Update status tindak lanjut patroli
   */
  const updatePatroli = useCallback(async (id, updateData) => {
    const { data, error } = await supabase
      .from('patroli_kepatuhan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await catatLog('UPDATE', {
      tabel_target: 'patroli_kepatuhan',
      record_id: id,
      detail: updateData,
    })

    return data
  }, [catatLog])

  /**
   * Verifikasi patroli (CABANG_INDUK / SUPER_ADMIN)
   */
  const verifikasiPatroli = useCallback(async (id) => {
    const { data, error } = await supabase
      .from('patroli_kepatuhan')
      .update({
        diverifikasi_oleh: profile?.id,
        tanggal_verifikasi: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }, [profile])

  /**
   * Skor kepatuhan per unit untuk dashboard
   */
  const fetchSkorKepatuhan = useCallback(async (kodeUnit, bulan) => {
    let query = supabase.from('v_skor_kepatuhan_unit').select('*')

    if (kodeUnit) {
      query = query.eq('kode_unit', kodeUnit)
    }
    if (bulan) {
      query = query.eq('bulan', bulan)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }, [])

  /**
   * Tren skor kepatuhan untuk chart
   */
  const fetchTrenSkor = useCallback(async (kodeUnit, bulanCount = 6) => {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - bulanCount)

    let query = supabase
      .from('v_skor_kepatuhan_unit')
      .select('*')
      .gte('bulan', startDate.toISOString().slice(0, 7) + '-01')

    if (kodeUnit) {
      query = query.eq('kode_unit', kodeUnit)
    }

    const { data, error } = await query.order('bulan', { ascending: true })
    if (error) throw error
    return data || []
  }, [])

  return {
    data,
    total,
    loading,
    error,
    fetchPatroli,
    fetchPatroliById,
    fetchDetailTemuan,
    createPatroli,
    updatePatroli,
    verifikasiPatroli,
    fetchSkorKepatuhan,
    fetchTrenSkor,
  }
}
