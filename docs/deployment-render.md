# Deployment demo ke Render

Konfigurasi siap deploy tersedia pada [`render.yaml`](../render.yaml). Status deployment baru dinyatakan berhasil setelah Render memberikan URL dan endpoint publik diverifikasi. Dokumen ini tidak mengklaim aplikasi sudah live.

## Susunan deployment

Satu **Render Free Web Service** menjalankan `npm start`, yang memulai tiga proses Node terpisah:

| Proses | Alamat di instance Render | Akses klien |
| --- | --- | --- |
| Gateway | `0.0.0.0:$PORT` | Publik melalui HTTPS Render |
| Catalog | `127.0.0.1:3000` | Melalui `/catalog/*` di gateway |
| Order | `127.0.0.1:3001` | Melalui `/orders/*` di gateway dan API key |

Ini adalah deployment demo dalam satu host. Ketiga proses tetap memiliki kode, port, dan tanggung jawab terpisah; deployment ini belum memberikan isolasi host atau scaling per service.

Pendekatan ini menjaga backend Order tidak terbuka langsung ke internet dan mencegah pemanggil melewati pemeriksaan API key. Ketika instance tidur atau aktif kembali, ketiga proses mengikuti siklus instance yang sama.

## Menyiapkan key deployment

Dari root repository:

```sh
npm run setup:render
```

Perintah membuat `gateway/.env.render` dengan key acak khusus deployment dan digest SHA-256-nya. File ini diabaikan oleh Git. Jangan mengunggahnya atau menyalin isinya ke laporan.

- **Render:** isi environment variable `API_KEY_SHA256` dengan digest dari file tersebut; biarkan `API_KEY` tidak disetel di Render.
- **Postman:** kirim key asli dari `API_KEY` pada header `X-API-Key`, bukan digest.

Key deployment terpisah dari key demo lokal dalam `gateway/.env`.

## Konfigurasi layanan

Gunakan Blueprint dari repository ini, atau buat satu Web Service dengan pengaturan berikut:

| Pengaturan | Nilai |
| --- | --- |
| Repository | `https://github.com/academicbambang/prakwebservice-lab08-api-gateway` |
| Branch | `main` |
| Runtime / versi | Node.js / `22` |
| Root directory | Kosong, gunakan root repository |
| Build command | `npm ci --omit=dev` |
| Start command | `npm start` |
| Instance | **Free** |
| Region | Singapore |
| Health check | `/readyz` |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `TRUST_PROXY` | `1` |
| `CATALOG_SERVICE_URL` | `http://127.0.0.1:3000` |
| `ORDER_SERVICE_URL` | `http://127.0.0.1:3001` |
| `API_KEY_SHA256` | Digest privat dari `gateway/.env.render` |

Jangan hardcode `PORT`: Render mengisi port gateway. Supervisor tetap mengikat Catalog dan Order ke loopback, meskipun gateway memakai `HOST=0.0.0.0`.

`/readyz` memeriksa health kedua backend dan memberikan `200` hanya jika keduanya siap; kegagalan memberi `503`. Endpoint ini berada di luar kuota API agar pemeriksaan platform tidak menghabiskan jatah pengguna. Endpoint `/health` serta request API tetap mengikuti batas 20 request per 10 detik per IP.

## Verifikasi setelah deploy

Ganti `https://NAMA-LAYANAN.onrender.com` dengan URL aktual yang diberikan Render:

1. `GET /readyz`: `200`, status gateway `ok`.
2. `GET /catalog/products`: `200`, data dari Catalog Service.
3. `POST /catalog/graphql`: hasil GraphQL sesuai query.
4. `GET /orders/orders` tanpa key: `401`.
5. Request yang sama dengan key asli: `200`, data Order Service.
6. `POST /orders/orders` dengan key: `201`, total dihitung dari katalog; ikuti header `Location` untuk membaca detail.
7. Setelah window bersih, kirim 30 request cepat ke katalog: 20 respons `200`, kemudian 10 respons `429`.

Simpan bukti deployment terpisah dari bukti localhost pada `docs/evidence`. Pastikan API key tidak tampak di screenshot atau berkas yang di-commit.

## Batasan demo

Data pesanan dan kuota rate limit berada dalam memori. Keduanya direset saat instance restart, redeploy, atau tidur. Render Free dapat tidur setelah tidak ada trafik dan memerlukan waktu untuk aktif kembali; tunggu hingga `/readyz` normal sebelum menguji 30 request.

Laporan PDF awal merekam pengujian lokal sebelum deployment. URL dan bukti publik akan dicatat setelah deployment berhasil; hasil lokal tidak dipresentasikan sebagai hasil pengujian publik.

Referensi: [Render Node/Express](https://render.com/docs/deploy-node-express-app), [Blueprint](https://render.com/docs/blueprint-spec), [batasan Free](https://render.com/docs/free), dan [health checks](https://render.com/docs/health-checks).
