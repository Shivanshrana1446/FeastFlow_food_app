import { memo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import VegDot from './VegDot';
import { formatCurrency, resolveAssetUrl } from '@/utils/format';
import { ASSET_BASE_URL } from '@/utils/constants';

/**
 * `restaurant` is optional — pass it only in cross-restaurant contexts (e.g. food search) where
 * it isn't already obvious.
 *
 * `onAdd`/`onIncrement`/`onDecrement` receive `item`/`cartLine` back rather than being
 * pre-bound by the caller (e.g. `onClick={() => onAdd(item)}` in a parent `.map()`), so a
 * parent can pass the same stable callback to every card. Combined with `memo` below, a
 * cart update only re-renders the one card whose `cartLine` actually changed, not all of them.
 */
function MenuItemCard({ item, restaurant, cartLine, onAdd, onIncrement, onDecrement, disabled }) {
  const image = resolveAssetUrl(item.imageUrl, ASSET_BASE_URL);
  const quantityInCart = cartLine?.quantity || 0;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
      <div className="min-w-0 flex-1">
        <VegDot isVeg={item.isVeg} />
        <Link to={`/food/${item._id}`} className="mt-1.5 block truncate font-display text-sm font-bold text-ink-900 hover:text-brand-600">
          {item.name}
        </Link>
        {restaurant && (
          <Link
            to={`/restaurants/${restaurant._id}`}
            className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-500 hover:text-brand-600"
          >
            <Icon name="store" className="h-3 w-3 shrink-0" />
            {restaurant.name}
            {restaurant.address?.city ? ` · ${restaurant.address.city}` : ''}
          </Link>
        )}
        <p className="mt-0.5 text-sm font-semibold text-ink-700">{formatCurrency(item.price)}</p>
        {item.description && <p className="mt-1.5 line-clamp-2 text-xs text-ink-500">{item.description}</p>}
        {!item.isAvailable && <p className="mt-1.5 text-xs font-semibold text-danger-500">Currently unavailable</p>}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="h-20 w-20 overflow-hidden rounded-xl bg-ink-100">
          {image ? (
            <img src={image} alt={item.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              <Icon name="utensils" className="h-6 w-6" />
            </div>
          )}
        </div>

        {item.isAvailable &&
          (quantityInCart > 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-brand-500 bg-brand-50 px-1">
              <button onClick={() => onDecrement(cartLine)} aria-label={`Decrease quantity of ${item.name}`} className="flex h-7 w-7 items-center justify-center text-brand-600">
                <Icon name="minus" className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-bold text-brand-700">{quantityInCart}</span>
              <button onClick={() => onIncrement(item)} aria-label={`Increase quantity of ${item.name}`} className="flex h-7 w-7 items-center justify-center text-brand-600">
                <Icon name="plus" className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAdd(item)}
              disabled={disabled}
              aria-label={`Add ${item.name} to cart`}
              className="!h-8 !px-4 !text-xs font-bold !text-brand-600 border-brand-200 hover:!bg-brand-50"
            >
              ADD
            </Button>
          ))}
      </div>
    </div>
  );
}

export default memo(MenuItemCard);
