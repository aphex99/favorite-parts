import { describe, expect, it } from 'vitest';
import { mockRequests } from '@/shared/config/index.js';
import { getProducts } from './getProducts.js';

const product = (overrides = {}) => ({
  brand: 'ACME',
  number: '123',
  goodsID: 'goods-1',
  ...overrides,
});

describe('getProducts', () => {
  it('accepts an array of products', () => {
    expect(getProducts([product()])).toEqual([product()]);
  });

  it('accepts an object of products', () => {
    expect(getProducts({ first: product() })).toEqual([product()]);
  });

  it.each([undefined, null, 'unexpected', 42, true])(
    'returns an empty array for invalid goods input: %s',
    (goods) => {
      expect(getProducts(goods)).toEqual([]);
    },
  );

  it('excludes the product-not-found response', () => {
    expect(
      getProducts([product({ goodsID: mockRequests.productNotFound.goodsID })]),
    ).toEqual([]);
  });
});
