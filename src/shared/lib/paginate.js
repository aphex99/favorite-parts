export function paginate(items, page, pageSize = 10) {
  const pageCount = Math.ceil(items.length / pageSize);
  const safePage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const startIndex = (safePage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    pageCount,
  };
}
