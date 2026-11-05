import { useState } from 'react';
import { formatPrice, getApiErrorMessage, paginate } from '@/shared/lib';
import { PAGE_SIZE } from '@/pages/search/config/index.js';
import { Pagination } from '@/shared/ui/Pagination.jsx';
import { useSearchProductsWithAnaloguesQuery } from '@/entities/product/api/index.js';
import { TableSkeleton } from '@/pages/search/ui/TableSkeleton.jsx';
import { getOfferRows } from '@/pages/search/lib/getOfferRows.js';

export const OffersTable = ({ product, onBack }) => {
  const [page, setPage] = useState(1);

  const { currentData, error, isFetching, refetch } =
    useSearchProductsWithAnaloguesQuery({
      number: product.number,
      brand: product.brand,
    });

  const offers = error ? [] : getOfferRows(currentData?.goods);

  const showInitialLoading = isFetching && !currentData;
  const showError = !isFetching && Boolean(error);

  const { items: visibleOffers, pageCount } = paginate(offers, page, PAGE_SIZE);

  return (
    <>
      <button type={'button'} onClick={onBack}>
        Back
      </button>

      {showInitialLoading ? (
        <TableSkeleton />
      ) : (
        <>
          {visibleOffers.length === 0 && !isFetching && !showError && (
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
              {visibleOffers.map((offer, index) => (
                <tr key={offer.warehouse?.goodsID ?? offer.goodsID}>
                  <td>{offer.brand}</td>
                  <td>
                    {Boolean(offer.warehouse?.price)
                      ? formatPrice(offer.warehouse?.price)
                      : '-'}
                  </td>
                  <td>{offer.warehouse?.stock ?? 'Нет в наличии'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {pageCount > 1 && (
            <Pagination page={page} setPage={setPage} pageCount={pageCount} />
          )}
        </>
      )}
    </>
  );
};
