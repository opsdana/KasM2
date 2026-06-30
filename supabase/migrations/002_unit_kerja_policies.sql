-- Migration 002: Unit Kerja RLS Policies
-- Menambahkan INSERT, UPDATE, DELETE policies untuk SUPER_ADMIN
-- Fungsi get_user_role() sudah didefinisikan di 001_init.sql

-- Insert hanya untuk SUPER_ADMIN
CREATE POLICY "unit_kerja_insert_super_admin"
  ON unit_kerja FOR INSERT
  WITH CHECK (get_user_role() = 'SUPER_ADMIN');

-- Update hanya untuk SUPER_ADMIN
CREATE POLICY "unit_kerja_update_super_admin"
  ON unit_kerja FOR UPDATE
  USING (get_user_role() = 'SUPER_ADMIN');

-- Delete hanya untuk SUPER_ADMIN
CREATE POLICY "unit_kerja_delete_super_admin"
  ON unit_kerja FOR DELETE
  USING (get_user_role() = 'SUPER_ADMIN');
