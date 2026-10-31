import { paginate } from '@/shared/lib/index.js';
import { PAGE_SIZE } from '@/pages/search/config/index.js';
import { Pagination } from '@/shared/ui/Pagination.jsx';

export const ManufacturersTable = ({
  products,
  onSelect: setSelectedProduct,
  page,
  setPage,
}) => {
  const { items: visibleProducts, pageCount } = paginate(
    products,
    page,
    PAGE_SIZE,
  );

  if (products.length === 0) return null;

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Производитель</th>
            <th scope="col">Номер</th>
            <th scope="col">Название</th>
          </tr>
        </thead>
        <tbody>
          {visibleProducts.map((product, index) => (
            <tr key={product.goodsID}>
              <td>
                <button
                  type={'button'}
                  className={'btn btn-link p-0 text-body'}
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.brand}
                </button>
              </td>
              <td>{product.number}</td>
              <td>{product.name}</td>
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
