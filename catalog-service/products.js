'use strict';

// Harga menggunakan rupiah bulat; data ini hanya fixture untuk praktikum.
const products = Object.freeze([
  Object.freeze({
    id: 'prod-001',
    name: 'Kopi Arabika Gayo',
    category: 'kuliner',
    price: 85000,
    stock: 40,
    seller: 'Koperasi Kopi Gayo',
  }),
  Object.freeze({
    id: 'prod-002',
    name: 'Tas Anyaman Pandan',
    category: 'kerajinan',
    price: 120000,
    stock: 15,
    seller: 'Rumah Anyaman Nusantara',
  }),
  Object.freeze({
    id: 'prod-003',
    name: 'Kaos Batik UMKM',
    category: 'fashion',
    price: 95000,
    stock: 30,
    seller: 'Batik Lokal Mandiri',
  }),
]);

function findProducts({ category, search } = {}) {
  const normalizedCategory = category?.trim().toLowerCase();
  const normalizedSearch = search?.trim().toLowerCase();

  return products.filter((product) => (
    (!normalizedCategory || product.category.toLowerCase() === normalizedCategory)
    && (!normalizedSearch || product.name.toLowerCase().includes(normalizedSearch))
  ));
}

function findProduct(id) {
  return products.find((product) => product.id === id) || null;
}

module.exports = { products, findProducts, findProduct };
