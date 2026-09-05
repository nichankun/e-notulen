# 📋 e-Notulen

Aplikasi manajemen notulen rapat digital berbasis web. Dibuat dengan Next.js, Drizzle ORM, dan Supabase.

🔗 **Live Demo:** [e-notulen.vercel.app](https://e-notulen.vercel.app)

---

## ✨ Fitur

- 📝 Buat & kelola notulen rapat dengan rich text editor (Tiptap)
- 🎙️ Live transcription Bahasa Indonesia dengan pemrosesan audio, tes mikrofon, buffer, dan reconnect
- 🧾 Rangkuman AI terstruktur dengan bukti waktu, PIC, deadline, status, confidence, dan verifikasi manusia
- 📄 Export notulen ke PDF
- ✍️ Tanda tangan digital
- 🔒 Autentikasi berbasis JWT
- 🌙 Dark mode / Light mode
- 📱 Responsif di semua perangkat

### Catatan kesiapan produksi audio

Sebelum dipakai untuk notula resmi, operator wajib menjalankan **Tes mic** dan
memeriksa hasil transkrip serta rangkuman. Jika AI menandai item **Perlu
verifikasi**, petugas harus mencocokkan kembali dengan transkrip dan bukti waktu
sebelum rapat disahkan. Checklist sepuluh skenario tersedia di
[`docs/production-audio-acceptance.md`](docs/production-audio-acceptance.md).

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

- Node.js >= 20.9
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

Jika database sudah berisi data, selalu periksa migration yang dihasilkan
sebelum menjalankannya. Schema saat ini mencegah penghapusan user yang masih
memiliki rapat (`user_id` memakai `RESTRICT`), sehingga migration perubahan
foreign key tersebut harus diterapkan ke database yang sudah berjalan.

Buat bucket Storage Supabase bernama `notulen` dan nonaktifkan izin upload
anonim. Upload dan penghapusan foto sekarang dilakukan server menggunakan
`SUPABASE_SERVICE_ROLE_KEY`.

### 5. (Opsional) Seed data awal

Isi `SEED_ADMIN_NIP` dan `SEED_ADMIN_PASSWORD` terlebih dahulu. Password seed
minimal 12 karakter dan tidak lagi menggunakan kredensial default.

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
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth JWT
JWT_SECRET=your-secret-key-min-32-chars

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Integrasi server-side
GEMINI_API_KEY=...
DEEPGRAM_API_KEY=...

# Hanya untuk proses seed admin
SEED_ADMIN_NIP=...
SEED_ADMIN_PASSWORD=...
SEED_ADMIN_NAME=Super Admin IT
SEED_ADMIN_AGENCY=BAPENDA PROV. SULTRA
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
4. Terapkan migration database yang sudah diperiksa
5. Deploy!

Setelah deploy, operator perlu membuat/mengunduh ulang QR Code untuk setiap
rapat live. QR Code lama tidak memiliki token presensi dan akan ditolak.

---

## 📄 Lisensi

MIT License.
