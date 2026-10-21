# Asal screenshot manual

Lima screenshot berikut diberikan pengguna melalui percakapan pada **21 Oktober 2026**. Berkas disalin dari gambar asli ke repository tanpa pemotongan, penyamaran, atau perubahan isi; ukuran masing-masing **1920 × 1200 piksel**. Salinan untuk laporan LaTeX berada di `docs/latex/images`.

| Berkas bukti | Nama berkas sumber pengguna | Isi yang terlihat |
| --- | --- | --- |
| [postman-catalog.png](postman-catalog.png) | `codex-clipboard-5c321cc6-36b3-4839-aaa8-6599f0686f8c.png` | Postman `GET /catalog/products` pada HTTPS Render, `200 OK`, daftar produk Catalog Service. |
| [postman-orders.png](postman-orders.png) | `codex-clipboard-07a296b3-82ea-4caa-a5f7-0b5c1ae7b3fb.png` | Postman `GET /orders/orders` pada HTTPS Render dengan header `X-API-Key: {{apiKey}}`, `200 OK`, `order-service`, `data: []`, tes 3/3. Key asli tidak ditampilkan. |
| [postman-unauthorized.png](postman-unauthorized.png) | `codex-clipboard-940621c0-8dc9-4bdf-9ba0-cfdc96763ada.png` | Postman request pesanan tanpa key pada HTTPS Render, `401 Unauthorized`, tes 3/3. |
| [rate-limit.png](rate-limit.png) | `codex-clipboard-a2d25f54-ed3a-4f20-b3d3-37459ac4bf8b.png` | Terminal VS Code, perintah `npm run test:rate-limit` pada stack lokal; request 01–20 `200`, 21–30 `429`, hasil **LULUS**. |
| [render-dashboard.png](render-dashboard.png) | `codex-clipboard-7e93f9e3-aecf-4f97-a744-77664126ce22.png` | Dashboard Render: service dan URL publik, deployment terbaru commit `3999fbb` berstatus **Live**. Deployment pertama `196da4b` juga terlihat. |

Ketiga screenshot Postman memakai satu basis URL `https://prakwebservice-lab08-api-gateway.onrender.com` untuk kedua service (HTTPS, port standar `443`). Daftar pesanan kosong hanya menunjukkan keadaan data saat screenshot diambil.

`rate-limit.txt`, `rate-limit.json`, dan `rate-limit.html` adalah arsip eksekusi rate limit terdahulu, bukan sumber screenshot terminal manual terbaru. `render-verification.txt` dan `.json` menyimpan verifikasi otomatis deployment pertama. `tests.txt` menyimpan hasil awal 35/35, sedangkan `tests-deployment.txt` menyimpan hasil setelah penambahan pemeriksaan deployment 40/40. Seluruh log tersebut dipertahankan sebagai bukti terpisah.
