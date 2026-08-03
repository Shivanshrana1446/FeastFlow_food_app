import Icon from './Icon';

function getPageRange(current, total) {
  const range = [];
  const window = 1;

  for (let i = 1; i <= total; i += 1) {
    if (i === 1 || i === total || Math.abs(i - current) <= window) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }

  return range;
}

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages } = meta;
  const pages = getPageRange(page, totalPages);

  const navBtn = 'flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <nav className="flex items-center justify-center gap-1.5">
      <button className={navBtn} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <Icon name="chevronLeft" className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-ink-500">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === page ? 'bg-brand-500 text-white' : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        className={navBtn}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <Icon name="chevronRight" className="h-4 w-4" />
      </button>
    </nav>
  );
}
