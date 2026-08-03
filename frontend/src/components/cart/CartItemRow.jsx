import { memo } from 'react';
import Icon from '@/components/ui/Icon';
import VegDot from '@/components/restaurant/VegDot';
import { formatCurrency } from '@/utils/format';

/** `onIncrement`/`onDecrement`/`onRemove` receive `item` back — see MenuItemCard for why. */
function CartItemRow({ item, onIncrement, onDecrement, onRemove, busy }) {
  const addOnsTotal = (item.addOns || []).reduce((sum, a) => sum + a.price, 0);
  const lineTotal = (item.price + addOnsTotal) * item.quantity;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-100 py-4 last:border-none">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <VegDot isVeg={item.isVeg ?? true} />
          <p className="truncate text-sm font-semibold text-ink-800">{item.name}</p>
        </div>
        {item.addOns?.length > 0 && (
          <p className="mt-1 text-xs text-ink-500">+ {item.addOns.map((a) => a.name).join(', ')}</p>
        )}
        <p className="mt-1 text-xs text-ink-500">{formatCurrency(item.price)} each</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          onClick={() => onRemove(item)}
          className="text-ink-300 transition-colors hover:text-danger-500"
          aria-label={`Remove ${item.name} from cart`}
        >
          <Icon name="trash" className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-ink-200 px-1">
          <button
            disabled={busy}
            onClick={() => onDecrement(item)}
            aria-label={`Decrease quantity of ${item.name}`}
            className="flex h-7 w-7 items-center justify-center text-ink-500 disabled:opacity-40"
          >
            <Icon name="minus" className="h-3.5 w-3.5" />
          </button>
          <span className="w-4 text-center text-sm font-bold text-ink-800">{item.quantity}</span>
          <button
            disabled={busy}
            onClick={() => onIncrement(item)}
            aria-label={`Increase quantity of ${item.name}`}
            className="flex h-7 w-7 items-center justify-center text-ink-500 disabled:opacity-40"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-sm font-bold text-ink-900">{formatCurrency(lineTotal)}</p>
      </div>
    </div>
  );
}

export default memo(CartItemRow);
