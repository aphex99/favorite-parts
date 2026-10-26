import { useEffect, useMemo, useState } from 'react';
import { mockRequests } from '@/shared/config';
import { debounce, paginate } from '@/shared/lib';
import { useLazySearchProductsByNumberQuery } from '@/entities/product/api';
import { PAGE_SIZE } from '../config';
import { getProducts } from '../lib';

export function SearchPage() {
  const [number, setNumber] = useState(mockRequests.articleSearch.number);
  const [page, setPage] = useState(1);
  const [lastSearchedNumber, setLastSearchedNumber] = useState('');

  const [searchProducts, { currentData, error, isFetching }] =
    useLazySearchProductsByNumberQuery();

  const normalizedNumber = number.trim();
  const validationError =
    number.length > 0 && !normalizedNumber
      ? 'Enter an article number.'
      : null;
  const isCurrentSearch =
    normalizedNumber.length > 0 && lastSearchedNumber === normalizedNumber;

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        const searchNumber = value.trim();
        if (!searchNumber) return;

        setLastSearchedNumber(searchNumber);
        searchProducts(searchNumber);
      }, 350),
    [searchProducts],
  );

  useEffect(() => {
    debouncedSearch(number);
    return () => debouncedSearch.cancel();
  }, [debouncedSearch, number]);

  const showLoading = isCurrentSearch && isFetching;
  const showError = isCurrentSearch && !isFetching && Boolean(error);
  const products =
    !isCurrentSearch || isFetching || error || !currentData?.goods
      ? []
      : getProducts(currentData.goods);

  const { items: visibleProducts, pageCount } = paginate(
    products,
    page,
    PAGE_SIZE,
  );

  return (
    <main className="container py-3">
      <form className="d-flex align-items-center gap-2 mb-3">
        <label htmlFor="part-number">Part number</label>
        <input
          id="part-number"
          name="number"
          type="text"
          value={number}
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? 'part-number-error' : undefined}
          onChange={(event) => {
            setNumber(event.target.value);
            setPage(1);
          }}
        />
      </form>

      {validationError && (
        <p id="part-number-error" role="alert">
          {validationError}
        </p>
      )}

      {showLoading && <p>Loading manufacturers...</p>}
      {showError && (
        <div role="alert">
          <p>Unable to load manufacturers. Please try again.</p>
          <button
            type="button"
            onClick={() => {
              debouncedSearch.cancel();
              const searchNumber = number.trim();
              if (!searchNumber) return;

              setLastSearchedNumber(searchNumber);
              searchProducts(searchNumber);
            }}
          >
            Retry
          </button>
        </div>
      )}

      {isCurrentSearch && !showLoading && !showError && products.length === 0 && (
        <p>No manufacturers found</p>
      )}

      {products.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th scope="col">Manufacturer</th>
                <th scope="col">Part number</th>
                <th scope="col">Name</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr
                  key={`${product.brand ?? 'brand'}-${product.number ?? 'number'}`}
                  onClick={() => {}}
                >
                  <td>{product.brand}</td>
                  <td>{product.number}</td>
                  <td>{product.name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {pageCount > 1 && (
            <nav
              className="d-flex align-items-center gap-2"
              aria-label="Manufacturer list pagination"
            >
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
