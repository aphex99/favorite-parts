import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL, mockRequests } from '@/shared/config';
import { server } from '@/test/server.js';
import { renderWithProviders } from '@/test/renderWithProviders.jsx';
import { SearchPage } from './SearchPage.jsx';
import { PAGE_SIZE } from '@/pages/search/config/index.js';

const makeProducts = (count, prefix = 'Manufacturer', numberPrefix = 'PART') =>
  Array.from({ length: count }, (_, index) => ({
    brand: `${prefix} ${index + 1}`,
    number: `${numberPrefix}-${index + 1}`,
    name: `Product ${index + 1}`,
    goodsID: `goods-${index + 1}`,
  }));

const respondWith = (handler) => server.use(http.get(API_BASE_URL, handler));

const searchInput = () => screen.getByRole('textbox', { name: 'Номер' });
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SearchPage', () => {
  it('shows manufacturers after the initial search succeeds', async () => {
    const requested = vi.fn();
    respondWith(({ request }) => {
      requested(new URL(request.url).searchParams);
      return HttpResponse.json({
        goods: makeProducts(1, 'Bosch', mockRequests.searchArticle.number),
      });
    });

    renderWithProviders(<SearchPage />);

    expect(await screen.findByText('Bosch 1')).toBeInTheDocument();
    expect(requested).toHaveBeenCalledTimes(1);
    const params = requested.mock.calls[0][0];
    expect(params.get('number')).toBe(mockRequests.searchArticle.number);
    expect(params.get('key')).toBe('test-api-key');
  });

  it('retries a failed offers request and displays offers after success', async () => {
    let offersShouldFail = true;
    const requested = vi.fn();
    respondWith(({ request }) => {
      const params = new URL(request.url).searchParams;
      requested(params);
      if (params.has('brand')) {
        if (offersShouldFail) {
          return HttpResponse.json({ message: 'Unavailable' }, { status: 500 });
        }
        return HttpResponse.json({
          goods: [
            {
              brand: 'Bosch',
              number: 'PART-1',
              goodsID: 'part',
              warehouses: [{ goodsID: 'stock', price: 22, stock: 4 }],
            },
          ],
        });
      }
      return HttpResponse.json({
        goods: makeProducts(1, 'Bosch', mockRequests.searchArticle.number),
      });
    });
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);
    await user.click(await screen.findByRole('button', { name: 'Bosch 1' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    offersShouldFail = false;
    await user.click(screen.getByRole('button', { name: /Повторить/ }));

    expect(
      await screen.findByRole('cell', { name: /22,00/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    const offerParams = requested.mock.calls
      .map(([params]) => params)
      .find((params) => params.has('brand'));
    expect(offerParams.get('brand')).toBe('Bosch 1');
    expect(offerParams.get('analogues')).toBe('on');
  });

  it('shows a table skeleton while the first request is pending', async () => {
    let resolveResponse;
    respondWith(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );

    renderWithProviders(<SearchPage />);

    await waitFor(() => expect(resolveResponse).toBeTypeOf('function'));
    expect(
      screen.getByRole('status', { name: 'Loading manufacturers' }),
    ).toBeInTheDocument();
    resolveResponse(HttpResponse.json({ goods: makeProducts(1) }));
    expect(await screen.findByText('Manufacturer 1')).toBeInTheDocument();
  });

  it('shows an API error without presenting results', async () => {
    respondWith(() =>
      HttpResponse.json({ message: 'Unavailable' }, { status: 500 }),
    );

    renderWithProviders(<SearchPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить данные. Попробуйте ещё раз',
    );
    expect(
      screen.getByRole('button', { name: 'Повторить' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Производители не найдены'),
    ).not.toBeInTheDocument();
  });

  it('shows a timeout message when the request times out', async () => {
    respondWith(() => new Promise(() => {}));
    const originalSetTimeout = globalThis.setTimeout;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(
      (callback, delay, ...args) => {
        if (delay === 10000) {
          return originalSetTimeout(callback, 0, ...args);
        }

        return originalSetTimeout(callback, delay, ...args);
      },
    );

    renderWithProviders(<SearchPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Время ожидания ответа истекло. Попробуйте ещё раз',
    );
  });

  it('shows the empty state when the response contains no products', async () => {
    respondWith(() => HttpResponse.json({ goods: [] }));

    renderWithProviders(<SearchPage />);

    expect(
      await screen.findByText('Производители не найдены'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('resets pagination to page one when the article number changes', async () => {
    respondWith(({ request }) => {
      const number = new URL(request.url).searchParams.get('number');
      return HttpResponse.json({
        goods:
          number === 'NEW'
            ? makeProducts(PAGE_SIZE + 1, 'New maker', 'NEW')
            : makeProducts(
                PAGE_SIZE + 1,
                'Manufacturer',
                mockRequests.searchArticle.number,
              ),
      });
    });
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);
    expect(await screen.findByText('Страница 1 из 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Следующая' }));
    expect(screen.getByText('Страница 2 из 2')).toBeInTheDocument();

    await user.clear(searchInput());
    await user.type(searchInput(), 'NEW');

    expect(await screen.findByText('New maker 1')).toBeInTheDocument();
    expect(screen.getByText('Страница 1 из 2')).toBeInTheDocument();
  });

  it('hides previous results and shows a loader while searching for a different article', async () => {
    let resolveNewResponse;
    respondWith(({ request }) => {
      const number = new URL(request.url).searchParams.get('number');
      if (number === 'NEXT') {
        return new Promise((resolve) => {
          resolveNewResponse = resolve;
        });
      }

      return HttpResponse.json({
        goods: makeProducts(
          1,
          'Previous maker',
          mockRequests.searchArticle.number,
        ),
      });
    });
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);
    expect(await screen.findByText('Previous maker 1')).toBeInTheDocument();

    await user.clear(searchInput());
    await user.type(searchInput(), 'NEXT');

    expect(
      await screen.findByRole('status', { name: 'Loading manufacturers' }),
    ).toBeInTheDocument();

    expect(screen.queryByText('Previous maker 1')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(resolveNewResponse).toBeTypeOf('function');
    });

    resolveNewResponse(
      HttpResponse.json({ goods: makeProducts(1, 'New maker', 'NEXT') }),
    );

    expect(await screen.findByText('New maker 1')).toBeInTheDocument();
    expect(screen.queryByText('Previous maker 1')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: 'Loading manufacturers' }),
    ).not.toBeInTheDocument();
  });

  it('hides previous results when a refetch fails', async () => {
    respondWith(({ request }) => {
      const number = new URL(request.url).searchParams.get('number');
      if (number === 'BROKEN') {
        return HttpResponse.json({ message: 'Unavailable' }, { status: 500 });
      }

      return HttpResponse.json({
        goods: makeProducts(
          1,
          'Previous maker',
          mockRequests.searchArticle.number,
        ),
      });
    });
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);
    expect(await screen.findByText('Previous maker 1')).toBeInTheDocument();

    await user.clear(searchInput());
    await user.type(searchInput(), 'BROKEN');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось загрузить данные. Попробуйте ещё раз',
    );

    expect(screen.queryByText('Previous maker 1')).not.toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Повторить' }),
    ).toBeInTheDocument();
  });

  it('removes old results and the empty-state message when the input is cleared', async () => {
    respondWith(() =>
      HttpResponse.json({
        goods: makeProducts(
          1,
          'Manufacturer',
          mockRequests.searchArticle.number,
        ),
      }),
    );
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);
    expect(await screen.findByText('Manufacturer 1')).toBeInTheDocument();

    await user.clear(searchInput());

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('Manufacturer 1')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Производители не найдены'),
    ).not.toBeInTheDocument();
  });

  it('sends only the final search during rapid typing', async () => {
    const requestedNumbers = [];
    respondWith(({ request }) => {
      requestedNumbers.push(new URL(request.url).searchParams.get('number'));
      return HttpResponse.json({ goods: makeProducts(1) });
    });
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);
    await user.clear(searchInput());
    await user.type(searchInput(), '   AB123   ');

    await waitFor(() => expect(requestedNumbers).toContain('AB123'));
    expect(requestedNumbers).toEqual(['AB123']);
  });
});
