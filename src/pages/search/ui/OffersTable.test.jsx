import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@/shared/config';
import { server } from '@/test/server.js';
import { renderWithProviders } from '@/test/renderWithProviders.jsx';
import { OffersTable } from './OffersTable.jsx';
import { PAGE_SIZE } from '@/pages/search/config/index.js';

afterEach(cleanup);

const product = { brand: 'Acme', number: '123' };
const offer = (index, stock = index) => ({
  brand: `Brand ${index}`,
  number: `PART-${index}`,
  goodsID: `goods-${index}`,
  warehouses: [{ goodsID: `warehouse-${index}`, price: index, stock }],
});
const respondWith = (goods) =>
  server.use(http.get(API_BASE_URL, () => HttpResponse.json({ goods })));

describe('OffersTable', () => {
  it('displays stock zero correctly', async () => {
    respondWith([offer(1, 0)]);
    renderWithProviders(<OffersTable product={product} onBack={() => {}} />);

    expect(await screen.findByRole('cell', { name: '0' })).toBeInTheDocument();
  });

  it('paginates offers when there is one more than the page size', async () => {
    respondWith(
      Array.from({ length: PAGE_SIZE + 1 }, (_, index) => offer(index + 1)),
    );
    renderWithProviders(<OffersTable product={product} onBack={() => {}} />);

    expect(await screen.findByText('Страница 1 из 2')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(PAGE_SIZE + 1);
  });
});
