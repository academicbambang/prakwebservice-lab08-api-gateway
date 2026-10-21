# Asal dan urutan screenshot

Laporan memuat sembilan screenshot dengan urutan empat bukti lokal, satu bukti deployment, lalu empat bukti pengujian Render. Pengujian rate limit Render dilengkapi screenshot terminal dan log dari eksekusi yang sama. Urutan seluruh bukti:

| No. | Bukti | Berkas / status |
| --- | --- | --- |
| 1 | Katalog lokal `200` | [local/postman-catalog.png](local/postman-catalog.png) |
| 2 | Pesanan lokal dengan key `200` | [local/postman-orders.png](local/postman-orders.png) |
| 3 | Pesanan lokal tanpa key `401` | [local/postman-unauthorized.png](local/postman-unauthorized.png) |
| 4 | Rate limit lokal, **LULUS** | [rate-limit.png](rate-limit.png) |
| 5 | Deployment Render **Live** | [render-dashboard.png](render-dashboard.png) |
| 6 | Katalog Render `200` | [postman-catalog.png](postman-catalog.png) |
| 7 | Pesanan Render dengan key `200` | [postman-orders.png](postman-orders.png) |
| 8 | Pesanan Render tanpa key `401` | [postman-unauthorized.png](postman-unauthorized.png) |
| 9 | Rate limit Render, **LULUS** | [Screenshot](render/rate-limit.png), [log](render/rate-limit.txt), [JSON](render/rate-limit.json) |

## Enam screenshot manual pengguna

Enam screenshot berikut diberikan pengguna melalui percakapan pada **21 Oktober 2026**. Berkas disalin dari gambar asli ke repository tanpa pemotongan, penyamaran, atau perubahan isi; ukuran masing-masing **1920 × 1200 piksel**. Salinan untuk laporan LaTeX berada di `docs/latex/images`.

| Berkas bukti | Nama berkas sumber pengguna | Isi yang terlihat |
| --- | --- | --- |
| [postman-catalog.png](postman-catalog.png) | `codex-clipboard-5c321cc6-36b3-4839-aaa8-6599f0686f8c.png` | Postman `GET /catalog/products` pada HTTPS Render, `200 OK`, daftar produk Catalog Service. |
| [postman-orders.png](postman-orders.png) | `codex-clipboard-07a296b3-82ea-4caa-a5f7-0b5c1ae7b3fb.png` | Postman `GET /orders/orders` pada HTTPS Render dengan header `X-API-Key: {{apiKey}}`, `200 OK`, `order-service`, `data: []`, tes 3/3. Key asli tidak ditampilkan. |
| [postman-unauthorized.png](postman-unauthorized.png) | `codex-clipboard-940621c0-8dc9-4bdf-9ba0-cfdc96763ada.png` | Postman request pesanan tanpa key pada HTTPS Render, `401 Unauthorized`, tes 3/3. |
| [rate-limit.png](rate-limit.png) | `codex-clipboard-a2d25f54-ed3a-4f20-b3d3-37459ac4bf8b.png` | Terminal VS Code, perintah `npm run test:rate-limit` pada stack lokal; request 01–20 `200`, 21–30 `429`, hasil **LULUS**. |
| [render-dashboard.png](render-dashboard.png) | `codex-clipboard-7e93f9e3-aecf-4f97-a744-77664126ce22.png` | Dashboard Render: service dan URL publik, deployment terbaru commit `3999fbb` berstatus **Live**. Deployment pertama `196da4b` juga terlihat. |
| [render/rate-limit.png](render/rate-limit.png) | `codex-clipboard-ad388f28-9dde-473b-b473-9ee0a75e6565.png` | Terminal VS Code, perintah `npm run test:rate-limit:render`; request 01–20 `200`, 21–30 `429`, durasi 1681 ms, hasil **LULUS**. Waktu mulai `2026-10-21T11:43:50.592Z` cocok dengan log dan JSON Render. |

Ketiga screenshot Postman memakai satu basis URL `https://prakwebservice-lab08-api-gateway.onrender.com` untuk kedua service (HTTPS, port standar `443`). Daftar pesanan kosong hanya menunjukkan keadaan data saat screenshot diambil.

`rate-limit.txt`, `rate-limit.json`, dan `rate-limit.html` adalah arsip eksekusi rate limit terdahulu, bukan sumber screenshot terminal manual terbaru. `render-verification.txt` dan `.json` menyimpan verifikasi otomatis deployment pertama. `tests.txt` menyimpan hasil awal 35/35, sedangkan `tests-deployment.txt` menyimpan hasil setelah penambahan pemeriksaan deployment 40/40. Seluruh log tersebut dipertahankan sebagai bukti terpisah.

## Pelengkapan bukti lokal dan Render

Tiga screenshot Postman lokal awal dipulihkan tanpa perubahan dari commit Git `3999fbb` ke folder [`local`](local/README.md), beserta salinan screenshot terminal rate limit lokal. Ketiganya memakai gateway `http://127.0.0.1:8080`, dan merupakan bukti eksekusi lokal sebelum gambar utama diganti oleh screenshot Render. Screenshot lokal tidak diberi label sebagai screenshot manual terbaru dari pengguna.

Dengan empat screenshot lokal, dashboard deployment, tiga screenshot Postman Render, dan satu screenshot terminal rate limit Render, sembilan screenshot sudah dimasukkan ke laporan. Screenshot rate limit Render berasal dari eksekusi `npm run test:rate-limit:render` pada 21 Oktober 2026, mulai `2026-10-21T11:43:50.592Z`. Pengujian memakai satu sesi HTTP/2, menunggu pemulihan kuota probe, dan memeriksa 30 respons berurutan aktual beserta penghitung kuotanya. Hasilnya tepat 20 respons `200` diikuti 10 respons `429` dalam 1681 ms, sesuai `render/rate-limit.txt` dan `render/rate-limit.json`. Salinan gambar untuk LaTeX bernama `render-rate-limit.png`.
