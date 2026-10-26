import { useEffect, useMemo, useState } from 'react';
import { mockRequests } from '@/shared/config';
import { debounce, formatPrice, paginate } from '@/shared/lib';
import { useLazySearchProductsByNumberQuery } from '@/entities/product/api';
import { PAGE_SIZE } from '../config';
import { getProducts } from '../lib';

export function SearchPage() {
  const [number, setNumber] = useState(mockRequests.articleSearch.number);
  const [page, setPage] = useState(1);

  const [searchProducts, { data, error, isFetching }] =
    useLazySearchProductsByNumberQuery();

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        if (value.trim()) searchProducts(value.trim());
      }, 350),
    [searchProducts],
  );

  useEffect(() => {
    debouncedSearch(number);
    return () => debouncedSearch.cancel();
  }, [debouncedSearch, number]);

  const products =
    error || !number.trim() || !data?.goods ? [] : getProducts(data.goods);

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
          onChange={(event) => {
            setNumber(event.target.value);
            setPage(1);
          }}
        />
      </form>

      {isFetching && <p>Loading manufacturers...</p>}
      {error && <p role="alert">Unable to load manufacturers</p>}

      {!isFetching && !error && number.trim() && products.length === 0 && (
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
