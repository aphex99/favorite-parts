import { baseApi } from '@/shared/api';
import { API_KEY } from '@/shared/config';

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchProductsByNumber: build.query({
      query: (number) => ({
        url: '',
        params: { key: API_KEY, number },
      }),
    }),
    searchProductsWithAnalogues: build.query({
      query: ({ number, brand }) => ({
        url: '',
        params: { key: API_KEY, number, brand, analogues: 'on' },
      }),
    }),
  }),
});

export const {
  useLazySearchProductsByNumberQuery,
  useLazySearchProductsWithAnaloguesQuery,
} = productApi;
