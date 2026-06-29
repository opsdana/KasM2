import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format angka ke Rupiah (IDR)
 */
export function formatRupiah(amount) {
  if (amount == null || isNaN(amount)) return 'Rp0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date
 * @param {string} formatStr - 'full' | 'short' | 'day' | 'month'
 */
export function formatTanggal(date, formatStr = 'full') {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseISO(date) : date

  switch (formatStr) {
    case 'short':
      return format(d, 'dd/MM/yyyy')
    case 'day':
      return format(d, 'EEEE, dd MMMM yyyy', { locale: id })
    case 'month':
      return format(d, 'MMMM yyyy', { locale: id })
    case 'datetime':
      return format(d, 'dd/MM/yyyy HH:mm')
    case 'full':
    default:
      return format(d, 'dd MMMM yyyy', { locale: id })
  }
}

/**
 * Format tanggal hari ini dalam bahasa Indonesia
 * Contoh: "Senin, 29 Juni 2026"
 */
export function formatHariIni() {
  return format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })
}

/**
 * Hitung skor kepatuhan dari temuan
 * skor = 100 - (kritis × 10) - (sedang × 5) - (ringan × 2)
 */
export function hitungSkorKepatuhan(kritis = 0, sedang = 0, ringan = 0) {
  const skor = 100 - (kritis * 10) - (sedang * 5) - (ringan * 2)
  return Math.max(0, Math.min(100, skor))
}

/**
 * Dapatkan warna untuk skor kepatuhan
 */
export function getSkorColor(skor) {
  if (skor >= 80) return 'text-green-600'
  if (skor >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getSkorBgColor(skor) {
  if (skor >= 80) return 'bg-green-500'
  if (skor >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * Export data ke CSV dan trigger download
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = []

  // Header row
  csvRows.push(headers.join(','))

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header]
      const escaped = String(val ?? '').replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  const csvString = csvRows.join('\n')
  const blob = new Blob(['﻿' + csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Validasi format no. rekening (angka, 5-30 digit)
 */
export function isValidNoRekening(no) {
  return /^\d{5,30}$/.test(no)
}

/**
 * Truncate text dengan ellipsis
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
