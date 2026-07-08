-- =============================================
-- MIGRASI 023: Expand profiles role constraint utk KasM roles
-- Template asli: SUPER_ADMIN, CABANG_INDUK, KANTOR_FUNGSIONAL, CABANG_PEMBANTU
-- KasM needs: admin, ht, teller, kf, capem
-- Mapping: admin->SUPER_ADMIN, ht->CABANG_INDUK, teller/kf->KANTOR_FUNGSIONAL, capem->CABANG_PEMBANTU
-- Tambahan: TELLER, KF, HT, CAPEM utk flexibilitas menu visibility
-- =============================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'SUPER_ADMIN',
    'CABANG_INDUK',
    'KANTOR_FUNGSIONAL',
    'CABANG_PEMBANTU',
    'ADMIN',
    'HT',
    'TELLER',
    'KF',
    'CAPEM'
  ));
