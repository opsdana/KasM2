export const UNIT_KERJA = {
  CABANG_INDUK: ['009'],
  KANTOR_FUNGSIONAL: ['0090001', '0090002', '0090003', '0090004'],
  CABANG_PEMBANTU: ['043', '106', '175', '200'],
}

export const ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  HT: 'HT',
  TELLER: 'TELLER',
  KF: 'KF',
  CAPEM: 'CAPEM',
  CABANG_INDUK: 'CABANG_INDUK',
  KANTOR_FUNGSIONAL: 'KANTOR_FUNGSIONAL',
  CABANG_PEMBANTU: 'CABANG_PEMBANTU',
}

export const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Administrator',
  ADMIN: 'Administrator',
  HT: 'Kepala Kantor',
  TELLER: 'Teller',
  KF: 'Kantor Fungsional',
  CAPEM: 'Cabang Pembantu',
  CABANG_INDUK: 'Cabang Induk',
  KANTOR_FUNGSIONAL: 'Kantor Fungsional',
  CABANG_PEMBANTU: 'Cabang Pembantu',
}

export const ROLE_COLOR = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
  HT: 'bg-blue-100 text-blue-800',
  TELLER: 'bg-green-100 text-green-800',
  KF: 'bg-teal-100 text-teal-800',
  CAPEM: 'bg-orange-100 text-orange-800',
  CABANG_INDUK: 'bg-blue-100 text-blue-800',
  KANTOR_FUNGSIONAL: 'bg-green-100 text-green-800',
  CABANG_PEMBANTU: 'bg-orange-100 text-orange-800',
}

export const KASM_ROLE_MAP = {
  admin: 'ADMIN',
  ht: 'HT',
  teller: 'TELLER',
  kf: 'KF',
  capem: 'CAPEM',
}

export const TIPE_UNIT = {
  CABANG_INDUK: 'CABANG_INDUK',
  KANTOR_FUNGSIONAL: 'KANTOR_FUNGSIONAL',
  CABANG_PEMBANTU: 'CABANG_PEMBANTU',
}

export const TIPE_UNIT_LABEL = {
  CABANG_INDUK: 'Cabang Induk',
  KANTOR_FUNGSIONAL: 'Kantor Fungsional',
  CABANG_PEMBANTU: 'Cabang Pembantu',
}

export const TIPE_UNIT_COLOR = {
  CABANG_INDUK: 'bg-blue-100 text-blue-800',
  KANTOR_FUNGSIONAL: 'bg-green-100 text-green-800',
  CABANG_PEMBANTU: 'bg-orange-100 text-orange-800',
}

export const STATUS_REKENING_COLOR = {
  AKTIF: 'green',
  PASIF: 'yellow',
  TUTUP: 'gray',
  BLOKIR: 'red',
}

export const TINGKAT_RISIKO_COLOR = {
  KRITIS: 'red',
  SEDANG: 'orange',
  RINGAN: 'yellow',
}

export const STATUS_TINDAK_LANJUT = {
  BELUM: { label: 'Belum', color: 'bg-red-100 text-red-800' },
  PROSES: { label: 'Proses', color: 'bg-yellow-100 text-yellow-800' },
  SELESAI: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
}

export const JENIS_PRODUK = [
  'Tabungan',
  'Giro',
  'Deposito',
  'Kredit',
  'Tabungan Berjangka',
  'Tabungan Haji',
  'Deposito On Call',
]

export const JENIS_PATROLI = [
  'KYC Nasabah Baru',
  'Kelengkapan Dokumen',
  'AML/CDD Screening',
  'Validasi Data Nasabah Pasif',
  'Rekening Dormant',
  'Kepatuhan Produk',
]

export const PERIODE_PATROLI = ['HARIAN', 'MINGGUAN', 'BULANAN']

export const AKSI_LOG = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  EXPORT: 'EXPORT',
}
