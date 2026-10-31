import { useEffect, useMemo, useState } from 'react';
import { mockRequests } from '@/shared/config';
import { debounce, getApiErrorMessage } from '@/shared/lib';
import { useLazySearchProductsByNumberQuery } from '@/entities/product/api';
import { TableSkeleton } from './TableSkeleton.jsx';
import { ManufacturersTable } from '@/pages/search/ui/ManufacturersTable.jsx';
import { OffersTable } from '@/pages/search/ui/OffersTable.jsx';
import { CONFIG_ERRORS } from '@/entities/product/config/constants.js';
import { getProducts } from '@/entities/product/lib/getProducts.js';

export function SearchPage() {
  const [number, setNumber] = useState(mockRequests.articleSearch.number);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);

  const [searchProducts, { currentData, error, isFetching, originalArgs }] =
    useLazySearchProductsByNumberQuery();

  const normalizedNumber = number.trim();

  const validationError =
    Boolean(number) && !normalizedNumber ? 'Введите артикул' : null;

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

  const showSkeleton =
    Boolean(normalizedNumber) && (!isCurrentSearch || isFetching);

  const showError = isCurrentSearch && !isFetching && Boolean(error);
  const isRetryableError = !CONFIG_ERRORS.includes(error?.data?.error);

  const onChangeInput = (event) => {
    setNumber(event.target.value);
    setPage(1);
    setSelectedProduct(null);
  };

  const products =
    !isCurrentSearch || showError || !currentData?.goods
      ? []
      : getProducts(currentData.goods);

  return (
    <main className="container py-3">
      <div className="d-flex align-items-center gap-2 mb-3">
        <label htmlFor="part-number">Номер</label>
        <input
          id="part-number"
          name="number"
          type="text"
          value={number}
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? 'part-number-error' : undefined}
          onChange={onChangeInput}
        />
      </div>

      {validationError && (
        <p id="part-number-error" role="alert" className={'text-danger'}>
          {validationError}
        </p>
      )}

      {showSkeleton && <TableSkeleton />}

      {showError && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between gap-3"
          role="alert"
        >
          <p>{getApiErrorMessage(error)}</p>
          {isRetryableError && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => searchProducts(normalizedNumber)}
            >
              Повторить
            </button>
          )}
        </div>
      )}

      {isCurrentSearch &&
        currentData &&
        !isFetching &&
        !showError &&
        !showSkeleton &&
        products.length === 0 && <p>Производители не найдены</p>}

      {!showError && selectedProduct && (
        <OffersTable
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
        />
      )}

      {!selectedProduct && isCurrentSearch && !showSkeleton && !showError && (
        <ManufacturersTable
          products={products}
          onSelect={setSelectedProduct}
          page={page}
          setPage={setPage}
        />
      )}
    </main>
  );
}
