# KasM2 — Kas Monitor

Sistem monitoring operasional kas perbankan dengan hierarki unit kerja. Migrasi dari KasM (vanilla HTML/JS) ke React modular. Dibangun dengan React 18 + Vite + Tailwind CSS + Supabase.

- **URL**: https://opsdana.github.io/KasM2/
- **Repo**: https://github.com/opsdana/KasM2

## Arsitektur

```
React 18 (Vite)  →  Supabase Edge Functions (Deno)  →  PostgreSQL
GitHub Pages (auto-deploy via Actions)
```

### Role Sistem
| Role | Akses |
|---|---|
| `SUPER_ADMIN` | Akses penuh seluruh data & menu |
| `ADMIN` | Kelola User, Unit Kerja, Hari Libur, Notif WA |
| `HT` | Dashboard HT, Ops Khasanah, Posisi Kas, Akhir Hari, CIB/CIS/CIT |
| `TELLER` | Dashboard, Trx Kas, Posisi Kas, Pesanan, TUKAB, ATM |
| `KF` | Dashboard, Trx Kas, Posisi Kas, Cetak, ATM |
| `CAPEM` | Perkiraan Bon/Setor |

### Hierarki Unit Kerja
```
Cabang Induk (009)
├── Kantor Fungsional (0090001–0090004)
└── Cabang Pembantu (043, 106, 175, 200)
```

## Quick Start

### Prasyarat
- Node.js 18+
- Supabase CLI (`npm install -g supabase`)
- Akun GitHub (untuk deploy)

### 1. Clone & Install
```bash
git clone https://github.com/opsdana/KasM2.git
cd KasM2
npm install
```

### 2. Konfigurasi Environment
Buat file `.env` di root project:
```bash
VITE_SUPABASE_URL=https://fxccqqdbctoxlbqdbfym.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Jalankan Development Server
```bash
npm run dev
```
Buka `http://localhost:3000`.

### 4. Build Production
```bash
npm run build
```
Output ada di folder `dist/`.

## Supabase Setup

### Link & Migrate
```bash
supabase login --token <PAT>
supabase link --project-ref fxccqqdbctoxlbqdbfym --password '<DB_PASSWORD>'
supabase db push --linked --password '<DB_PASSWORD>'
```

### Deploy Edge Functions
```bash
supabase functions deploy --no-verify-jwt --use-api --project-ref fxccqqdbctoxlbqdbfym
```

### Set Secrets
```bash
supabase secrets set SB_URL=https://fxccqqdbctoxlbqdbfym.supabase.co \
  SB_SERVICE_ROLE_KEY=eyJ... \
  --project-ref fxccqqdbctoxlbqdbfym
```

## Struktur Project

```
KasM2/
├── public/
│   ├── 404.html              # SPA fallback
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── auth/             # ProtectedRoute
│   │   ├── layout/           # AppShell, Sidebar, Topbar, PageHeader
│   │   └── shared/           # DataTable, StatCard, LoadingSpinner, UnitBadge
│   ├── contexts/AuthContext.jsx
│   ├── lib/
│   │   ├── api.js            # Edge function caller
│   │   ├── supabase.js       # Supabase client
│   │   ├── constants.js      # Roles, labels, colors
│   │   └── utils.js          # formatRupiah, formatTanggal, exportToCSV
│   ├── pages/
│   │   ├── LoginPage, ForgotPasswordPage, ResetPasswordPage
│   │   ├── DashboardPage
│   │   └── kasm/
│   │       ├── admin/        # 4 pages (KelolaUser, UnitKerja, HariLibur, WAGateway)
│   │       ├── ht/           # 18 pages (DashboardHT, laporan, transaksi)
│   │       └── teller/       # 12 pages (Dashboard, TrxKas, PosisiKas, dll)
│   ├── App.jsx               # 50+ routes
│   ├── main.jsx
│   └── index.css
├── supabase/
│   ├── functions/            # 27 edge functions + _shared
│   └── migrations/           # 23 SQL migrations
├── .env                      # Environment (gitignored)
├── .github/workflows/deploy.yml
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Deploy ke GitHub Pages

Deploy otomatis via GitHub Actions saat push ke `main`. Secrets yang dibutuhkan:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set via:
```bash
gh secret set VITE_SUPABASE_URL --body "https://..." --repo opsdana/KasM2
gh secret set VITE_SUPABASE_ANON_KEY --body "eyJ..." --repo opsdana/KasM2
```

## Fitur Utama

- ✅ Auth Supabase (email/password + lupa password + reset)
- ✅ Role-based access control (6 role)
- ✅ Dashboard HT & Teller dengan statistik real-time
- ✅ Transaksi kas fisik (Saldo Awal, Bon Pagi, Tambahan, Setor Sore)
- ✅ Kalkulator posisi kas dengan auto-calculation
- ✅ CRUD: User, Unit Kerja, Pegawai, Pejabat HT, Hari Libur, Pesanan, TUKAB, ATM
- ✅ Laporan: Posisi Harian, Saldo Kas, Mutasi, CLUIS, CIB/CIS/CIT, Tabularis
- ✅ Notifikasi WA Gateway settings
- ✅ Export CSV
- ✅ Format Rupiah & tanggal Indonesia
- ✅ Responsive design (mobile + desktop)
- ✅ Dark sidebar dengan nested submenus

## Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Lucide React, Recharts, react-router-dom 6
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions/Deno, RLS)
- **Hosting**: GitHub Pages
- **Library**: date-fns, clsx, tailwind-merge

## Migrasi dari KasM

KasM2 adalah migrasi dari KasM (vanilla HTML/JS, repo `jatimers/KasM`):
- Backend: 27 edge functions di-port utuh
- Database: 19 migrations KasM + 4 template + repair = 23 migrations
- Frontend: `index.html` 332KB/4982 lines dipecah jadi 34 React pages modular
- Auth: custom (plaintext) → Supabase Auth native
- Tabel `unit_kerja` KasM rename → `unit_pegawai` (cegah konflik template)

Lihat `AGENTS.md` untuk konteks migrasi lengkap.
