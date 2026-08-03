import { memo } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import Icon from '@/components/ui/Icon';
import { formatCurrency, formatDateTime } from '@/utils/format';

function OrderCard({ order, to, footer }) {
  const itemsLabel = order.items?.map((i) => `${i.quantity}× ${i.name}`).join(', ');

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-ink-900">
            {order.restaurant?.name || 'Restaurant'}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
            <Icon name="calendar" className="h-3.5 w-3.5" />
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-ink-600">{itemsLabel}</p>

      <div className="mt-3 flex items-center justify-between">
        <p className="font-display text-base font-bold text-ink-900">{formatCurrency(order.pricing?.total)}</p>
        {to && (
          <Link to={to} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View details
          </Link>
        )}
      </div>

      {footer && <div className="mt-3 border-t border-ink-100 pt-3">{footer}</div>}
    </Card>
  );
}

export default memo(OrderCard);
