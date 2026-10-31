import { useState } from 'react';
import { formatPrice, getApiErrorMessage, paginate } from '@/shared/lib';
import { PAGE_SIZE } from '@/pages/search/config/index.js';
import { Pagination } from '@/shared/ui/Pagination.jsx';
import { useSearchProductsWithAnaloguesQuery } from '@/entities/product/api/index.js';
import { TableSkeleton } from '@/pages/search/ui/TableSkeleton.jsx';
import { getOfferRows } from '@/pages/search/lib/getOffersRows.jsx';

export const OffersTable = ({ product, onBack }) => {
  const [page, setPage] = useState(1);

  const { data, error, isLoading, isFetching, refetch } =
    useSearchProductsWithAnaloguesQuery({
      number: product.number,
      brand: product.brand,
    });

  const analogues = getOfferRows(data?.goods);

  const showInitialLoading = isLoading && !data;
  const showError = !isFetching && Boolean(error);

  if (showInitialLoading) return <TableSkeleton />;

  const { items: visibleAnalogues, pageCount } = paginate(
    analogues,
    page,
    PAGE_SIZE,
  );

  return (
    <>
      <button type={'button'} onClick={onBack}>
        Back
      </button>
      {analogues.length === 0 && !isFetching && !showError && (
        <p>Аналоги продукта не найдены</p>
      )}
      {showError && (
        <div
          className="alert alert-danger d-flex align-items-center justify-content-between gap-3"
          role="alert"
        >
          <p>{getApiErrorMessage(error)}</p>
          <button onClick={refetch}>Повторить запрос</button>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th scope="col">Производитель</th>
            <th scope="col">Цена</th>
            <th scope="col">Остаток на складе</th>
          </tr>
        </thead>
        <tbody>
          {visibleAnalogues.map((analogue, index) => (
            <tr
              key={
                analogue.warehouse?.goodsID ?? `${analogue.goodsID}-${index}`
              }
            >
              <td>{analogue.brand}</td>
              <td>
                {analogue.warehouse?.price &&
                  formatPrice(analogue.warehouse?.price ?? 0)}
              </td>
              <td>{analogue.warehouse?.stock ?? 'Нет в наличии'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {pageCount > 1 && (
        <Pagination page={page} setPage={setPage} pageCount={pageCount} />
      )}
    </>
  );
};
