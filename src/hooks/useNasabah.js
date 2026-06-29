import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useNasabah() {
  const { profile, catatLog } = useAuth()
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Fetch data nasabah harian dengan filter
   */
  const fetchNasabah = useCallback(async ({
    tanggal,
    kodeUnit,
    statusRekening,
    jenisProduk,
    flagPerhatian,
    search,
    page = 1,
    limit = 25,
  } = {}) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('data_nasabah_harian')
        .select('*, profiles:input_oleh(nama_lengkap)', { count: 'exact' })

      if (tanggal) {
        query = query.eq('tanggal', tanggal)
      } else {
        query = query.eq('tanggal', new Date().toISOString().slice(0, 10))
      }

      if (kodeUnit) {
        query = query.eq('kode_unit', kodeUnit)
      }

      if (statusRekening) {
        query = query.eq('status_rekening', statusRekening)
      }

      if (jenisProduk) {
        query = query.eq('jenis_produk', jenisProduk)
      }

      if (flagPerhatian !== undefined && flagPerhatian !== null) {
        query = query.eq('flag_perhatian', flagPerhatian)
      }

      if (search) {
        query = query.or(`no_rekening.ilike.%${search}%,nama_nasabah.ilike.%${search}%`)
      }

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data: result, error: err, count } = await query
        .order('created_at', { ascending: false })
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
   * Fetch satu record nasabah
   */
  const fetchNasabahById = useCallback(async (id) => {
    const { data, error } = await supabase
      .from('data_nasabah_harian')
      .select('*, profiles:input_oleh(nama_lengkap), unit_kerja:kode_unit(nama_unit)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }, [])

  /**
   * Insert data nasabah baru
   */
  const createNasabah = useCallback(async (formData) => {
    const { data, error } = await supabase
      .from('data_nasabah_harian')
      .insert({
        ...formData,
        kode_unit: profile.kode_unit,
        input_oleh: profile?.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Data dengan No. Rekening tersebut sudah ada untuk tanggal dan unit ini')
      }
      throw error
    }

    await catatLog('CREATE', {
      tabel_target: 'data_nasabah_harian',
      record_id: data.id,
      detail: { no_rekening: formData.no_rekening },
    })

    return data
  }, [profile, catatLog])

  /**
   * Update data nasabah
   */
  const updateNasabah = useCallback(async (id, formData) => {
    const { data, error } = await supabase
      .from('data_nasabah_harian')
      .update(formData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await catatLog('UPDATE', {
      tabel_target: 'data_nasabah_harian',
      record_id: id,
      detail: formData,
    })

    return data
  }, [catatLog])

  /**
   * Ringkasan nasabah per unit (untuk dashboard)
   */
  const fetchRingkasan = useCallback(async (kodeUnit, tanggal) => {
    let query = supabase.from('v_ringkasan_nasabah_unit').select('*')

    if (kodeUnit) {
      query = query.eq('kode_unit', kodeUnit)
    }
    if (tanggal) {
      query = query.eq('tanggal', tanggal)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }, [])

  /**
   * Tren nasabah (untuk chart)
   */
  const fetchTrenNasabah = useCallback(async (kodeUnit, hari = 14) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - hari)

    let query = supabase
      .from('data_nasabah_harian')
      .select('tanggal, status_rekening')
      .gte('tanggal', startDate.toISOString().slice(0, 10))

    if (kodeUnit) {
      query = query.eq('kode_unit', kodeUnit)
    }

    const { data, error } = await query
    if (error) throw error

    // Kelompokkan per tanggal
    const grouped = {}
    for (const row of data || []) {
      const tgl = row.tanggal
      if (!grouped[tgl]) grouped[tgl] = { tanggal: tgl, total: 0, aktif: 0, pasif: 0, blokir: 0, tutup: 0 }
      grouped[tgl].total++
      if (row.status_rekening === 'AKTIF') grouped[tgl].aktif++
      else if (row.status_rekening === 'PASIF') grouped[tgl].pasif++
      else if (row.status_rekening === 'BLOKIR') grouped[tgl].blokir++
      else if (row.status_rekening === 'TUTUP') grouped[tgl].tutup++
    }

    return Object.values(grouped).sort((a, b) => a.tanggal.localeCompare(b.tanggal))
  }, [])

  return {
    data,
    total,
    loading,
    error,
    fetchNasabah,
    fetchNasabahById,
    createNasabah,
    updateNasabah,
    fetchRingkasan,
    fetchTrenNasabah,
  }
}
