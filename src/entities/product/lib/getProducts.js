import { mockRequests } from '@/shared/config/index.js';

export function getProducts(goods) {
  if (!goods || typeof goods !== 'object') return [];

  const products = Array.isArray(goods) ? goods : Object.values(goods ?? {});

  return products.filter(
    (product) =>
      product &&
      typeof product === 'object' &&
      !Array.isArray(product) &&
      typeof product.brand === 'string' &&
      product.brand.trim() &&
      typeof product.number === 'string' &&
      product.number.trim() &&
      product.goodsID !== mockRequests.productNotFound.goodsID,
  );
}
