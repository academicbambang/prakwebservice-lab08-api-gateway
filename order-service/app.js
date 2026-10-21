'use strict';

const { randomUUID } = require('node:crypto');
const express = require('express');
const { OrderError, validateOrderInput, priceOrder } = require('./order');

function createOrderApp({
  catalogUrl = process.env.CATALOG_SERVICE_URL || 'http://127.0.0.1:3000',
  fetchImpl = fetch,
} = {}) {
  const app = express();
  const orders = new Map();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  async function getCatalogProduct(productId) {
    try {
      const response = await fetchImpl(`${catalogUrl.replace(/\/+$/, '')}/products/${encodeURIComponent(productId)}`, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      if (response.status === 404) throw new OrderError(`Unknown product: ${productId}`);
      if (!response.ok) throw new OrderError('Catalog service is unavailable', 502);
      const payload = await response.json();
      return [productId, payload?.data];
    } catch (error) {
      if (error instanceof OrderError) throw error;
      throw new OrderError('Catalog service is unavailable or timed out', 502);
    }
  }

  // API key diperiksa gateway. Jalankan backend di jaringan internal/loopback.
  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'order-service' }));

  app.get('/orders', (req, res) => {
    res.json({ service: 'order-service', data: [...orders.values()] });
  });

  app.get('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ data: order });
  });

  app.post('/orders', async (req, res) => {
    const input = validateOrderInput(req.body);
    const productIds = [...new Set(input.items.map((item) => item.productId))];
    const productsById = new Map(await Promise.all(productIds.map(getCatalogProduct)));
    const pricedOrder = priceOrder(input.items, productsById);
    const order = {
      id: `ord-${randomUUID()}`,
      customerName: input.customerName,
      ...pricedOrder,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Penyimpanan in-memory dan pemeriksaan stok ini untuk demo; tidak mereservasi stok.
    orders.set(order.id, order);
    return res.status(201).location(`/orders/${order.id}`).json({ data: order });
  });

  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof OrderError) return res.status(error.status).json({ error: error.message });
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Request body is too large' });
    }
    if (error.type === 'entity.parse.failed' || error instanceof URIError) {
      return res.status(400).json({ error: 'Invalid request JSON or URL' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createOrderApp };
