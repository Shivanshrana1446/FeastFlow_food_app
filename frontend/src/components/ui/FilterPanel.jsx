export default function FilterPanel({ children, className = '' }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3.5 shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}
