# E-Notulen: Acceptance Test Audio dan Rangkuman

Dokumen ini adalah checklist wajib sebelum fitur live transcription dipakai sebagai notula resmi. AI membantu menyusun draf, tetapi pengesahan tetap dilakukan oleh petugas.

## Prasyarat

- Jalankan aplikasi melalui HTTPS pada lingkungan produksi agar izin mikrofon stabil.
- Pastikan `DEEPGRAM_API_KEY`, `GEMINI_API_KEY`, `DATABASE_URL`, dan `NEXT_PUBLIC_SUPABASE_URL` tersedia di server.
- Jalankan **Tes mic** sebelum setiap rapat dan pastikan hasilnya **Siap digunakan**.
- Simpan salinan transkrip asli untuk audit dan koreksi manual.

## Sepuluh skenario uji

| No. | Skenario | Hasil yang harus dicatat |
| --- | --- | --- |
| 1 | Suara normal, mikrofon dekat | Transkrip muncul cepat, tidak ada potongan kata berarti |
| 2 | Suara pelan | Tes mic memberi indikator; ucapan tetap terbaca setelah pemrosesan |
| 3 | Mikrofon berjarak 1–2 meter | Tidak ada jeda panjang atau hilangnya seluruh kalimat |
| 4 | Ruangan dengan kipas/AC | Noise tidak mendominasi transkrip |
| 5 | Dua pembicara bergantian | Label pembicara dan pergantian kalimat dapat diverifikasi |
| 6 | Tiga pembicara atau lebih | Tidak ada klaim identitas; label hanya dianggap indikator bantu |
| 7 | Dua pembicara berbicara bersamaan | Kalimat yang tidak jelas ditandai perlu verifikasi |
| 8 | Simulasikan jaringan terputus sekitar 30 detik | Aplikasi mencoba reconnect dan audio sementara masuk buffer |
| 9 | Rapat panjang minimal 60 menit | Tidak ada memory leak, UI tetap responsif, autosave tetap berjalan |
| 10 | Transkrip panjang dengan keputusan dan tugas | Setiap keputusan/tugas punya bukti waktu atau masuk daftar verifikasi |

## Kriteria lulus

- Tidak ada error fatal pada browser atau server.
- Reconnect berhasil pada gangguan singkat tanpa pengguna memulai ulang sesi.
- Rangkuman hanya memuat fakta yang ada di transkrip.
- `PIC`, `deadline`, dan `status` selalu tersedia pada setiap tindak lanjut; nilai boleh “belum ditentukan” jika memang tidak disebutkan.
- Keputusan dan tindak lanjut memiliki kutipan bukti serta timestamp bila sumber transkrip menyediakannya.
- Semua item dengan keyakinan rendah atau informasi ambigu ditandai **Perlu verifikasi**.
- Petugas memeriksa transkrip dan rangkuman sebelum rapat diarsipkan atau dibagikan.

## Catatan pelaksanaan

> Isi satu catatan untuk setiap sesi. Pilih status **Belum diuji**, **Lulus**, atau **Gagal** dan lampirkan bukti/temuan aktual. Jangan menyimpulkan skenario lulus hanya dari pemeriksaan kode.

### Metadata sesi

| Tanggal dan waktu | Lingkungan/URL | Browser dan versi | OS/perangkat | Mikrofon | Penguji |
| --- | --- | --- | --- | --- | --- |
| Belum dijalankan | Belum ditentukan | Belum ditentukan | Belum ditentukan | Belum ditentukan | Belum ditentukan |

### Hasil skenario

| No. | Status | Durasi aktual | Gangguan jaringan | Temuan, koreksi, dan bukti |
| --- | --- | --- | --- | --- |
| 1 | Belum diuji | — | — | — |
| 2 | Belum diuji | — | — | — |
| 3 | Belum diuji | — | — | — |
| 4 | Belum diuji | — | — | — |
| 5 | Belum diuji | — | — | — |
| 6 | Belum diuji | — | — | — |
| 7 | Belum diuji | — | — | — |
| 8 | Belum diuji | — | — | — |
| 9 | Belum diuji | — | — | — |
| 10 | Belum diuji | — | — | — |

Untuk skenario 10, catat timestamp atau kutipan transkrip yang mendukung setiap keputusan dan tindak lanjut, serta item yang harus dikoreksi/diverifikasi. Gunakan data rapat uji yang memang boleh diproses oleh layanan transkripsi.
