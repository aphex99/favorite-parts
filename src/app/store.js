import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../shared/api/baseApi.js'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})
