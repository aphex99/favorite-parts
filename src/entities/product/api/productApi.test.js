import { beforeEach, describe, expect, it, vi } from 'vitest';

const injectEndpoints = vi.fn((options) => ({
  endpoints: options.endpoints({
    query: (definition) => definition,
  }),
}));

vi.mock('@/shared/api', () => ({
  baseApi: { injectEndpoints },
}));

vi.mock('@/shared/config', () => ({ API_KEY: 'test-key' }));

describe('product search API requests', () => {
  beforeEach(() => {
    injectEndpoints.mockClear();
  });

  it('sends number and key when searching manufacturers', async () => {
    const { productApi } = await import('./productApi.js');

    expect(productApi.endpoints.searchProductsByNumber.query('12345')).toEqual({
      url: '',
      params: { key: 'test-key', number: '12345' },
    });
  });
});
