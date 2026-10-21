# Sumber LaTeX laporan Lab 08

Dokumen utama: [main.tex](main.tex). Folder `images/` memuat seluruh diagram dan tangkapan layar yang dibutuhkan, sehingga proyek ini dapat dipindahkan sebagai satu folder atau diunggah ke Overleaf.

PDF final: [laporan-praktikum-sesi-08.pdf](../../output/pdf/laporan-praktikum-sesi-08.pdf), 9 halaman A4: satu cover dan delapan halaman isi. Cover mengikuti contoh tata letak pengguna dengan identitas individu Bambang Herlambang, NIM 5803024019, dan tahun 2026. Seluruh halaman tanpa header dan garis header. Cover tanpa footer; penomoran isi dimulai dari 1 dan footer hanya berisi angka. Bagian 8 memuat deployment publik Render dan bukti verifikasinya.

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

Kelima screenshot diperbarui dengan tangkapan manual pengguna pada 21 Oktober 2026. Bukti Postman memakai alamat HTTPS Render: katalog `200`, pesanan dengan key `200`, dan tanpa key `401`. Bukti rate limit merupakan tangkapan terminal VS Code langsung yang menjalankan `npm run test:rate-limit` secara lokal dan menampilkan 20 respons `200`, 10 respons `429`, serta `LULUS`. Gambar `render-dashboard.png` merekam status Live deployment terbaru commit `3999fbb`.

Hasil awal 35/35 berasal dari `docs/evidence/tests.txt`; hasil terbaru 40/40 dan verifikasi publik berasal dari `docs/evidence/tests-deployment.txt` serta `docs/evidence/render-verification.json`. Log ini merupakan bukti eksekusi tersendiri; screenshot manual tidak dinyatakan berasal dari eksekusi log historis yang sama. Gambar asli disimpan utuh, sedangkan `trim`/`clip` pada LaTeX memperbesar area yang relevan tanpa mengubah isi gambar.
