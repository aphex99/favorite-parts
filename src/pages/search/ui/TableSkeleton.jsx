const SKELETON_ROWS = Array.from({ length: 5 }, (_, index) => index);

export function TableSkeleton() {
  return (
    <div
      className="placeholder-glow"
      role="status"
      aria-label="Loading manufacturers"
    >
      <span className="visually-hidden">Loading manufacturers...</span>
      <table className="table" aria-hidden="true" aria-busy="true">
        <thead>
          <tr>
            <th scope="col">Manufacturer</th>
            <th scope="col">Part number</th>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          {SKELETON_ROWS.map((row) => (
            <tr key={row}>
              <td>
                <span className="placeholder col-8" />
              </td>
              <td>
                <span className="placeholder col-6" />
              </td>
              <td>
                <span className="placeholder col-10" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
