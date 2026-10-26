import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { baseApi } from '@/shared/api';

export function renderWithProviders(ui) {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}
