const assert = require('node:assert/strict');
const http2 = require('node:http2');
const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

async function main() {
  const target = new URL(process.argv[2] || 'https://prakwebservice-lab08-api-gateway.onrender.com/catalog/products');
  assert.equal(target.protocol, 'https:', 'Pengujian Render memerlukan HTTPS');
  assert.ok(!target.username && !target.password, 'Jangan menaruh kredensial pada URL');
  const session = http2.connect(target.origin);
  // Stream requests report session errors to their callers.
  session.on('error', () => {});
  function request(path, timeoutMs = 15_000) {
    return new Promise((resolveRequest, reject) => {
      const stream = session.request({ ':method': 'GET', ':path': path });
      let headers;
      let finished = false;
      const chunks = [];
      const timer = setTimeout(() => {
        finished = true;
        stream.close(http2.constants.NGHTTP2_CANCEL);
        reject(new Error(`Timeout saat membaca ${path}`));
      }, timeoutMs);
      stream.on('response', (value) => { headers = value; });
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.once('error', (error) => { finished = true; clearTimeout(timer); reject(error); });
      stream.once('end', () => {
        finished = true;
        clearTimeout(timer);
        resolveRequest({ status: headers?.[':status'], headers, body: Buffer.concat(chunks).toString('utf8') });
      });
      stream.once('close', () => {
        clearTimeout(timer);
        if (!finished) reject(new Error(`Koneksi ditutup sebelum respons ${path} selesai`));
      });
      stream.end();
    });
  }

  const lines = [];
  const write = (line) => { console.log(line); lines.push(line); };
  try {
    write('Uji rate limit Render - Lab 08 (Individu)');
    write(`URL: ${target.href}`);
    write('Batas: 20 request / 10 detik / IP; 30 request berurutan, satu sesi HTTP/2.');
    const ready = await request('/readyz', 60_000);
    assert.equal(ready.status, 200, 'Gateway dan kedua service harus siap');
    assert.equal(JSON.parse(ready.body).status, 'ok');

    const path = target.pathname + target.search;
    const probe = await request(path);
    assert.ok([200, 429].includes(probe.status), `Probe mendapat ${probe.status}`);
    assert.equal(probe.headers['ratelimit-limit'], '20');
    assert.equal(probe.headers['ratelimit-policy'], '20;w=10');
    const resetHeader = probe.headers['ratelimit-reset'];
    const reset = Number(resetHeader);
    assert.ok(resetHeader !== undefined && Number.isInteger(reset) && reset >= 0 && reset <= 10, 'RateLimit-Reset tidak valid');
    write(`Menunggu ${reset} detik + 500 ms agar kuota probe dipulihkan.`);
    await new Promise((done) => setTimeout(done, reset * 1000 + 500));

    const startedAt = new Date().toISOString();
    write(`Mulai: ${startedAt}`);
    const start = performance.now();
    const statuses = [];
    const remaining = [];
    for (let i = 1; i <= 30; i++) {
      const response = await request(path);
      statuses.push(response.status);
      remaining.push(Number(response.headers['ratelimit-remaining']));
      const label = response.status === 200 ? 'OK' : response.status === 429 ? 'Too Many Requests' : 'Unexpected status';
      write(`${String(i).padStart(2, '0')}  ${response.status}  ${label}`);
    }
    const elapsedMs = Math.round(performance.now() - start);
    write(`Durasi 30 request: ${elapsedMs} ms (harus < 10000 ms).`);
    assert.ok(elapsedMs < 10_000, 'Pengujian melewati window 10 detik');
    assert.deepEqual(statuses, [...Array(20).fill(200), ...Array(10).fill(429)]);
    assert.deepEqual(remaining, Array.from({ length: 30 }, (_, i) => Math.max(19 - i, 0)), 'Penghitung kuota klien tidak konsisten');
    write('LULUS: 20 request pertama 200; request ke-21 s.d. ke-30 429.');

    const folder = resolve(__dirname, '../docs/evidence/render');
    mkdirSync(folder, { recursive: true });
    writeFileSync(resolve(folder, 'rate-limit.txt'), lines.join('\n') + '\n');
    writeFileSync(resolve(folder, 'rate-limit.json'), JSON.stringify({
      url: target.href, protocol: 'HTTP/2', mode: 'sequential', startedAt,
      completedAt: new Date().toISOString(), elapsedMs, limit: 20,
      windowMs: 10_000, statuses, remaining, passed: true,
    }, null, 2) + '\n');
  } finally {
    session.destroy();
  }
}

main().catch((error) => {
  console.error(error.message);
  console.error('Hasil belum lulus. Hindari request lain dari IP yang sama, lalu ulangi.');
  process.exitCode = 1;
});
