const { spawn } = require('node:child_process');
const { resolve } = require('node:path');
const { loadLocalEnv } = require('../gateway/config');

const root = resolve(__dirname, '..');
loadLocalEnv();
const serviceEnv = {
  ...process.env,
  // A deployment's PORT belongs to the gateway, not to all three processes.
  CATALOG_PORT: process.env.CATALOG_PORT || '3000',
  ORDER_PORT: process.env.ORDER_PORT || '3001',
};
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill();
  process.exitCode = code;
}
for (const file of ['catalog-service/server.js', 'order-service/server.js', 'gateway/gateway.js']) {
  const child = spawn(process.execPath, [resolve(root, file)], { cwd: root, env: serviceEnv, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.on('error', (error) => { console.error(error.message); stop(1); });
  child.on('exit', (code) => { if (!stopping) stop(code || 1); });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
