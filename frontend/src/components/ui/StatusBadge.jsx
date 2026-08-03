import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from '@/utils/constants';

export default function StatusBadge({ status, className = '' }) {
  const style = ORDER_STATUS_STYLE[status] || 'bg-ink-100 text-ink-700';
  const label = ORDER_STATUS_LABEL[status] || status;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
