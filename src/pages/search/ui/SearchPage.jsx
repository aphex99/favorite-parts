import { useEffect, useMemo, useState } from 'react';
import { mockRequests } from '@/shared/config';
import { debounce, paginate } from '@/shared/lib';
import { useLazySearchProductsByNumberQuery } from '@/entities/product/api';
import { PAGE_SIZE } from '../config';
import { getProducts } from '../lib';
import { TableSkeleton } from './TableSkeleton.jsx';

export function SearchPage() {
  const [number, setNumber] = useState(mockRequests.articleSearch.number);
  const [page, setPage] = useState(1);

  const [searchProducts, { data, error, isFetching, isLoading, originalArgs }] =
    useLazySearchProductsByNumberQuery();

  const normalizedNumber = number.trim();

  const validationError =
    Boolean(number) && !normalizedNumber ? 'Enter an article number.' : null;

  const isCurrentSearch =
    Boolean(normalizedNumber) && originalArgs === normalizedNumber;

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        const searchNumber = value.trim();
        if (searchNumber) searchProducts(searchNumber);
      }, 350),
    [searchProducts],
  );

  useEffect(() => {
    debouncedSearch(number);
    return () => debouncedSearch.cancel();
  }, [debouncedSearch, number]);

  const showInitialLoading = isCurrentSearch && isLoading && !data;
  const showRefetching = isCurrentSearch && isFetching && Boolean(data);
  const showError = isCurrentSearch && !isFetching && Boolean(error);

  const products =
    !normalizedNumber || showError || !data?.goods
      ? []
      : getProducts(data.goods);

  const { items: visibleProducts, pageCount } = paginate(
    products,
    page,
    PAGE_SIZE,
  );

  return (
    <main className="container py-3">
      <div className="d-flex align-items-center gap-2 mb-3">
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
      </div>

      {validationError && (
        <p id="part-number-error" role="alert">
          {validationError}
        </p>
      )}

      {showInitialLoading && <TableSkeleton />}

      {showRefetching && (
        <span
          className="spinner-border spinner-border-sm position-absolute top-50 start-50 text-secondary"
          style={{ width: '50px', height: '50px' }}
          role="status"
          aria-label="Updating manufacturers"
        />
      )}

      {showError && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between gap-3"
          role="alert"
        >
          <p>
            Не удалось загрузить список производителей. Попробуйте ещё раз или
            введите другой номер
          </p>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => searchProducts(normalizedNumber)}
          >
            Повторить
          </button>
        </div>
      )}

      {isCurrentSearch &&
        data &&
        !isFetching &&
        !showError &&
        products.length === 0 && <p>No manufacturers found</p>}

      {products.length > 0 && (
        <>
          <table className="table">
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
