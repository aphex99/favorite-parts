import { mockRequests } from '@/shared/config/index.js';

export function getProducts(goods) {
  if (!goods || typeof goods !== 'object') return [];

  const products = Array.isArray(goods) ? goods : Object.values(goods ?? {});

  return products.filter(
    (product) =>
      product.brand?.trim() &&
      product.number?.trim() &&
      product.goodsID !== mockRequests.productNotFound.goodsID,
  );
}
