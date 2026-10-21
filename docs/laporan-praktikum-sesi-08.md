# Laporan Praktikum Web Service Sesi 08

Versi pengumpulan: [PDF](../output/pdf/laporan-praktikum-sesi-08.pdf). Sumber dan gambar tersedia dalam [proyek LaTeX](latex/README.md).

**API Gateway Sederhana dengan Node.js dan Express**<br>
Nama: **Bambang Herlambang**<br>
NIM: **5803024019**<br>
Jenis pengerjaan: **Individu**<br>
Repository: [prakwebservice-lab08-api-gateway](https://github.com/academicbambang/prakwebservice-lab08-api-gateway)

## 1. Tujuan dan batas pengerjaan

Praktikum ini membuat satu pintu masuk untuk dua service demo, membuktikan routing berdasarkan path, dan membatasi request pada gateway. Implementasi menggunakan Node.js, Express, `http-proxy-middleware`, dan `express-rate-limit` sesuai Opsi A Lab 08. Tantangan API key juga diterapkan pada jalur pesanan.

Implementasi Lab 08 merupakan bagian dari rancangan Marketplace UMKM Kelompok D, dengan fokus pada API Gateway, Catalog Service, dan Order Service. Pekerjaan ini merupakan tugas praktikum individu dan belum mencakup implementasi lengkap marketplace UAS. Materi Web Service sesi 8 dibaca sebagai acuan keamanan API key; materi Software Testing sesi 8 menjadi acuan pengujian batas dan skenario negatif. Tugas rancangan keamanan UAS serta tugas Java/JUnit tersendiri tidak termasuk hasil praktikum ini.

## 2. Arsitektur

```mermaid
flowchart TD
    C["Klien / Postman"] -->|"HTTP :8080"| G["API Gateway Node.js + Express"]
    G --> L["Rate limit: 20 request / 10 detik / IP"]
    L -->|"/catalog/* - prefix dihapus"| K["Catalog Service :3000\nREST + GraphQL"]
    L -->|"/orders/*"| A["Pemeriksaan X-API-Key"]
    A -->|"Prefix /orders dihapus"| O["Order Service :3001\nREST"]
    O -->|"Sinkron: GET /products/:id\nambil harga dan periksa stok"| K
```

[Diagram PNG](arsitektur.png) dan [diagram SVG](arsitektur.svg) tersedia untuk dilihat atau dilampirkan secara terpisah.

Klien memakai `http://127.0.0.1:8080` untuk kedua service. Gateway meneruskan request berdasarkan prefix, mempertahankan query string dan body, serta menghapus prefix sebelum menghubungi service. Katalog dapat diakses tanpa API key; jalur pesanan memerlukan key yang benar. Ketiga proses menyediakan `GET /health`.

| Request klien ke gateway | Tujuan service |
| --- | --- |
| `GET /catalog/products` | `GET http://127.0.0.1:3000/products` |
| `GET /catalog/products/:id` | `GET http://127.0.0.1:3000/products/:id` |
| `POST /catalog/graphql` | `POST http://127.0.0.1:3000/graphql` |
| `GET /orders/orders` | `GET http://127.0.0.1:3001/orders` |
| `GET /orders/orders/:id` | `GET http://127.0.0.1:3001/orders/:id` |
| `POST /orders/orders` | `POST http://127.0.0.1:3001/orders` |

URL `/orders/orders` disengaja: `/orders` pertama adalah namespace gateway untuk memilih service, sedangkan `/orders` kedua adalah resource milik Order Service. Ini mempertahankan pola prefix routing pada materi praktikum menggunakan nama domain katalog dan pesanan. Alias `/service-a` dan `/service-b` tidak digunakan.

## 3. Implementasi

Repository memakai npm workspaces untuk `gateway`, `catalog-service`, dan `order-service`. Setup membuat API key acak lokal dalam `gateway/.env`, sedangkan skrip start menjalankan ketiga proses secara lintas sistem operasi. Gateway juga dapat dijalankan langsung melalui `node gateway/gateway.js` dari root atau `node gateway.js` dari folder `gateway` setelah kedua service aktif. Pada stack, `PORT` mengatur port gateway, sedangkan `CATALOG_PORT` dan `ORDER_PORT` mengatur port masing-masing backend agar variabel `PORT` global tidak menyebabkan konflik.

Gateway membaca `PORT`, `HOST`, `CATALOG_SERVICE_URL`, `ORDER_SERVICE_URL`, `API_KEY`, dan `TRUST_PROXY` dari konfigurasi. Default lokal adalah host `127.0.0.1`, port `8080`, dan `TRUST_PROXY=0`. Pada Render, gateway memakai `HOST=0.0.0.0`, port dari platform, dan `TRUST_PROXY=1`; kedua backend tetap loopback. Hasil deployment publik dicatat pada bagian 9. Bukti pada bagian 5 disusun dari pengujian lokal, deployment, lalu pengujian Render.

Rate limit dipasang sebelum routing API sehingga setiap IP mendapat paling banyak 20 request selama 10 detik. Request berikutnya memperoleh `429 Too Many Requests`. Endpoint `/health` dan request yang ditolak juga menghabiskan kuota; pengujian batas harus dimulai dengan window yang bersih. Endpoint readiness `/readyz` dikecualikan agar pemeriksaan platform tidak memakai kuota API. Penyimpanan penghitung lokal berada dalam memori satu proses.

API key dikirim melalui header `X-API-Key`. Key server diubah menjadi hash dalam memori untuk pemeriksaan, dan konfigurasi `API_KEY_SHA256` dapat dipakai sebagai alternatif penyimpanan digest. Key tidak ditanam dalam kode atau file environment Postman yang di-commit. Header tidak ada atau tidak cocok menghasilkan `401 Unauthorized` pada jalur pesanan. Mekanisme ini merupakan pemeriksaan key demo; rotasi, pencabutan, dan izin per pengguna masih merupakan pengembangan berikutnya.

Parsing JSON dilakukan pada service tujuan agar body POST tidak habis dibaca sebelum melewati proxy. Catalog Service menyediakan REST untuk daftar/detail produk dan GraphQL untuk pemilihan field katalog. Order Service menyediakan daftar/detail pesanan dan pembuatan pesanan dengan `customerName` serta `items` berisi `productId` dan `quantity`. Header `Location` relatif dari upstream ditulis ulang dengan prefix gateway sehingga tautan detail pesanan tetap menuju pintu masuk yang sama.

Order Service mengambil detail produk dari katalog secara sinkron melalui `GET /products/:id` untuk menghitung harga pesanan. Data demo disimpan dalam memori dan hilang ketika proses dimulai ulang. Stok diperiksa, tetapi belum direservasi atau dikurangi; pesanan bersamaan belum dijamin konsistensinya oleh demo ini.

## 4. Prosedur dan skenario pengujian

### Menjalankan aplikasi dan Postman

```sh
npm install
npm run setup
npm start
```

Import collection dan environment dalam `docs/postman`. Pilih environment lokal dan isi `apiKey` dengan nilai lokal dari `gateway/.env`. Jalankan katalog terlebih dahulu untuk memperoleh ID produk yang digunakan pada pembuatan pesanan. Request katalog dan pesanan sama-sama harus menampilkan basis URL gateway dengan port `8080`.

Untuk mengulangi screenshot Render pada bagian 5, import `render.postman_environment.json`, pilih **Lab 08 Render**, lalu isi `apiKey` dari nilai `API_KEY` dalam `gateway/.env.render`. Kedua service diakses melalui satu basis URL `https://prakwebservice-lab08-api-gateway.onrender.com` (HTTPS, port standar `443`); tidak perlu menjalankan stack lokal untuk request publik ini.

Untuk pengujian lokal, collection dijalankan manual melalui Postman ketika stack `npm start` aktif. Bila server hanya dikonfigurasi dengan `API_KEY_SHA256`, isi variabel Postman `apiKey` menggunakan key asli milik klien, bukan digest yang disimpan server. Pengujian alur otomatis menggunakan gateway dan service nyata termasuk dalam `npm test`.

### Pengujian otomatis

```sh
npm test
```

Pengujian memakai `node:test` dengan assertion otomatis. Unit test menguji logika yang dapat diisolasi, sedangkan integration test memeriksa perilaku HTTP gateway dan service; pengujian alur menyeluruh menggunakan gateway dan service nyata. Skenario negatif memastikan hasil penolakan, bukan sekadar memastikan request tidak menimbulkan exception. Batas penerimaan rate limit diperiksa pada request ke-20 dan ke-21.

| ID | Skenario | Hasil yang diharapkan |
| --- | --- | --- |
| GW-01 | Katalog melalui `/catalog/products` | `200`, data katalog dari Catalog Service |
| GW-02 | Pesanan melalui `/orders/orders` dengan key benar | `200`, data dari Order Service |
| GW-03 | Pesanan tanpa key atau key salah | `401`, request tidak diteruskan sebagai akses sah |
| GW-04 | Prefix routing dan query string | Prefix dihapus; query tetap diterima upstream |
| GW-05 | POST JSON ke GraphQL dan pesanan | Body utuh diterima service; respons tidak menggantung |
| GW-06 | Route gateway tidak terdaftar | `404` |
| GW-07 | Batas request dari satu IP pada window bersih | Request 1-20 `200`; request 21-30 `429` |
| GW-08 | Window berakhir | Request dapat diterima lagi setelah jendela limit habis |
| GW-09 | Input pesanan tidak valid | Ditolak sebagai kesalahan klien, tanpa membuat pesanan sah |
| GW-10 | Upstream tidak tersedia | Respons gateway terkendali, tanpa request menggantung |

### Bukti khusus rate limiting

Hentikan stack `npm start` terlebih dahulu agar port tidak digunakan, kemudian jalankan:

```sh
npm run test:rate-limit
```

Perintah menyiapkan stack baru lalu mengirim 30 request berurutan ke endpoint katalog yang valid. Target bukti adalah 20 status `200` diikuti 10 status `429`. Untuk menguji server yang sudah aktif, gunakan `node gateway/test-rate-limit.js` setelah menunggu setidaknya 10 detik tanpa request dari IP yang sama. Pisahkan demonstrasi ini dari request Postman agar kuota awal tidak terpakai.

Pengujian khusus Render dijalankan melalui `npm run test:rate-limit:render`. Skrip menunggu pemulihan kuota, mengirim 30 request berurutan melalui satu sesi HTTP/2, lalu memeriksa pola 20 respons `200` dan 10 respons `429` beserta penghitung kuotanya dalam durasi kurang dari 10 detik. Hasil yang lulus disimpan dalam `evidence/render/rate-limit.txt` dan `.json`. Screenshot terminal pengguna menunjukkan hasil yang sama: pengujian dimulai `2026-10-21T11:43:50.592Z`, durasi 1681 ms, dan **LULUS**.

## 5. Bukti pengumpulan dan status verifikasi

Eksekusi awal `npm test` lulus **35 dari 35 test**, tanpa kegagalan, sesuai [log pengujian awal](evidence/tests.txt). Suite setelah penambahan pemeriksaan deployment lulus **40/40** sesuai [log deployment](evidence/tests-deployment.txt). Sembilan screenshot tersedia: tiga screenshot Postman lokal awal yang dipulihkan dari Git dan enam screenshot manual pengguna pada 21 Oktober 2026. Bukti disusun dari empat pengujian lokal, deployment, lalu empat pengujian Render.

| No. | Pemeriksaan | Hasil aktual | Bukti |
| --- | --- | --- | --- |
| 1 | Katalog lokal melalui gateway: `GET /catalog/products?search=kopi` | `200`, data Catalog Service | [Screenshot lokal katalog](evidence/local/postman-catalog.png) |
| 2 | Pesanan lokal: `GET /orders/orders`, key benar | `200`, data Order Service | [Screenshot lokal pesanan](evidence/local/postman-orders.png) |
| 3 | Pesanan lokal tanpa `X-API-Key` | `401 Unauthorized` | [Screenshot lokal tanpa key](evidence/local/postman-unauthorized.png) |
| 4 | Rate limit lokal: `npm run test:rate-limit` | Request 1-20 `200`, request 21-30 `429`; **LULUS** | [Screenshot terminal lokal](evidence/rate-limit.png) |
| 5 | Deployment Render, commit `3999fbb` | **Live**, deployment terbaru berhasil | [Screenshot Render](evidence/render-dashboard.png) |
| 6 | Katalog Render: `GET /catalog/products` | `200`, `service: catalog-service`, daftar produk | [Screenshot Render katalog](evidence/postman-catalog.png) |
| 7 | Pesanan Render: `GET /orders/orders`, key benar | `200`, `service: order-service`, `data: []`, tes 3/3 | [Screenshot Render pesanan](evidence/postman-orders.png) |
| 8 | Pesanan Render tanpa `X-API-Key` | `401 Unauthorized`, tes 3/3 | [Screenshot Render tanpa key](evidence/postman-unauthorized.png) |
| 9 | Rate limit Render: `npm run test:rate-limit:render` | 20 respons `200`, lalu 10 respons `429`; **LULUS**, durasi 1681 ms | [Screenshot terminal Render](evidence/render/rate-limit.png), [log](evidence/render/rate-limit.txt), [JSON](evidence/render/rate-limit.json) |

Screenshot lokal menggunakan `http://127.0.0.1:8080`; ketiga screenshot Postman Render menggunakan satu basis URL HTTPS Render yang sama. Nilai key asli tidak ditampilkan. Ketiga screenshot Postman lokal dipulihkan tanpa perubahan dari commit `3999fbb`. Screenshot rate limiting lokal dan Render merupakan tangkapan terminal langsung pengguna. [Log rate limit lokal](evidence/rate-limit.txt), [JSON status](evidence/rate-limit.json), dan [halaman transkrip](evidence/rate-limit.html) adalah arsip eksekusi terdahulu yang terpisah, dengan pola hasil yang sama. Screenshot rate limit Render cocok dengan log dan JSON dari eksekusi yang dimulai `2026-10-21T11:43:50.592Z` dan selesai dalam 1681 ms. Daftar `data: []` pada screenshot pesanan menunjukkan belum ada pesanan tersimpan saat tangkapan diambil; pembuatan pesanan dengan perhitungan harga katalog diuji dalam suite otomatis. Asal seluruh gambar dicatat dalam [daftar bukti](evidence/README.md).

<details>
<summary>Lihat tangkapan layar bukti</summary>

**1. Katalog lokal - 200**

![Postman katalog melalui gateway lokal, status 200](evidence/local/postman-catalog.png)

**2. Pesanan lokal - 200**

![Postman pesanan melalui gateway lokal, status 200](evidence/local/postman-orders.png)

**3. Pesanan lokal tanpa API key - 401**

![Postman pesanan lokal tanpa API key, status 401](evidence/local/postman-unauthorized.png)

**4. Rate limit lokal - 20 respons 200, lalu 10 respons 429**

![Terminal VS Code menampilkan pengujian rate limit lokal yang lulus](evidence/rate-limit.png)

**5. Deployment Render - Live**

![Dashboard Render menampilkan commit 3999fbb berstatus Live](evidence/render-dashboard.png)

**6. Katalog Render - 200**

![Postman katalog melalui gateway Render, status 200](evidence/postman-catalog.png)

**7. Pesanan Render - 200**

![Postman pesanan melalui gateway Render, status 200](evidence/postman-orders.png)

**8. Pesanan Render tanpa API key - 401**

![Postman pesanan Render tanpa API key, status 401](evidence/postman-unauthorized.png)

**9. Rate limit Render - 20 respons 200, lalu 10 respons 429**

![Terminal VS Code menampilkan pengujian rate limit Render yang lulus dalam 1681 ms](evidence/render/rate-limit.png)

[Log pengujian Render](evidence/render/rate-limit.txt) dan [data JSON](evidence/render/rate-limit.json) menyimpan 30 respons aktual dari eksekusi yang sama, dimulai `2026-10-21T11:43:50.592Z`.

</details>

Diagram arsitektur tersedia pada bagian 2. Tautan repository di bagian identitas menyediakan `gateway.js`, `package.json`, konfigurasi contoh, dan skrip pengujian untuk reproduksi.

Audit dependensi menemukan `braces@3.0.3` melalui rantai `http-proxy-middleware@3.0.7 -> micromatch -> braces` yang terdampak [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm); pada pemeriksaan 21 Oktober 2026 belum tersedia versi perbaikan. Inspeksi `node_modules/http-proxy-middleware/dist/path-filter.js` menunjukkan filter fungsi menuju pencocokan kustom, sedangkan pemrosesan glob menggunakan `micromatch`. Gateway memakai filter fungsi dengan prefix statis, tanpa pola glob dari input pengguna, sehingga jalur `braces` tersebut tidak dipakai oleh routing. Advisory tetap tercatat dan audit tidak diklaim bersih.

## 6. Refleksi

Klien cukup mengetahui satu alamat gateway untuk mengakses katalog dan pesanan. Perubahan alamat atau port service dapat dilakukan melalui konfigurasi gateway tanpa mengubah alamat yang dipakai klien. Penerapan rate limit dan pemeriksaan API key di pintu masuk membuat kebijakan akses lebih mudah dipantau secara konsisten. Jika gateway mati, kedua service tidak dapat diakses melalui alamat tersebut sehingga gateway menjadi titik kegagalan yang perlu ditangani pada pengembangan berikutnya.

## 7. Kaitan dengan materi dan kelanjutan

Penggunaan header API key, penyimpanan secret di environment, dan pembandingan hash mengikuti konsep keamanan sesi 8 Web Service. BVA diterapkan pada batas request 20 dan 21, sedangkan input negatif serta akses tanpa key diuji dengan assertion otomatis sesuai prinsip pengujian Software Testing. Tugas Java/JUnit minimal delapan test dan rancangan keamanan proyek UAS merupakan penugasan terpisah dari praktikum ini.

Pengujian pada repository merupakan verifikasi pengembang untuk tugas individu.

## 8. Referensi

1. Philipus Suryo Subandoro, **Praktikum Web Service Lab 08: API Gateway Sederhana**. Sumber lokal workspace: `materi/2prakwebservice/sesi8.txt`.
2. Philipus Suryo Subandoro, **Web Service Sesi 08: Keamanan Lanjutan dan Kick-off Proyek**. Sumber lokal workspace: `materi/1webservice/sesi8.txt`.
3. Philipus Suryo Subandoro, **Software Testing Sesi 08: Unit Testing (JUnit) dan Proyek Lintas Mata Kuliah**. Sumber lokal workspace: `materi/3softwaretesting/sesi8.txt`.
4. [Dokumentasi resmi http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware), konfigurasi proxy dan penghapusan prefix dengan `pathRewrite`.
5. [Dokumentasi resmi express-rate-limit](https://express-rate-limit.mintlify.app/reference/configuration), konfigurasi window, batas request, dan respons `429`.

Ketiga materi lokal berada di folder `materi` pada workspace induk repository. Materi memberi dasar requirement praktikum dan pembatasan scope; dokumentasi resmi digunakan untuk implementasi middleware.

## 9. Deployment publik Render

Gateway telah live di **https://prakwebservice-lab08-api-gateway.onrender.com**. Satu instance Free menjalankan tiga proses: gateway publik dan backend Catalog/Order pada loopback. Screenshot dashboard terbaru menunjukkan commit `3999fbb` berstatus **Live**, termasuk halaman utama gateway. Deployment pertama memakai commit `196da4b` pada 21 Oktober 2026 pukul 13:59 (UTC+7).

Log verifikasi publik dari deployment pertama mencatat katalog dan GraphQL `200`, pesanan tanpa key `401`, pesanan dengan key `200`, pembuatan pesanan demo `201` dengan total Rp170.000, serta detail melalui `Location` `200`. Uji 30 request pada eksekusi tersebut menghasilkan tepat 20 respons `200` lalu 10 respons `429`. Endpoint `/readyz` tetap `200` setelah kuota API habis. Log ini dipertahankan sebagai bukti historis terpisah dari screenshot manual terbaru.

Suite terbaru setelah penambahan pemeriksaan deployment lulus **40/40**, sedangkan log awal 35/35 dipertahankan sebagai bukti historis. Key deployment berada dalam `gateway/.env.render` yang diabaikan Git; server Render hanya menyimpan digest-nya. Instance Free dapat tidur saat tidak digunakan dan data demo hilang ketika proses restart.

[Panduan dan bukti deployment](deployment-render.md), [status Live](evidence/render-dashboard.png), [log publik](evidence/render-verification.txt), [hasil JSON](evidence/render-verification.json), dan [log 40/40](evidence/tests-deployment.txt).
