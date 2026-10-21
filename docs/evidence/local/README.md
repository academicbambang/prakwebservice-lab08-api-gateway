# Bukti pengujian lokal

Ketiga screenshot Postman di folder ini diberikan pengguna pada **21 Oktober 2026** dan disalin tanpa perubahan isi. Seluruhnya memperlihatkan environment **Lab 08 Local** dan popup basis URL gateway `http://127.0.0.1:8080`.

| Screenshot | Sumber pengguna / ukuran piksel | Hasil yang terlihat |
| --- | --- | --- |
| `postman-catalog.png` | `codex-clipboard-d0a50a43-2d17-4771-988c-dcd0bdbb39c2.png`, 1918 × 1126 | `GET /catalog/products` tanpa filter, `200 OK`, daftar produk Catalog Service. |
| `postman-orders.png` | `codex-clipboard-5aee6ec9-fccd-4bb0-b87a-3ec808ee3880.png`, 1918 × 1123 | `GET /orders/orders` dengan header `X-API-Key: {{apiKey}}`, `200 OK`, `order-service`, `data: []`. Key asli disamarkan oleh Postman. |
| `postman-unauthorized.png` | `codex-clipboard-6f3109f7-ce65-4459-a58c-eca70db6c4d4.png`, 1918 × 1126 | Request **04 Pesanan tanpa API key**, `401 Unauthorized`, body JSON `{"error":"Unauthorized"}`. |
| `rate-limit.png` | `codex-clipboard-a2d25f54-ed3a-4f20-b3d3-37459ac4bf8b.png`, 1920 × 1200 | Screenshot terminal manual pengguna: `npm run test:rate-limit`, 20 respons `200` lalu 10 respons `429`, dan `LULUS`. |

Screenshot Postman terbaru menggantikan gambar lokal awal yang sebelumnya dipulihkan dari commit `3999fbb`; gambar lama tetap tersedia dalam riwayat Git. Screenshot rate limit berasal dari pengguna pada 21 Oktober 2026 dan identik dengan gambar `../rate-limit.png`. Salinan untuk LaTeX memakai nama `local-postman-catalog.png`, `local-postman-orders.png`, dan `local-postman-unauthorized.png`.

Urutan bukti laporan: empat screenshot lokal, dashboard deployment Render, lalu empat screenshot pengujian Render. Kesembilan screenshot sudah tersedia, termasuk [rate limit Render](../render/rate-limit.png) yang diberikan pengguna pada 21 Oktober 2026 dan menunjukkan hasil **LULUS** dalam 1681 ms.
