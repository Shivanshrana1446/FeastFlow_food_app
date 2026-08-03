import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { restaurantApi } from '@/api/restaurantApi';
import { reviewApi } from '@/api/reviewApi';
import { useFetch } from '@/hooks/useFetch';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addCartItem, fetchCart, removeCartItem, selectCart, updateCartItem } from '@/features/cart/cartSlice';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useToast, errorMessage } from '@/hooks/useToast';
import Icon from '@/components/ui/Icon';
import StarRating from '@/components/ui/StarRating';
import MenuItemCard from '@/components/restaurant/MenuItemCard';
import ReviewCard from '@/components/restaurant/ReviewCard';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton, ListSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency, resolveAssetUrl } from '@/utils/format';
import { ASSET_BASE_URL, ROLES } from '@/utils/constants';

function findCartLine(cart, menuItemId) {
  return cart?.items?.find((line) => line.menuItem === menuItemId && !line.addOns?.length);
}

export default function RestaurantDetails() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const notify = useToast();
  const user = useAppSelector(selectCurrentUser);
  const cart = useAppSelector(selectCart);
  const isCustomer = user?.role === ROLES.CUSTOMER;

  const { data: restaurant, loading: loadingRestaurant } = useFetch(() => restaurantApi.getById(id), [id]);
  const { data: menu, loading: loadingMenu } = useFetch(() => restaurantApi.getMenu(id), [id]);
  const { data: reviews, loading: loadingReviews } = useFetch(
    () => reviewApi.list({ restaurant: id, limit: 5, sortBy: 'createdAt:desc' }),
    [id]
  );

  useEffect(() => {
    if (isCustomer) dispatch(fetchCart());
  }, [isCustomer, dispatch]);

  // Stable across renders (deps never change identity) so memoized MenuItemCards
  // only re-render when their own `cartLine` actually changes, not on every cart update.
  const handleAdd = useCallback(
    async (menuItem) => {
      if (!isCustomer) return notify('Log in as a customer to order', 'info');
      const result = await dispatch(addCartItem({ menuItem: menuItem._id, quantity: 1, addOns: [] }));
      if (addCartItem.rejected.match(result)) notify(errorMessage(result.payload, 'Could not add item'), 'error');
    },
    [isCustomer, dispatch, notify]
  );

  const handleIncrement = useCallback(
    async (menuItem) => {
      const result = await dispatch(addCartItem({ menuItem: menuItem._id, quantity: 1, addOns: [] }));
      if (addCartItem.rejected.match(result)) notify(errorMessage(result.payload), 'error');
    },
    [dispatch, notify]
  );

  const handleDecrement = useCallback(
    async (line) => {
      if (line.quantity > 1) {
        await dispatch(updateCartItem({ itemId: line._id, quantity: line.quantity - 1 }));
      } else {
        await dispatch(removeCartItem(line._id));
      }
    },
    [dispatch]
  );

  if (loadingRestaurant) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="mt-6 h-8 w-1/3" />
      </div>
    );
  }

  if (!restaurant) {
    return <EmptyState icon="store" title="Restaurant not found" className="mx-auto mt-16 max-w-lg" />;
  }

  const cover = resolveAssetUrl(restaurant.coverImageUrl, ASSET_BASE_URL);

  return (
    <PageTransition>
      <div className="relative h-56 w-full overflow-hidden bg-ink-900 sm:h-72">
        {cover && <img src={cover} alt={restaurant.name} className="h-full w-full object-cover opacity-70" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-white/80">{restaurant.cuisine?.join(', ')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/90">
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              <Icon name="starFilled" className="h-4 w-4 text-warning-400" />
              {restaurant.ratingAvg?.toFixed(1) || 'New'} ({restaurant.ratingCount})
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="clock" className="h-4 w-4" />
              {restaurant.avgPreparationTimeMinutes}-{restaurant.avgPreparationTimeMinutes + 15} min
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="mapPin" className="h-4 w-4" />
              {restaurant.address?.line1}, {restaurant.address?.city}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-8 lg:col-span-2">
          {loadingMenu ? (
            <ListSkeleton count={5} />
          ) : !menu?.categories?.length ? (
            <EmptyState icon="utensils" title="Menu coming soon" description="This restaurant hasn't added any items yet." />
          ) : (
            menu.categories.map(
              (category) =>
                category.items.length > 0 && (
                  <div key={category._id}>
                    <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
                      {category.name} <span className="text-sm font-normal text-ink-500">({category.items.length})</span>
                    </h2>
                    <div className="space-y-3">
                      {category.items.map((item) => {
                        const line = findCartLine(cart, item._id);
                        return (
                          <MenuItemCard
                            key={item._id}
                            item={item}
                            cartLine={line}
                            onAdd={handleAdd}
                            onIncrement={handleIncrement}
                            onDecrement={handleDecrement}
                          />
                        );
                      })}
                    </div>
                  </div>
                )
            )
          )}
        </div>

        <div>
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-ink-900">Ratings & reviews</h3>
              <StarRating value={restaurant.ratingAvg} count={restaurant.ratingCount} />
            </div>
            <div className="mt-3">
              {loadingReviews ? (
                <ListSkeleton count={3} />
              ) : reviews?.length ? (
                reviews.map((review) => <ReviewCard key={review._id} review={review} />)
              ) : (
                <p className="py-6 text-center text-sm text-ink-500">No reviews yet — be the first!</p>
              )}
            </div>
          </div>

          {restaurant.minOrderAmount > 0 && (
            <p className="mt-4 text-center text-xs text-ink-500">
              Minimum order value: {formatCurrency(restaurant.minOrderAmount)}
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
