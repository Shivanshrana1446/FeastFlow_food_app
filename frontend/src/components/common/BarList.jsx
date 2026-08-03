/** items: [{ label, value }] — hand-rolled horizontal bar chart, no charting library. */
export default function BarList({ items, valueFormatter = (v) => v, barClassName = 'bg-brand-500' }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  if (items.length === 0) {
    return <p className="text-sm text-ink-500">No data yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-ink-600">{item.label}</span>
            <span className="font-semibold text-ink-900">{valueFormatter(item.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className={`h-full rounded-full ${barClassName} transition-all duration-500`}
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
