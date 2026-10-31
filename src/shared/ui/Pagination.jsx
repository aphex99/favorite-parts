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
  );
};
