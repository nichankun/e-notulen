# 📋 e-Notulen

Aplikasi manajemen notulen rapat digital berbasis web. Dibuat dengan Next.js, Drizzle ORM, dan Supabase.

🔗 **Live Demo:** [e-notulen.vercel.app](https://e-notulen.vercel.app)

---

## ✨ Fitur

- 📝 Buat & kelola notulen rapat dengan rich text editor (Tiptap)
- 📄 Export notulen ke PDF
- ✍️ Tanda tangan digital
- 🔒 Autentikasi berbasis JWT
- 🌙 Dark mode / Light mode
- 📱 Responsif di semua perangkat

---

## 🛠️ Tech Stack

| Kategori | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | JWT (jose) + bcryptjs |
| Form | React Hook Form + Zod |
| Editor | Tiptap |
| PDF | @react-pdf/renderer |

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat

- Node.js >= 18
- pnpm >= 9
- Akun [Supabase](https://supabase.com) (untuk database PostgreSQL)

### 1. Clone repository

```bash
git clone https://github.com/nichankun/e-notulen.git
cd e-notulen
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Isi file `.env` dengan nilai yang sesuai (lihat bagian [Environment Variables](#-environment-variables)).

### 4. Jalankan migrasi database

```bash
pnpm dlx drizzle-kit generate
pnpm dlx drizzle-kit migrate
```

### 5. (Opsional) Seed data awal

```bash
pnpm db:seed
```

### 6. Jalankan development server

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🔑 Environment Variables

Buat file `.env` berdasarkan `.env.example`:

```env
# Database
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Auth JWT
JWT_SECRET=your-secret-key-min-32-chars

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 Struktur Folder

```
e-notulen/
├── src/
│   ├── app/          # Next.js App Router (pages & API routes)
│   ├── components/   # Komponen UI
│   ├── db/           # Drizzle schema & koneksi database
│   └── lib/          # Utilitas & helper
├── public/           # Aset statis
├── drizzle/          # Hasil generate migration
├── drizzle.config.ts
└── package.json
```

---

## 🚢 Deploy ke Vercel

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables di dashboard Vercel
4. Deploy!

---

## 📄 Lisensi

MIT License. Lihat [LICENSE](./LICENSE) untuk detail.
