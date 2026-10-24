import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const API_BASE_URL = 'http://api.favorit-parts.ru/hs/hsprice/'
export const API_KEY = '00000000-0000-0000-0000-000000000001'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  endpoints: () => ({}),
})
