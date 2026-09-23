# Siklus status rapat

| Status | Makna | Bisa diedit? | Ditampilkan di |
| --- | --- | --- | --- |
| `draft` | Rapat disiapkan dan belum dimulai | Ya | Arsip Digital → Draft |
| `live` | Rapat sedang berlangsung | Ya | Arsip Digital → Berlangsung |
| `archived` | Rapat sudah diselesaikan dan menjadi arsip final | Tidak | Arsip Digital → Selesai; halaman hasil |
| `completed` | Alias legacy untuk rapat final dari data/klien lama | Tidak | Arsip Digital → Selesai; halaman hasil |

> `archived` adalah status final yang ditulis oleh alur penutupan aplikasi saat ini. `completed` dipertahankan agar data lama tetap terbaca; kedua status bersifat terminal dan memiliki tampilan serta akses hasil yang sama. Tidak diperlukan migrasi karena nilai `completed` sudah ada pada enum database.

Transisi yang diizinkan: `draft` → `live`, `draft` → status final, dan `live` → status final. Status final tidak dapat dibuka kembali melalui API. Penghapusan arsip adalah aksi tersendiri dan tetap mengikuti otorisasi yang sudah ada.
