# AGENTS.md — KasM2 Project Context

## Project Overview
KasM2 adalah migrasi aplikasi Kas Monitor (KasM) dari vanilla HTML/JS (single-file 332KB `index.html`) ke React modular. Template login/GUI diambil dari project DataNasabah (opsdana), fitur KasM di-port ke React. Backend edge functions KasM dipertahankan.

- **Repo GitHub**: https://github.com/opsdana/KasM2 (public)
- **Lokal**: `c:\project\kasM2`
- **URL Production**: https://opsdana.github.io/KasM2/
- **Akun GitHub**: opsdana (PAT aktif di `gh`)

## Related Projects
- **KasM (lama/production)**: `c:\project\kasM` — repo `jatimers/KasM` — DB production `jwsfsczgyqphoyflpjnm.supabase.co` — JANGAN DISENTUH
- **DataNasabah (template)**: `https://github.com/opsdana/DataNasabah` — sumber login/GUI template

## Supabase
- **Project**: KasMon-Dev (`fxccqqdbctoxlbqdbfym`)
- **URL**: `https://fxccqqdbctoxlbqdbfym.supabase.co`
- **Pat CLI**: stored via `supabase login` (lihat https://supabase.com/dashboard/account/tokens)
- **DB password**: lihat Supabase Dashboard → Project Settings → Database
- **Linked**: `supabase link --project-ref fxccqqdbctoxlbqdbfym --password '<DB_PASSWORD>'`
- **Edge function secrets**: `SB_URL`, `SB_SERVICE_ROLE_KEY` (set via `supabase secrets set`)

### User Pertama
- Email: `eko.budianto@bankjatim.co.id`
- Role: `SUPER_ADMIN`, kode_unit: `009`
- Password: lihat catatan internal (tidak disimpan di repo)

## Commands
```bash
# Development
npm install
npm run dev          # localhost:3000
npm run build        # production build → dist/
npm run preview      # preview build

# Supabase (ganti <PAT>, <DB_PASSWORD> dengan credential masing-masing)
supabase login --token <PAT>
supabase link --project-ref fxccqqdbctoxlbqdbfym --password '<DB_PASSWORD>'
supabase db push --linked --password '<DB_PASSWORD>'
supabase functions deploy --no-verify-jwt --use-api --project-ref fxccqqdbctoxlbqdbfym
supabase secrets set SB_URL=<URL> SB_SERVICE_ROLE_KEY=<KEY> --project-ref fxccqqdbctoxlbqdbfym
supabase migration list --linked

# Git
git add -A; git commit -m "..."; git push origin main
# Auto-deploy GitHub Pages via .github/workflows/deploy.yml

# GitHub
gh auth status
gh secret set NAME --body "value" --repo opsdana/KasM2
gh run list --repo opsdana/KasM2
gh run watch <run-id> --repo opsdana/KasM2 --exit-status
```

## Architecture
```
React 18 (Vite + Tailwind)  →  Supabase Edge Functions (Deno)  →  PostgreSQL
                                     ↑ service_role (bypass RLS)
GitHub Pages (auto-deploy via Actions)
```

### Auth
- Supabase Auth native (email/password)
- Tabel `profiles` (extend `auth.users`): nama_lengkap, nip, kode_unit, role, jabatan
- Roles: `SUPER_ADMIN`, `ADMIN`, `HT`, `TELLER`, `KF`, `CAPEM` (+ template: `CABANG_INDUK`, `KANTOR_FUNGSIONAL`, `CABANG_PEMBANTU`)
- AuthContext.jsx: login, logout, resetPassword, updatePassword, getToken, catatLog
- ProtectedRoute: role-based access control

### Database (23 migrations)
- `001_init.sql` — template: unit_kerja (auth), profiles, data_nasabah_harian, patroli_kepatuhan, log_aktivitas, RLS, views
- `002_unit_kerja_policies.sql` — template: unit_kerja INSERT/UPDATE/DELETE policies
- `003_kasm_core.sql` — KasM: users, bon_setor, arsip_bon_setor, posisi_kas, saldo_awal_ht, data_pegawai, data_pejabat_ht, setting_fonnte, perkiraan_bon_setor, hari_libur, pesanan_nasabah
- `004-019` — KasM incremental: cron, timezone, cit_atm, db_atm, tukab, fix_cron, unit_pegawai, notif_toggle, posisi_kas_numeric, wa_gateway, fix_rls, fix_cron_wa_gateway, fix_tukab_bigint
- `022_template_auth_layer.sql` — repair: rename KasM `unit_kerja` → `unit_pegawai`, create template tables (idempotent)
- `023_expand_roles.sql` — expand profiles role constraint for KasM roles

### Tabel Penting
- **Template**: `unit_kerja` (auth, kode_unit), `profiles`, `data_nasabah_harian`, `patroli_kepatuhan`, `log_aktivitas`
- **KasM**: `users` (login lama, plaintext password), `unit_pegawai` (master pegawai), `posisi_kas`, `bon_setor`, `arsip_bon_setor`, `saldo_awal_ht`, `data_pegawai`, `data_pejabat_ht`, `setting_fonnte`, `setting_wa_gateway`, `perkiraan_bon_setor`, `hari_libur`, `pesanan_nasabah`, `db_cit_atm`, `db_atm`, `db_tukab`

### Edge Functions (27 deployed)
`auth`, `bon-setor`, `cit-atm`, `cluis`, `create-user`, `dashboard`, `data-atm`, `delete-user`, `hari-libur`, `laporan-cib-cis`, `laporan-ht`, `next-working-day`, `notif-fonnte`, `notif-wa-gateway`, `pegawai`, `pejabat-ht`, `perkiraan`, `pesanan-nasabah`, `posisi-kas`, `saldo-awal-ht`, `setting-fonnte`, `setting-wa-gateway`, `tabularis`, `tukab`, `tutup-buku`, `unit-kerja`, `users`

Shared helpers di `supabase/functions/_shared/`: `cors.ts`, `supabase.ts` (getSupabaseClient pakai SB_URL/SB_SERVICE_ROLE_KEY service_role), `utils.ts` (cleanStr, formatTglIndo, getWIBISOString, dll)

### Frontend Structure
```
src/
├── App.jsx                    # 50+ routes, role-based ProtectedRoute
├── main.jsx
├── index.css
├── contexts/AuthContext.jsx   # Supabase Auth + profiles + log_aktivitas
├── lib/
│   ├── api.js                 # callApi/callApiGet/callApiPost/callApiDelete (edge functions)
│   ├── supabase.js            # Supabase client (VITE_SUPABASE_URL/ANON_KEY)
│   ├── constants.js           # ROLE, ROLE_LABEL, ROLE_COLOR, KASM_ROLE_MAP
│   └── utils.js               # cn, formatRupiah, formatTanggal, exportToCSV
├── components/
│   ├── auth/ProtectedRoute.jsx
│   ├── layout/                # AppShell, Sidebar, Topbar, PageHeader
│   └── shared/                # DataTable, StatCard, LoadingSpinner, UnitBadge
├── pages/
│   ├── LoginPage, ForgotPasswordPage, ResetPasswordPage, DashboardPage (template)
│   ├── admin/                 # ManajemenUser, ManajemenUnitKerja, LogAktivitas (template)
│   └── kasm/
│       ├── admin/             # 4: KelolaUser, KelolaUnitKerja, HariLibur, SettingWAGateway
│       ├── ht/                # 18: DashboardHT, SaldoAwal, HistoryHT, PerkiraanHT, Tabularis, DataPejabatHT, ViewPosisiHT, ViewRincianKF, RekapGlobalTeller, LapPosisiHarian, LapSaldoKas, LapMutasi, LapCluis, Cib, Cis, Cit, CitAtmRekap, CitTukab
│       └── teller/            # 12: DashboardTeller, DataPegawai, PesananNasabah, TukabInput, TrxKas, HistoryBonSetor, PosisiKasTeller, HistoryPosisiKas, DataAtm, CitAtmInput, PerkiraanTeller, CetakKF
└── hooks/
    ├── useNasabah.js          # (template, unused by KasM)
    └── usePatroli.js          # (template, unused by KasM)
```

### Menu Structure (Sidebar.jsx)
5 role groups dengan nested submenus:
- **ADMIN**: Kelola User, Unit Kerja, Hari Libur, Notif WA
- **HT**: Dashboard → Ops Khasanah (5) → Posisi Kas (3) → Akhir Hari (5) → CIB/CIS/CIT (5)
- **TELLER**: Dashboard, Pegawai, Pesanan, TUKAB, Trx Kas (5), Posisi Kas (2), ATM, CIT ATM
- **KF**: Dashboard, Pegawai, Perkiraan, Trx Kas (4), Posisi Kas (2), Cetak (2), ATM
- **CAPEM**: Perkiraan

### API Pattern (src/lib/api.js)
```js
import { callApi, callApiGet, callApiPost, callApiDelete } from '@/lib/api'
const data = await callApiGet('/users')
await callApiPost('/users', body)
await callApiDelete('/users/123')
```
Semua edge functions return `{ success: true, data: ... }` atau `{ success: false, error: ... }`.

### Config
- `.env` (gitignored): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- GitHub Secrets (untuk CI): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `vite.config.js`: base `/KasM2/`, alias `@` → `./src`, port 3000
- `package.json`: name `kasm2`, postbuild copy index.html → 404.html (SPA fallback)
- `.github/workflows/deploy.yml`: auto-deploy GitHub Pages on push main

## Git History (KasM2 commits only, post-migration)
1. `743d975` Initial commit (DataNasabah template)
2. `f49ea63` Port backend KasM (28 edge functions + migrations 003-021)
3. `f049438` Migration 022 (template auth layer + repair unit_pegawai)
4. `64c97f4` Frontend infrastructure + 34 page stubs + routing
5. `cccc23d` Implementasi detail 34 pages (full CRUD + laporan)
6. `88cbbb2` Fix title & SPA redirect path

## Key Decisions
1. **Pertahankan auth template** (Supabase Auth + profiles) — jangan pakai auth custom KasM (tabel `users` plaintext)
2. **Tabel `unit_kerja` KasM rename → `unit_pegawai`** — cegah konflik dengan `unit_kerja` template (skema berbeda)
3. **DB KasMon-Dev dipakai untuk KasM2** — bukan project baru, data KasM sudah ada. Production KasM (`jwsfsczgyqphoyflpjnm`) tetap utuh
4. **Service_role untuk edge functions** — bypass RLS (RLS KasM utk anon/authenticated, edge functions pakai service_role)
5. **Migration 022 idempotent** — semua CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS — aman re-run

## Pending / Follow-up
- Implementasi detail bisa di-refine lebih lanjut (beberapa page pakai flexible table untuk response shape yg不确定)
- Hooks per-fitur (usePosisiKas, useTukab, dll) — saat ini langsung callApi di page
- Code-splitting untuk reduce bundle size (saat ini 1.09MB JS)
- Test end-to-end dengan login eko.budianto
- Hapus template pages yg tidak dipakai (DashboardPage, nasabah/, patroli/, admin/Manajemen*) jika ingin bersih

## Important Notes
- **JANGAN sentuh** `c:\project\kasM` atau repo `jatimers/KasM` — itu production
- **JANGAN deploy/migrate** ke DB `jwsfsczgyqphoyflpjnm` — itu production
- `.env` tidak di-commit (gitignored) — berisi credential Supabase
- `supabase/.temp/` gitignored — berisi link info
- GitHub Pages auto-deploy ~2 menit setelah push ke main
