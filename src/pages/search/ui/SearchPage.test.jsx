import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL, mockRequests } from '@/shared/config';
import { server } from '@/test/server.js';
import { renderWithProviders } from '@/test/renderWithProviders.jsx';
import { SearchPage } from './SearchPage.jsx';

const makeProducts = (count, prefix = 'Manufacturer') =>
  Array.from({ length: count }, (_, index) => ({
    brand: `${prefix} ${index + 1}`,
    number: `PART-${index + 1}`,
    name: `Product ${index + 1}`,
    goodsID: `goods-${index + 1}`,
  }));

const respondWith = (handler) => server.use(http.get(API_BASE_URL, handler));

const searchInput = () => screen.getByRole('textbox', { name: 'Part number' });

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SearchPage', () => {
  it('shows manufacturers after the initial search succeeds', async () => {
    const requested = vi.fn();
    respondWith(({ request }) => {
      requested(new URL(request.url).searchParams);
      return HttpResponse.json({ goods: makeProducts(1, 'Bosch') });
    });

    renderWithProviders(<SearchPage />);

    expect(await screen.findByText('Bosch 1')).toBeInTheDocument();
    expect(requested).toHaveBeenCalledTimes(1);
    const params = requested.mock.calls[0][0];
    expect(params.get('number')).toBe(mockRequests.articleSearch.number);
    expect(params.get('key')).toBe('test-api-key');
  });

  it('shows a loading message while the request is pending', async () => {
    let resolveResponse;
    respondWith(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );

    renderWithProviders(<SearchPage />);

    expect(
      await screen.findByText('Loading manufacturers...'),
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
      'Unable to load manufacturers',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No manufacturers found'),
    ).not.toBeInTheDocument();
  });

  it('shows the empty state when the response contains no products', async () => {
    respondWith(() => HttpResponse.json({ goods: [] }));

    renderWithProviders(<SearchPage />);

    expect(
      await screen.findByText('No manufacturers found'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('sends trimmed article numbers after the debounce', async () => {
    const requestedNumbers = [];
    respondWith(({ request }) => {
      requestedNumbers.push(new URL(request.url).searchParams.get('number'));
      return HttpResponse.json({ goods: makeProducts(1) });
    });
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);
    await user.clear(searchInput());
    await user.type(searchInput(), '  12345  ');

    await waitFor(() => expect(requestedNumbers).toContain('12345'));
    expect(requestedNumbers).not.toContain('  12345  ');
  });

  it('resets pagination to page one when the article number changes', async () => {
    respondWith(({ request }) => {
      const number = new URL(request.url).searchParams.get('number');
      return HttpResponse.json({
        goods:
          number === 'NEW' ? makeProducts(1, 'New maker') : makeProducts(31),
      });
    });
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);
    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();

    await user.clear(searchInput());
    await user.type(searchInput(), 'NEW');

    expect(await screen.findByText('New maker 1')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('removes old results and the empty-state message when the input is cleared', async () => {
    respondWith(() => HttpResponse.json({ goods: makeProducts(1) }));
    const user = userEvent.setup();

    renderWithProviders(<SearchPage />);
    expect(await screen.findByText('Manufacturer 1')).toBeInTheDocument();

    await user.clear(searchInput());

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('Manufacturer 1')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No manufacturers found'),
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
    await user.type(searchInput(), 'AB123');

    await waitFor(() => expect(requestedNumbers).toContain('AB123'));
    expect(requestedNumbers).toEqual(['AB123']);
  });

  it('shows the error state when the network request fails', async () => {
    respondWith(() => HttpResponse.error());

    renderWithProviders(<SearchPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load manufacturers',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No manufacturers found'),
    ).not.toBeInTheDocument();
  });
});
