# Sumber LaTeX laporan Lab 08

Dokumen utama: [main.tex](main.tex). Folder `images/` memuat seluruh diagram dan tangkapan layar yang dibutuhkan, sehingga proyek ini dapat dipindahkan sebagai satu folder atau diunggah ke Overleaf.

PDF final: [laporan-praktikum-sesi-08.pdf](../../output/pdf/laporan-praktikum-sesi-08.pdf), 7 halaman A4. Dokumen dibuat untuk tugas individu Bambang Herlambang, NIM 5803024019.

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

Bukti rate limit berupa tangkapan halaman transkrip keluaran skrip asli, bukan tangkapan terminal langsung. Ringkasan 35/35 pengujian pada PDF berasal dari `docs/evidence/tests.txt`; laporan ini tidak mengubah atau menjalankan ulang kode aplikasi.
