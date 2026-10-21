const { randomBytes, createHash } = require('node:crypto');
const { existsSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const file = resolve(__dirname, '../gateway/.env.render');
if (existsSync(file)) {
  console.log('gateway/.env.render sudah ada; key deployment tidak ditimpa.');
} else {
  const key = randomBytes(32).toString('hex');
  const digest = createHash('sha256').update(key).digest('hex');
  writeFileSync(file, [
    '# Private deployment credentials. This file is ignored by Git.',
    '# Client/Postman uses API_KEY. Render stores API_KEY_SHA256 only.',
    `API_KEY=${key}`,
    `API_KEY_SHA256=${digest}`,
    '',
  ].join('\n'), { flag: 'wx', mode: 0o600 });
  console.log('Key deployment acak dibuat dalam gateway/.env.render.');
  console.log('Simpan file ini secara privat. Nilai key tidak ditampilkan.');
}
