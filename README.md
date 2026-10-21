# Praktikum Web Service - Lab 08: API Gateway

**Bambang Herlambang - 5803024019**

Demo individu API Gateway menggunakan Node.js dan Express. Satu alamat gateway meneruskan request ke Catalog Service dan Order Service, membatasi request menjadi 20 per 10 detik per IP, serta memeriksa API key pada akses pesanan. Repository tugas praktikum sesi 8 ini dapat dijalankan lokal dan sudah di-deploy ke Render.

Implementasi Lab 08 merupakan bagian dari rancangan Marketplace UMKM Kelompok D, dengan fokus pada API Gateway, Catalog Service, dan Order Service.

**Demo publik Render:** [halaman utama gateway](https://prakwebservice-lab08-api-gateway.onrender.com/), [lihat katalog](https://prakwebservice-lab08-api-gateway.onrender.com/catalog/products), atau [periksa readiness](https://prakwebservice-lab08-api-gateway.onrender.com/readyz). Halaman utama menampilkan ringkasan layanan, tautan endpoint, dan status kesiapan kedua service yang diperiksa saat halaman dibuka. Deployment berjalan pada instance Free dan telah diverifikasi, termasuk API key, GraphQL, pembuatan pesanan, serta 20 respons `200` diikuti 10 respons `429`.

## Menjalankan

Siapkan Node.js **22 atau lebih baru** dan npm, lalu jalankan dari root repository:

```sh
npm install
npm run setup
npm start
```

`npm run setup` menyiapkan konfigurasi lokal termasuk API key acak dalam `gateway/.env`. Buka file tersebut untuk mengambil key saat menguji di Postman; jangan masukkan nilainya ke repository atau screenshot. `npm start` menjalankan gateway, katalog, dan pesanan sebagai tiga proses melalui skrip lintas sistem operasi. Hentikan dengan `Ctrl+C`.

| Proses | Alamat lokal | Pemeriksaan kesehatan |
| --- | --- | --- |
| Gateway | `http://127.0.0.1:8080` | `GET /health` |
| Catalog Service | `http://127.0.0.1:3000` | `GET /health` |
| Order Service | `http://127.0.0.1:3001` | `GET /health` |

Untuk mengikuti langkah manual pada materi, buka tiga terminal di root repository dan jalankan satu perintah pada masing-masing terminal:

```sh
node catalog-service/server.js
```

```sh
node order-service/server.js
```

```sh
node gateway/gateway.js
```

Perintah `node gateway.js` juga dapat dijalankan setelah masuk ke folder `gateway`.

## Endpoint melalui satu gateway

| Method | URL gateway | Endpoint pada service | API key |
| --- | --- | --- | --- |
| GET | `/catalog/products` | Catalog `/products` | Tidak diperlukan |
| GET | `/catalog/products/:id` | Catalog `/products/:id` | Tidak diperlukan |
| POST | `/catalog/graphql` | Catalog `/graphql` | Tidak diperlukan |
| GET | `/orders/orders` | Order `/orders` | `X-API-Key` |
| GET | `/orders/orders/:id` | Order `/orders/:id` | `X-API-Key` |
| POST | `/orders/orders` | Order `/orders` | `X-API-Key` |

Gunakan basis URL `http://127.0.0.1:8080` untuk seluruh request klien. Prefix `/catalog` atau `/orders` dihapus sebelum request diteruskan. Karena prefix gateway `/orders` dan resource service `/orders` merupakan dua bagian berbeda, URL `/orders/orders` disengaja: gateway meneruskannya sebagai `/orders` ke Order Service. Penamaan ini mengikuti pola prefix routing materi dengan nama service sesuai domain; alias `/service-a` dan `/service-b` tidak digunakan. Header `Location` relatif dari upstream diberi prefix gateway agar tautan detail tetap dapat diakses melalui alamat gateway.

Contoh body GraphQL (`Content-Type: application/json`):

```json
{
  "query": "{ products { id name price } }"
}
```

Untuk membuat pesanan, ambil ID produk dari katalog lalu kirim body berikut. `{{productId}}` adalah variabel Postman yang diisi dengan ID tersebut.

```json
{
  "customerName": "Bambang",
  "items": [
    { "productId": "{{productId}}", "quantity": 1 }
  ]
}
```

Tambahkan header `X-API-Key` dengan nilai dari `gateway/.env`. Akses pesanan tanpa key atau dengan key salah ditolak `401`. Body diparsing pada service tujuan agar request POST tetap dapat diteruskan oleh proxy.

Saat membuat pesanan, Order Service mengambil detail produk dari katalog secara sinkron melalui `GET /products/:id` untuk menentukan harga. Data demo disimpan dalam memori dan hilang saat proses dimulai ulang. Stok diperiksa ketika pesanan dibuat, tetapi belum direservasi atau dikurangi sehingga demo ini belum menjamin konsistensi stok pada pesanan bersamaan.

## Konfigurasi

Gateway membaca `gateway/.env` dengan path yang tetap sehingga dapat dijalankan dari root maupun folder `gateway`. Gunakan `.env.example` sebagai daftar konfigurasi; `.env` berisi nilai lokal dan tidak di-commit.

| Variabel gateway | Default / fungsi |
| --- | --- |
| `PORT` | `8080` |
| `HOST` | `127.0.0.1`; gunakan `0.0.0.0` bila platform deployment memerlukan akses jaringan |
| `CATALOG_SERVICE_URL` | `http://127.0.0.1:3000` |
| `ORDER_SERVICE_URL` | `http://127.0.0.1:3001` |
| `API_KEY` | Key acak yang dibuat oleh setup lokal; wajib untuk akses pesanan |
| `API_KEY_SHA256` | Alternatif berupa digest SHA-256 key, agar konfigurasi server dapat menyimpan hash |
| `TRUST_PROXY` | `0` untuk akses lokal; gunakan `1` bila gateway berada di belakang satu reverse proxy terpercaya seperti Render |

Saat menjalankan stack, `PORT` digunakan oleh gateway. Port backend memakai variabel terpisah `CATALOG_PORT` (default `3000`) dan `ORDER_PORT` (default `3001`) agar konfigurasi `PORT` global tidak membuat ketiga proses berebut port yang sama. Jika port backend diubah, sesuaikan juga URL upstream gateway dan URL katalog yang dipakai Order Service.

API key dibandingkan melalui hash di memori. Bila memakai `API_KEY_SHA256`, klien tetap mengirim key asli pada header `X-API-Key`; masukkan digest ke konfigurasi server dan hapus `API_KEY` agar hanya satu konfigurasi digunakan. API key ini mengidentifikasi pemanggil demo, belum merupakan sistem autentikasi pengguna atau pengelolaan key dengan rotasi dan pencabutan.

Rate limit berlaku untuk endpoint API gateway, termasuk `/health`, request yang ditolak, dan route tidak dikenal. Endpoint kesiapan `/readyz` dikecualikan agar pemeriksaan platform tidak memakai kuota pengguna. Semua request API dari IP yang sama berbagi kuota. Penyimpanan hit berada dalam memori satu proses dan direset saat gateway dimulai ulang; deployment beberapa instance membutuhkan shared store.

## Pengujian

```sh
npm test
```

Suite memakai `node:test` untuk pengujian unit, integrasi, dan alur HTTP dengan gateway serta service nyata. Skenario mencakup routing dan penghapusan prefix, penerusan query/body, pemeriksaan API key, batas rate limit, input negatif, serta kegagalan upstream. Data uji mencakup batas dan jalur negatif sesuai prinsip BVA dan assertion bermakna dari materi Software Testing. **Hasil terbaru: 40 dari 40 test lulus**, termasuk lima pemeriksaan deployment, sesuai [log persiapan Render](docs/evidence/tests-deployment.txt). [Log awal 35/35](docs/evidence/tests.txt) tetap tersedia sebagai sumber bukti laporan lokal.

Untuk demonstrasi 30 request, **hentikan stack `npm start` terlebih dahulu**, lalu jalankan:

```sh
npm run test:rate-limit
```

Skrip menyiapkan stack lokal baru sehingga kuota IP belum terpakai. [Screenshot terminal manual](docs/evidence/rate-limit.png) menunjukkan request 1-20 berstatus `200`, request 21-30 berstatus `429`, dan hasil **LULUS**. [Transkrip rate limit](docs/evidence/rate-limit.txt) dan [data status JSON](docs/evidence/rate-limit.json) menyimpan hasil eksekusi terdahulu yang terpisah, dengan pola status yang sama. Jika ingin menguji server yang sudah berjalan, gunakan `node gateway/test-rate-limit.js`; tunggu setidaknya 10 detik tanpa request dari IP yang sama sebelum memulai agar window sebelumnya berakhir.

Import collection dan environment dari `docs/postman` ke Postman. Pilih environment lokal, isi `apiKey` dari `gateway/.env` (nilai di file environment sengaja kosong), lalu jalankan katalog dan pesanan dengan basis URL gateway yang sama. Gunakan Postman untuk mengambil screenshot aktual yang menampilkan method, URL, status, dan body; jangan tampilkan nilai header secret.

Untuk mengambil bukti rate limit pada Render, jalankan:

```sh
npm run test:rate-limit:render
```

Mode ini mengaktifkan layanan melalui `/readyz`, membaca sisa window dari header `RateLimit-Reset` pada satu probe katalog, lalu menunggu kuota tersebut pulih. Pengujian mengirim 30 request berurutan melalui satu sesi HTTPS dengan HTTP/2. Hasil diterima hanya jika tepat 20 respons `200` diikuti 10 respons `429`, penghitung sisa kuota konsisten, dan seluruh 30 request selesai dalam waktu kurang dari 10 detik. Hindari request lain dari IP yang sama selama pengujian. URL, waktu mulai, durasi, dan setiap status ditampilkan untuk screenshot terminal. Hasil yang lulus disimpan pada `docs/evidence/render/rate-limit.txt` dan `.json`.

Collection dijalankan manual dalam Postman dengan stack `npm start` aktif. Jika server hanya menyimpan `API_KEY_SHA256`, isi variabel Postman `apiKey` menggunakan key asli yang dimiliki klien, bukan digest server. Pengujian alur otomatis melalui gateway dan service nyata berada dalam `npm test`.

## Berkas pengumpulan

- [Laporan PDF](output/pdf/laporan-praktikum-sesi-08.pdf): cover, diagram, hasil pengujian lokal, deployment, pengujian Render, dan refleksi. Sembilan screenshot disusun mengikuti urutan bukti di bawah.
- [Sumber LaTeX](docs/latex/main.tex) dan [petunjuk kompilasi](docs/latex/README.md): proyek lengkap dengan gambar di dalam folder `docs/latex`.
- [Unduh proyek LaTeX lengkap (ZIP)](output/latex/laporan-praktikum-sesi-08-latex.zip): siap diunggah ke Overleaf.
- [Laporan praktikum](docs/laporan-praktikum-sesi-08.md): implementasi, diagram, prosedur pengujian, dan refleksi.
- Diagram arsitektur: [PNG](docs/arsitektur.png) dan [SVG](docs/arsitektur.svg).
- `gateway/gateway.js` dan `gateway/package.json`: kode serta dependensi gateway.
- `docs/postman`: collection dan environment untuk mengulangi pemeriksaan.
- [Log pengujian otomatis](docs/evidence/tests.txt): 35 dari 35 test lulus.
- [Transkrip rate limit](docs/evidence/rate-limit.txt) dan [data status JSON](docs/evidence/rate-limit.json): hasil eksekusi aktual 20 status `200` diikuti 10 status `429`.
- [Asal screenshot](docs/evidence/README.md): sembilan tangkapan layar manual pengguna pada 21 Oktober 2026, termasuk tiga screenshot Postman lokal terbaru.

Urutan bukti dalam laporan mengikuti alur lokal, deployment, lalu Render:

| No. | Bukti | Status |
| --- | --- | --- |
| 1 | [Katalog lokal](docs/evidence/local/postman-catalog.png) | Screenshot `200` |
| 2 | [Pesanan lokal dengan key](docs/evidence/local/postman-orders.png) | Screenshot `200` |
| 3 | [Pesanan lokal tanpa key](docs/evidence/local/postman-unauthorized.png) | Screenshot `401` |
| 4 | [Rate limit lokal](docs/evidence/rate-limit.png) | Screenshot terminal: 20 respons `200`, lalu 10 respons `429`; **LULUS** |
| 5 | [Deployment Render](docs/evidence/render-dashboard.png) | Screenshot commit `3999fbb`, **Live** |
| 6 | [Katalog Render](docs/evidence/postman-catalog.png) | Screenshot `200` |
| 7 | [Pesanan Render dengan key](docs/evidence/postman-orders.png) | Screenshot `200` |
| 8 | [Pesanan Render tanpa key](docs/evidence/postman-unauthorized.png) | Screenshot `401` |
| 9 | [Rate limit Render](docs/evidence/render/rate-limit.png) | Screenshot terminal: 20 respons `200`, lalu 10 respons `429`; **LULUS**, durasi 1681 ms; [log](docs/evidence/render/rate-limit.txt) dan [JSON](docs/evidence/render/rate-limit.json) dari eksekusi yang sama |

Screenshot Postman lokal memakai `http://127.0.0.1:8080`, sedangkan screenshot Render memakai `https://prakwebservice-lab08-api-gateway.onrender.com` untuk kedua service (HTTPS, port standar `443`). Daftar `data: []` pada screenshot pesanan berarti belum ada pesanan yang tersimpan saat tangkapan diambil; pengujian pembuatan pesanan tercakup dalam suite otomatis. Screenshot rate limit lokal, log eksekusi terdahulu, dan log verifikasi publik merupakan bukti terpisah. Screenshot rate limit Render cocok dengan log eksekusi 21 Oktober 2026 yang dimulai pukul `11:43:50.592Z`, selesai dalam 1681 ms, dan lulus.

## Deployment ke Render

Gateway sudah live di **https://prakwebservice-lab08-api-gateway.onrender.com**. [Panduan dan bukti deployment](docs/deployment-render.md) memuat hasil pemeriksaan publik. Satu instance Free menjalankan tiga proses; hanya gateway dipublikasikan, sedangkan Catalog dan Order tetap pada loopback. Key klien deployment berada dalam `gateway/.env.render` yang diabaikan Git; Render hanya menyimpan digest-nya. Gunakan [environment Postman Render](docs/postman/render.postman_environment.json) untuk menguji URL publik, atau jalankan `npm run verify:deployment`. Blueprint tersedia pada [`render.yaml`](render.yaml).

## Catatan audit dependensi

Audit menemukan advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) pada `braces@3.0.3`, dependensi transitif melalui `http-proxy-middleware@3.0.7 -> micromatch -> braces`. Pada pemeriksaan 21 Oktober 2026, advisory belum menyediakan versi perbaikan. Inspeksi `node_modules/http-proxy-middleware/dist/path-filter.js` menunjukkan `pathFilter` berbentuk fungsi memakai jalur pencocokan kustom; gateway ini memakai fungsi dengan prefix statis dan tidak menerima pola glob dari pengguna, sehingga jalur pemrosesan glob `braces` tidak dipakai oleh routing ini. Temuan dependensi tetap ada dan hasil audit tidak dinyatakan bersih.

## Cakupan dan referensi

Demo ini belum mencakup payment, message queue, OAuth2, mTLS, maupun pengujian independen sistem kelompok lain. Rancangan keamanan proyek UAS dan tugas Java/JUnit Software Testing merupakan tugas terpisah. Materi Web Service dipakai untuk penanganan secret/API key; materi Software Testing dipakai untuk skenario batas dan negatif. Deployment Render Free dapat tidur ketika tidak digunakan; data pesanan demo direset ketika proses restart atau instance tidur.

- Materi lokal: `../materi/2prakwebservice/sesi8.txt` (Lab 08 API Gateway), `../materi/1webservice/sesi8.txt` (keamanan dan scope proyek), `../materi/3softwaretesting/sesi8.txt` (pengujian batas, negatif, dan FIRST). Folder sumber berada di workspace induk, di luar repository ini.
- [Dokumentasi resmi http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware), khususnya routing dan `pathRewrite`.
- [Dokumentasi resmi express-rate-limit](https://express-rate-limit.mintlify.app/reference/configuration), khususnya `windowMs`, `limit`, dan status `429`.
