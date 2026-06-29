-- =============================================
-- MONITORING DATA NASABAH — MIGRASI DATABASE
-- =============================================

-- =============================================
-- TABEL REFERENSI UNIT KERJA
-- =============================================
CREATE TABLE unit_kerja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_unit VARCHAR(10) UNIQUE NOT NULL,
  nama_unit VARCHAR(100) NOT NULL,
  tipe_unit VARCHAR(30) NOT NULL
    CHECK (tipe_unit IN ('CABANG_INDUK','KANTOR_FUNGSIONAL','CABANG_PEMBANTU')),
  parent_kode VARCHAR(10) REFERENCES unit_kerja(kode_unit),
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data unit kerja
INSERT INTO unit_kerja (kode_unit, nama_unit, tipe_unit, parent_kode) VALUES
('009',     'Cabang Induk Utama',         'CABANG_INDUK',       NULL),
('0090001', 'Kantor Fungsional 1',         'KANTOR_FUNGSIONAL',  '009'),
('0090002', 'Kantor Fungsional 2',         'KANTOR_FUNGSIONAL',  '009'),
('0090003', 'Kantor Fungsional 3',         'KANTOR_FUNGSIONAL',  '009'),
('0090004', 'Kantor Fungsional 4',         'KANTOR_FUNGSIONAL',  '009'),
('043',     'Cabang Pembantu 043',         'CABANG_PEMBANTU',    '009'),
('106',     'Cabang Pembantu 106',         'CABANG_PEMBANTU',    '009'),
('175',     'Cabang Pembantu 175',         'CABANG_PEMBANTU',    '009'),
('200',     'Cabang Pembantu 200',         'CABANG_PEMBANTU',    '009');

-- =============================================
-- TABEL PROFIL USER (extend auth.users Supabase)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap VARCHAR(100) NOT NULL,
  nip VARCHAR(20) UNIQUE,
  kode_unit VARCHAR(10) NOT NULL REFERENCES unit_kerja(kode_unit),
  role VARCHAR(30) NOT NULL
    CHECK (role IN ('SUPER_ADMIN','CABANG_INDUK','KANTOR_FUNGSIONAL','CABANG_PEMBANTU')),
  jabatan VARCHAR(100),
  aktif BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TABEL DATA NASABAH HARIAN
-- =============================================
CREATE TABLE data_nasabah_harian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  kode_unit VARCHAR(10) NOT NULL REFERENCES unit_kerja(kode_unit),

  -- Data pokok nasabah
  no_rekening VARCHAR(30) NOT NULL,
  nama_nasabah VARCHAR(150) NOT NULL,
  jenis_nasabah VARCHAR(20) NOT NULL
    CHECK (jenis_nasabah IN ('PERORANGAN','BADAN_USAHA')),
  jenis_produk VARCHAR(50) NOT NULL,

  -- Status & kondisi
  status_rekening VARCHAR(20) NOT NULL
    CHECK (status_rekening IN ('AKTIF','PASIF','TUTUP','BLOKIR')),
  saldo NUMERIC(18,2) DEFAULT 0,

  -- Data tambahan
  catatan TEXT,
  flag_perhatian BOOLEAN DEFAULT false,

  -- Metadata
  input_oleh UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tanggal, no_rekening, kode_unit)
);

-- =============================================
-- TABEL PATROLI DATA KEPATUHAN
-- =============================================
CREATE TABLE patroli_kepatuhan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal_patroli DATE NOT NULL DEFAULT CURRENT_DATE,
  kode_unit VARCHAR(10) NOT NULL REFERENCES unit_kerja(kode_unit),

  periode VARCHAR(20) NOT NULL,  -- HARIAN, MINGGUAN, BULANAN
  jenis_patroli VARCHAR(50) NOT NULL,

  total_rekening_dipatroli INT DEFAULT 0,
  rekening_bermasalah INT DEFAULT 0,

  temuan_kritis INT DEFAULT 0,
  temuan_sedang INT DEFAULT 0,
  temuan_ringan INT DEFAULT 0,
  deskripsi_temuan TEXT,

  status_tindak_lanjut VARCHAR(20) NOT NULL DEFAULT 'BELUM'
    CHECK (status_tindak_lanjut IN ('BELUM','PROSES','SELESAI')),
  catatan_tindak_lanjut TEXT,
  deadline_tindak_lanjut DATE,

  skor_kepatuhan NUMERIC(5,2),

  petugas_id UUID REFERENCES profiles(id),
  diverifikasi_oleh UUID REFERENCES profiles(id),
  tanggal_verifikasi TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TABEL DETAIL TEMUAN PATROLI
-- =============================================
CREATE TABLE detail_temuan_patroli (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patroli_id UUID NOT NULL REFERENCES patroli_kepatuhan(id) ON DELETE CASCADE,
  no_rekening VARCHAR(30),
  nama_nasabah VARCHAR(150),
  jenis_temuan VARCHAR(100) NOT NULL,
  tingkat_risiko VARCHAR(10) NOT NULL CHECK (tingkat_risiko IN ('KRITIS','SEDANG','RINGAN')),
  deskripsi_temuan TEXT NOT NULL,
  rekomendasi TEXT,
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','CLOSED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TABEL LOG AKTIVITAS
-- =============================================
CREATE TABLE log_aktivitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  kode_unit VARCHAR(10),
  aksi VARCHAR(50) NOT NULL,
  tabel_target VARCHAR(50),
  record_id UUID,
  detail JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE unit_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_nasabah_harian ENABLE ROW LEVEL SECURITY;
ALTER TABLE patroli_kepatuhan ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_temuan_patroli ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Helper function: ambil role user aktif
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: ambil kode_unit user aktif
CREATE OR REPLACE FUNCTION get_user_kode_unit()
RETURNS TEXT AS $$
  SELECT kode_unit FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: ambil semua unit bawahan dari sebuah unit
CREATE OR REPLACE FUNCTION get_unit_bawahan(parent_kode TEXT)
RETURNS SETOF TEXT AS $$
  SELECT kode_unit FROM unit_kerja WHERE parent_kode = $1
  UNION
  SELECT $1
$$ LANGUAGE sql SECURITY DEFINER;

-- Policy: unit_kerja — semua role bisa SELECT
CREATE POLICY "unit_kerja_select_all" ON unit_kerja FOR SELECT USING (true);

-- Policy: profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  id = auth.uid() OR
  get_user_role() IN ('SUPER_ADMIN', 'CABANG_INDUK')
);

CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  get_user_role() IN ('SUPER_ADMIN', 'CABANG_INDUK')
);

CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE USING (
  id = auth.uid() OR get_user_role() IN ('SUPER_ADMIN', 'CABANG_INDUK')
);

-- Policy: data_nasabah_harian
CREATE POLICY "nasabah_harian_select" ON data_nasabah_harian FOR SELECT USING (
  get_user_role() = 'SUPER_ADMIN' OR
  (get_user_role() = 'CABANG_INDUK' AND kode_unit IN (SELECT get_unit_bawahan('009'))) OR
  kode_unit = get_user_kode_unit()
);

CREATE POLICY "nasabah_harian_insert" ON data_nasabah_harian FOR INSERT WITH CHECK (
  kode_unit = get_user_kode_unit() OR get_user_role() IN ('SUPER_ADMIN','CABANG_INDUK')
);

CREATE POLICY "nasabah_harian_update" ON data_nasabah_harian FOR UPDATE USING (
  kode_unit = get_user_kode_unit() OR get_user_role() IN ('SUPER_ADMIN','CABANG_INDUK')
);

CREATE POLICY "nasabah_harian_delete" ON data_nasabah_harian FOR DELETE USING (
  get_user_role() IN ('SUPER_ADMIN','CABANG_INDUK')
);

-- Policy: patroli_kepatuhan
CREATE POLICY "patroli_select" ON patroli_kepatuhan FOR SELECT USING (
  get_user_role() = 'SUPER_ADMIN' OR
  (get_user_role() = 'CABANG_INDUK' AND kode_unit IN (SELECT get_unit_bawahan('009'))) OR
  kode_unit = get_user_kode_unit()
);

CREATE POLICY "patroli_insert" ON patroli_kepatuhan FOR INSERT WITH CHECK (
  kode_unit = get_user_kode_unit() OR get_user_role() IN ('SUPER_ADMIN','CABANG_INDUK')
);

CREATE POLICY "patroli_update" ON patroli_kepatuhan FOR UPDATE USING (
  kode_unit = get_user_kode_unit() OR get_user_role() IN ('SUPER_ADMIN','CABANG_INDUK')
);

-- Policy: detail_temuan_patroli
CREATE POLICY "detail_temuan_select" ON detail_temuan_patroli FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM patroli_kepatuhan pk
    WHERE pk.id = detail_temuan_patroli.patroli_id
    AND (
      get_user_role() = 'SUPER_ADMIN' OR
      (get_user_role() = 'CABANG_INDUK' AND pk.kode_unit IN (SELECT get_unit_bawahan('009'))) OR
      pk.kode_unit = get_user_kode_unit()
    )
  )
);

CREATE POLICY "detail_temuan_insert" ON detail_temuan_patroli FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM patroli_kepatuhan pk
    WHERE pk.id = detail_temuan_patroli.patroli_id
    AND (pk.kode_unit = get_user_kode_unit() OR get_user_role() IN ('SUPER_ADMIN','CABANG_INDUK'))
  )
);

-- Policy: log_aktivitas
CREATE POLICY "log_select" ON log_aktivitas FOR SELECT USING (
  user_id = auth.uid() OR get_user_role() = 'SUPER_ADMIN'
);

CREATE POLICY "log_insert" ON log_aktivitas FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- =============================================
-- TRIGGER: auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nasabah_updated BEFORE UPDATE ON data_nasabah_harian FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patroli_updated BEFORE UPDATE ON patroli_kepatuhan FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- VIEW: Ringkasan nasabah per unit
-- =============================================
CREATE OR REPLACE VIEW v_ringkasan_nasabah_unit AS
SELECT
  kode_unit,
  tanggal,
  COUNT(*) AS total_rekening,
  COUNT(*) FILTER (WHERE status_rekening = 'AKTIF') AS aktif,
  COUNT(*) FILTER (WHERE status_rekening = 'PASIF') AS pasif,
  COUNT(*) FILTER (WHERE status_rekening = 'BLOKIR') AS blokir,
  COUNT(*) FILTER (WHERE flag_perhatian = true) AS perlu_perhatian,
  SUM(saldo) AS total_saldo
FROM data_nasabah_harian
GROUP BY kode_unit, tanggal;

-- =============================================
-- VIEW: Skor kepatuhan per unit
-- =============================================
CREATE OR REPLACE VIEW v_skor_kepatuhan_unit AS
SELECT
  kode_unit,
  DATE_TRUNC('month', tanggal_patroli) AS bulan,
  ROUND(AVG(skor_kepatuhan), 2) AS rata_skor,
  COUNT(*) AS jumlah_patroli,
  SUM(temuan_kritis) AS total_temuan_kritis,
  SUM(temuan_sedang) AS total_temuan_sedang,
  COUNT(*) FILTER (WHERE status_tindak_lanjut = 'SELESAI') AS patroli_selesai
FROM patroli_kepatuhan
GROUP BY kode_unit, DATE_TRUNC('month', tanggal_patroli);
