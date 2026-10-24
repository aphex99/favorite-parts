import { API_KEY, baseApi } from '../../../shared/api/baseApi.js'

export function normalizeGoodsResponse(response) {
  const goods = response?.goods

  return {
    ...response,
    goods: Array.isArray(goods) ? goods : goods ? [goods] : [],
  }
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchProductsByNumber: build.query({
      query: (number) => ({
        url: '',
        params: { key: API_KEY, number },
      }),
      transformResponse: normalizeGoodsResponse,
    }),
    searchProductsWithAnalogues: build.query({
      query: ({ number, brand }) => ({
        url: '',
        params: { key: API_KEY, number, brand, analogues: 'on' },
      }),
      transformResponse: normalizeGoodsResponse,
    }),
  }),
})

export const {
  useSearchProductsByNumberQuery,
  useLazySearchProductsByNumberQuery,
  useSearchProductsWithAnaloguesQuery,
  useLazySearchProductsWithAnaloguesQuery,
} = productApi
