# Bukti lokal dari pengujian awal

Ketiga screenshot Postman di folder ini dipulihkan tanpa perubahan dari commit `3999fbb`, sebelum gambar utama diperbarui dengan screenshot manual Render. Seluruh request memakai gateway lokal `http://127.0.0.1:8080`.

| Screenshot | Hasil yang terlihat |
| --- | --- |
| `postman-catalog.png` | `GET /catalog/products?search=kopi`, `200`, data Catalog Service. |
| `postman-orders.png` | `GET /orders/orders` dengan key, `200`, data Order Service. |
| `postman-unauthorized.png` | Request pesanan tanpa key, `401 Unauthorized`. |
| `rate-limit.png` | Screenshot terminal manual pengguna: `npm run test:rate-limit`, 20 respons `200` lalu 10 respons `429`, dan `LULUS`. |

Ketiga screenshot Postman merupakan bukti pengujian lokal sebelumnya. Screenshot rate limit berasal dari pengguna pada 21 Oktober 2026 dan identik dengan gambar `../rate-limit.png`.

Urutan bukti laporan: empat screenshot lokal, dashboard deployment Render, lalu empat screenshot pengujian Render. Kesembilan screenshot sudah tersedia, termasuk [rate limit Render](../render/rate-limit.png) yang diberikan pengguna pada 21 Oktober 2026 dan menunjukkan hasil **LULUS** dalam 1681 ms.
