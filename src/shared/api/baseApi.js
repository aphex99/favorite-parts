import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../config';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  paramsSerializer: (params) => new URLSearchParams(params).toString(),
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  try {
    return await rawBaseQuery(args, api, extraOptions);
  } catch {
    return {
      error: {
        status: 'CUSTOM_ERROR',
        error: 'Unexpected API request failure',
      },
    };
  }
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: () => ({}),
});
