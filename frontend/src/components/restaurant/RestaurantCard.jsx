import { memo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import Badge from '@/components/ui/Badge';
import { resolveAssetUrl } from '@/utils/format';
import { ASSET_BASE_URL } from '@/utils/constants';

function RestaurantCard({ restaurant }) {
  const cover = resolveAssetUrl(restaurant.coverImageUrl || restaurant.logoUrl, ASSET_BASE_URL);

  return (
    <Link
      to={`/restaurants/${restaurant._id}`}
      className="group block overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted"
    >
      <div className="relative h-40 w-full overflow-hidden bg-ink-100">
        {cover ? (
          <img
            src={cover}
            alt={restaurant.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <Icon name="store" className="h-10 w-10" />
          </div>
        )}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-800">Closed now</span>
          </div>
        )}
        {restaurant.ratingCount > 0 && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-ink-800 shadow-soft">
            <Icon name="starFilled" className="h-3.5 w-3.5 text-warning-500" />
            {restaurant.ratingAvg.toFixed(1)}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate font-display text-base font-bold text-ink-900">{restaurant.name}</h3>
        <p className="mt-1 truncate text-sm text-ink-500">{restaurant.cuisine?.join(', ') || 'Multi-cuisine'}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
          <span className="flex items-center gap-1">
            <Icon name="clock" className="h-3.5 w-3.5" />
            {restaurant.avgPreparationTimeMinutes || 30}-{(restaurant.avgPreparationTimeMinutes || 30) + 15} min
          </span>
          <span className="flex items-center gap-1">
            <Icon name="mapPin" className="h-3.5 w-3.5" />
            {restaurant.address?.city}
          </span>
        </div>
        {restaurant.minOrderAmount > 0 && (
          <Badge variant="neutral" className="mt-3">
            Min order ₹{restaurant.minOrderAmount}
          </Badge>
        )}
      </div>
    </Link>
  );
}

export default memo(RestaurantCard);
