import { baseApi } from '@/shared/api';
import { API_KEY } from '@/shared/config';

const validateResponse = (response, body) => {
  const isValidGoods = body?.goods !== null && typeof body?.goods === 'object';
  return response.status >= 200 && response.status < 300 && isValidGoods;
};

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchProductsByNumber: build.query({
      query: (number) => ({
        url: '',
        params: { key: API_KEY, number },
        validateStatus: validateResponse,
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
  useSearchProductsWithAnaloguesQuery,
} = productApi;
