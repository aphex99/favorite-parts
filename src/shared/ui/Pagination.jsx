export const Pagination = ({ page, setPage, pageCount }) => {
  return (
    <nav
      className="d-flex align-items-center gap-2"
      aria-label="Manufacturer list pagination"
    >
      <button
        type="button"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Предыдущая
      </button>
      <span>
        Страница {page} из {pageCount}
      </span>
      <button
        type="button"
        disabled={page === pageCount}
        onClick={() => setPage(page + 1)}
      >
        Следующая
      </button>
    </nav>
  );
};
