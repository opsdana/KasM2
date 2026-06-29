# Monitoring Data Nasabah

Sistem monitoring data nasabah perbankan dengan hierarki unit kerja. Dibangun dengan React 18 + Vite + Tailwind CSS + Supabase.

## 🏗️ Arsitektur

```
React 18 (Vite)  →  Supabase (Auth + DB + RLS)  →  Cloudflare Pages (Hosting)
```

### Hierarki Unit Kerja
```
Cabang Induk (009)
├── Kantor Fungsional (0090001–0090004)
└── Cabang Pembantu (043, 106, 175, 200)
```

### Role Sistem
| Role | Akses |
|---|---|
| `SUPER_ADMIN` | Akses penuh seluruh data |
| `CABANG_INDUK` | Unit 009 + semua unit bawahan |
| `KANTOR_FUNGSIONAL` | Hanya unit sendiri |
| `CABANG_PEMBANTU` | Hanya unit sendiri |

## 🚀 Quick Start

### Prasyarat
- Node.js 18+
- Akun Supabase (free tier cukup)
- Akun Cloudflare Pages (untuk deploy)

### 1. Clone & Install

```bash
cd monitoring-nasabah
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → paste isi file `supabase/migrations/001_init.sql` → **Run**
3. Buka **Authentication → Settings**:
   - Enable **Email/Password** provider
   - (Opsional) Disable "Confirm email" untuk development
4. Buat user pertama melalui **Authentication → Users → Add User**:
   - Isi email & password
   - Setelah user dibuat, tambahkan profil di tabel `profiles` via **Table Editor**
   - Set `role` = `SUPER_ADMIN` dan `kode_unit` = `009`

### 3. Konfigurasi Environment

Copy `.env.local` dan isi dengan kredensial Supabase:

```bash
# .env.local
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> URL dan Anon Key bisa ditemukan di **Supabase Dashboard → Settings → API**

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka `http://localhost:3000` dan login dengan user yang sudah dibuat.

### 5. Build Production

```bash
npm run build
```

Output ada di folder `dist/`.

## 📦 Deploy ke Cloudflare Pages

### Via Wrangler CLI

```bash
npx wrangler pages deploy dist --project-name=monitoring-nasabah
```

### Via Dashboard

1. Buka [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect GitHub repo
3. Configure:
   - **Build command**: `npm run build`
   - **Build output**: `dist`
   - **Node version**: `18`
4. Set **Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 📋 Struktur Project

```
monitoring-nasabah/
├── public/
│   ├── _redirects          # Cloudflare Pages SPA routing
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── layout/         # AppShell, Sidebar, Topbar, PageHeader
│   │   ├── auth/           # ProtectedRoute
│   │   └── shared/         # DataTable, StatCard, LoadingSpinner, UnitBadge
│   ├── contexts/
│   │   └── AuthContext.jsx # Auth state management
│   ├── hooks/
│   │   ├── useNasabah.js   # Hook data nasabah
│   │   └── usePatroli.js   # Hook patroli kepatuhan
│   ├── lib/
│   │   ├── supabase.js     # Supabase client
│   │   ├── constants.js    # Role, unit kerja, dll
│   │   └── utils.js        # formatRupiah, formatTanggal, exportToCSV, dll
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── nasabah/        # DataNasabahHarian, Input, Detail
│   │   ├── patroli/        # PatroliKepatuhan, Form, Detail
│   │   └── admin/          # ManajemenUser, LogAktivitas
│   ├── App.jsx             # Router
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind + custom styles
├── supabase/
│   └── migrations/
│       └── 001_init.sql    # Schema + RLS + Views
├── .env.local              # Environment variables (tidak di-commit)
├── wrangler.toml           # Cloudflare Pages config
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔐 Keamanan

- **Row Level Security (RLS)** diaktifkan di semua tabel
- Data nasabah: user hanya bisa melihat data unit sendiri (kecuali SUPER_ADMIN/CABANG_INDUK)
- Log aktivitas: hanya SUPER_ADMIN yang bisa melihat semua log
- Auth token auto-refresh setiap 1 jam

## 🧪 Testing Akses Per Role

1. **SUPER_ADMIN**: Bisa akses semua menu, semua data, manage user
2. **CABANG_INDUK**: Bisa lihat data semua unit bawahan, dashboard agregat
3. **KANTOR_FUNGSIONAL**: Hanya lihat data unit sendiri, input nasabah
4. **CABANG_PEMBANTU**: Hanya lihat data unit sendiri, tidak bisa input nasabah

## 📝 Fitur Utama

- ✅ Dashboard dengan statistik real-time
- ✅ Manajemen data nasabah harian (CRUD + filter + export CSV)
- ✅ Patroli kepatuhan dengan skor otomatis
- ✅ Detail temuan patroli
- ✅ Manajemen user (SUPER_ADMIN/CABANG_INDUK)
- ✅ Log aktivitas (SUPER_ADMIN)
- ✅ Responsive design (mobile + desktop)
- ✅ Dark sidebar ala RAF Gateway
- ✅ Export CSV di semua tabel
- ✅ Format Rupiah & tanggal Indonesia

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS 3, Lucide React, Recharts
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Hosting**: Cloudflare Pages
- **Library**: date-fns, react-router-dom, clsx, tailwind-merge
