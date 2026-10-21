const assert = require('node:assert/strict');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { testRateLimit } = require('../gateway/test-rate-limit');

async function main() {
  const origin = new URL(process.argv[2] || 'https://prakwebservice-lab08-api-gateway.onrender.com');
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('Gunakan origin HTTPS deployment tanpa kredensial, path, query, atau fragment.');
  }
  const file = resolve(__dirname, '../gateway/.env.render');
  const key = process.env.DEPLOYMENT_API_KEY || readFileSync(file, 'utf8').match(/^API_KEY=(.+)$/m)?.[1].trim();
  if (!key) throw new Error('Key klien deployment belum tersedia. Jalankan npm run setup:render sebelum deploy.');
  const lines = [];
  const checks = [];
  const write = (line) => { console.log(line); lines.push(line); };
  write(`Verifikasi deployment: ${origin.origin}`);
  const startedAt = new Date().toISOString();
  async function request(name, path, { status = 200, authorized = false, method = 'GET', body } = {}) {
    const res = await fetch(new URL(path, origin), {
      method,
      headers: { ...(authorized ? { 'X-API-Key': key } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    const payload = await res.json();
    write(`${name}: ${method} ${path} -> ${res.status}`);
    assert.equal(res.status, status, name);
    checks.push({ name, method, path, status: res.status });
    return { res, payload };
  }

  assert.deepEqual((await request('Readiness', '/readyz')).payload, { status: 'ok', service: 'gateway' });
  const catalog = (await request('Katalog', '/catalog/products')).payload;
  assert.equal(catalog.service, 'catalog-service');
  assert.equal(catalog.data.length, 3);
  const graphql = (await request('GraphQL', '/catalog/graphql', { method: 'POST', body: { query: '{ product(id: "prod-001") { id price } }' } })).payload;
  assert.deepEqual(graphql, { data: { product: { id: 'prod-001', price: 85000 } } });
  await request('Pesanan tanpa key', '/orders/orders', { status: 401 });
  const orders = (await request('Pesanan dengan key', '/orders/orders', { authorized: true })).payload;
  assert.equal(orders.service, 'order-service');
  const created = await request('Buat pesanan demo', '/orders/orders', {
    method: 'POST', authorized: true, status: 201,
    body: { customerName: 'Deployment Demo', items: [{ productId: 'prod-001', quantity: 2 }] },
  });
  assert.equal(created.payload.data.total, 170000);
  assert.equal(created.res.headers.get('location'), `/orders/orders/${created.payload.data.id}`);
  const detail = (await request('Detail melalui Location', created.res.headers.get('location'), { authorized: true })).payload;
  assert.equal(detail.data.id, created.payload.data.id);
  assert.equal(detail.data.total, 170000);
  await request('Quantity nol ditolak', '/orders/orders', {
    method: 'POST', authorized: true, status: 400,
    body: { customerName: 'Deployment Demo', items: [{ productId: 'prod-001', quantity: 0 }] },
  });
  await request('Route tidak dikenal', '/unknown', { status: 404 });

  write('Menunggu 10,5 detik agar window uji rate limit bersih.');
  await new Promise((done) => setTimeout(done, 10500));
  const rateStatuses = await testRateLimit(new URL('/catalog/products', origin).href, write);
  // Readiness must work even when this client's API quota is exhausted.
  await request('Readiness setelah API 429', '/readyz');
  write('LULUS: deployment publik, autentikasi, GraphQL, pesanan, dan rate limit terverifikasi.');
  const evidence = {
    origin: origin.origin, startedAt, completedAt: new Date().toISOString(), passed: true,
    checks, createdOrder: { id: created.payload.data.id, total: created.payload.data.total },
    rateLimit: { limit: 20, windowMs: 10000, statuses: rateStatuses },
  };
  const dir = resolve(__dirname, '../docs/evidence');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'render-verification.json'), JSON.stringify(evidence, null, 2) + '\n');
  writeFileSync(resolve(dir, 'render-verification.txt'), lines.join('\n') + '\n');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
