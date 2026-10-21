# Sumber LaTeX laporan Lab 08

Dokumen utama: [main.tex](main.tex). Folder `images/` memuat seluruh diagram dan tangkapan layar yang dibutuhkan, sehingga proyek ini dapat dipindahkan sebagai satu folder atau diunggah ke Overleaf.

PDF final: [laporan-praktikum-sesi-08.pdf](../../output/pdf/laporan-praktikum-sesi-08.pdf), 12 halaman A4: satu cover dan sebelas halaman isi. Cover mengikuti contoh tata letak pengguna dengan identitas individu Bambang Herlambang, NIM 5803024019, dan tahun 2026. Halaman isi langsung dimulai dari bagian tujuan dan ruang lingkup, tanpa mengulang blok judul dan identitas pada cover. Seluruh halaman tanpa header dan garis header. Cover tanpa footer; penomoran isi dimulai dari 1 dan footer hanya berisi angka di tengah bawah halaman. Bukti disusun dari pengujian lokal, deployment publik, lalu pengujian Render.

## Membuka dan mengompilasi

Buka folder ini dalam editor LaTeX Codex untuk mengedit sumber dan melihat preview PDF. Di Overleaf, unggah `main.tex` beserta folder `images`, lalu pilih `main.tex` sebagai dokumen utama.

Dengan [Tectonic](https://tectonic-typesetting.github.io/), jalankan dari folder ini:

```sh
tectonic main.tex
```

Alternatif dengan instalasi TeX Live atau MiKTeX:

```sh
xelatex main.tex
xelatex main.tex
```

Hasil perintah tersebut adalah `main.pdf`. Untuk memperbarui berkas pengumpulan, salin hasilnya ke `output/pdf/laporan-praktikum-sesi-08.pdf` dari root repository. Kompilasi dua kali dengan XeLaTeX memastikan referensi gambar diperbarui; Tectonic menangani pengulangan tersebut otomatis.

## Asal gambar dan bukti

Gambar disalin dari `docs/arsitektur.png` dan `docs/evidence`. Sumber gambar asli tidak diubah. Perintah `trim` dan `clip` dalam LaTeX membatasi area tampilan screenshot Postman pada halaman agar bagian request dan respons lebih terbaca.

Logo cover `images/logo-ukwms.png` diambil tanpa perubahan dari [aset resmi LPPM UKWMS](https://lppm.ukwms.ac.id/ukwms.png), yang digunakan pada [situs LPPM UKWMS](https://lppm.ukwms.ac.id/). Judul studi kasus, nama anggota tim lain, dan tahun 2024 pada contoh cover tidak digunakan karena dokumen ini merupakan laporan praktikum individu sesi 08 tahun 2026.

Sembilan screenshot dimasukkan dengan urutan berikut:

1. Katalog lokal `200`: `images/local-postman-catalog.png`.
2. Pesanan lokal dengan key `200`: `images/local-postman-orders.png`.
3. Pesanan lokal tanpa key `401`: `images/local-postman-unauthorized.png`.
4. Rate limit lokal, 20 respons `200` lalu 10 respons `429` dan `LULUS`: `images/rate-limit.png`.
5. Deployment Render **Live**, commit `3999fbb`: `images/render-dashboard.png`.
6. Katalog Render `200`: `images/postman-catalog.png`.
7. Pesanan Render dengan key `200`: `images/postman-orders.png`.
8. Pesanan Render tanpa key `401`: `images/postman-unauthorized.png`.
9. Rate limit Render, 20 respons `200` lalu 10 respons `429` dan `LULUS`: `images/render-rate-limit.png`.

Kesembilan screenshot berasal dari tangkapan manual pengguna pada 21 Oktober 2026. Tiga screenshot Postman lokal diperbarui dengan gambar terbaru yang menampilkan environment **Lab 08 Local** dan popup `baseUrl` berisi `http://127.0.0.1:8080`. Katalog memakai `GET /catalog/products` tanpa filter, pesanan dengan key menghasilkan `200`, dan tanpa key menghasilkan `401`. Bukti pesanan memakai variabel `apiKey`, dengan nilai asli disembunyikan. Gambar lokal disalin tanpa perubahan dari `docs/evidence/local`; sumber berukuran 1918 × 1126 piksel untuk katalog dan tanpa key, serta 1918 × 1123 piksel untuk pesanan dengan key, dengan metadata DPI 144. Crop LaTeX disesuaikan dengan ukuran alami tersebut. Tiga gambar lokal awal tetap tersedia dalam riwayat Git, tetapi digantikan oleh screenshot manual terbaru dalam laporan.

Screenshot Postman Render memakai URL HTTPS Render. Screenshot terminal lokal menjalankan `npm run test:rate-limit`. Enam gambar manual lainnya tetap menggunakan sumber berukuran 1920 × 1200 piksel.

Bukti kesembilan adalah screenshot terminal pengguna saat menjalankan `npm run test:rate-limit:render`. Gambar asli disimpan tanpa perubahan pada `docs/evidence/render/rate-limit.png`. Screenshot cocok dengan log `docs/evidence/render/rate-limit.txt` dan `.json`: mulai `2026-10-21T11:43:50.592Z`, durasi `1681 ms`, 20 respons `200`, lalu 10 respons `429`, dan `LULUS`. Screenshot dan log berasal dari eksekusi yang sama, terpisah dari arsip verifikasi deployment awal.

Hasil awal 35/35 berasal dari `docs/evidence/tests.txt`; hasil terbaru 40/40 dan verifikasi publik berasal dari `docs/evidence/tests-deployment.txt` serta `docs/evidence/render-verification.json`. Log ini merupakan bukti eksekusi tersendiri; screenshot manual tidak dinyatakan berasal dari eksekusi log historis yang sama. Gambar asli disimpan utuh, sedangkan `trim`/`clip` pada LaTeX memperbesar area yang relevan tanpa mengubah isi gambar.
