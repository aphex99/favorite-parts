import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/shared/api/index.js'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})
