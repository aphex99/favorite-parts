import { getProducts } from '@/entities/product/lib/getProducts.js';

export function getOfferRows(goods) {
  const products = getProducts(goods);

  return products.flatMap((product) => {
    const analogues = Array.isArray(product.analogues) ? product.analogues : [];

    return [product, ...analogues].flatMap((item) => {
      const warehouses = Array.isArray(item.warehouses) ? item.warehouses : [];

      if (!warehouses.length) {
        return [{ ...item, warehouse: null }];
      }

      return warehouses.map((warehouse) => ({
        ...item,
        warehouse,
      }));
    });
  });
}
