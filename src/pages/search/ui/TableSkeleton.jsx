const SKELETON_ROWS = Array.from({ length: 5 }, (_, index) => index);

export function TableSkeleton() {
  return (
    <div
      className="placeholder-glow"
      role="status"
      aria-label="Loading manufacturers"
    >
      <table className="table" aria-hidden="true" aria-busy="true">
        <thead>
          <tr>
            <th scope="col">Производитель</th>
            <th scope="col">Номер</th>
            <th scope="col">Название</th>
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
