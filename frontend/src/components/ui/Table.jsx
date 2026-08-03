import { TableSkeleton } from './Skeleton';

/** columns: [{ key, header, render?(row), className? }] */
export default function Table({ columns, data = [], keyField = '_id', loading = false, emptyState, rowsSkeleton = 5 }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-ink-100 bg-ink-50/60">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-semibold text-ink-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {loading ? (
            <TableSkeleton rows={rowsSkeleton} columns={columns.length} />
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-6">
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[keyField]} className="transition-colors hover:bg-ink-50/60">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3.5 text-ink-700 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
