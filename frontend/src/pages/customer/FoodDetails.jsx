import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { menuApi } from '@/api/menuApi';
import { restaurantApi } from '@/api/restaurantApi';
import { useFetch } from '@/hooks/useFetch';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addCartItem } from '@/features/cart/cartSlice';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useToast, errorMessage } from '@/hooks/useToast';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import VegDot from '@/components/restaurant/VegDot';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency, resolveAssetUrl } from '@/utils/format';
import { ASSET_BASE_URL, ROLES } from '@/utils/constants';

export default function FoodDetails() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const notify = useToast();
  const user = useAppSelector(selectCurrentUser);
  const isCustomer = user?.role === ROLES.CUSTOMER;

  const { data: item, loading } = useFetch(() => menuApi.getById(id), [id]);
  const { data: restaurant } = useFetch(
    () => (item ? restaurantApi.getById(item.restaurant) : Promise.resolve(null)),
    [item?.restaurant]
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [adding, setAdding] = useState(false);

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) =>
      prev.some((a) => a.name === addOn.name) ? prev.filter((a) => a.name !== addOn.name) : [...prev, addOn]
    );
  };

  const total = useMemo(() => {
    if (!item) return 0;
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    return (item.price + addOnsTotal) * quantity;
  }, [item, selectedAddOns, quantity]);

  const handleAddToCart = async () => {
    if (!isCustomer) return notify('Log in as a customer to order', 'info');
    setAdding(true);
    const result = await dispatch(addCartItem({ menuItem: item._id, quantity, addOns: selectedAddOns }));
    setAdding(false);
    if (addCartItem.rejected.match(result)) {
      notify(errorMessage(result.payload, 'Could not add item'), 'error');
    } else {
      notify(`${item.name} added to cart`, 'success');
      setQuantity(1);
      setSelectedAddOns([]);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="mt-6 h-8 w-1/2" />
      </div>
    );
  }

  if (!item) {
    return <EmptyState icon="utensils" title="Item not found" className="mx-auto mt-16 max-w-lg" />;
  }

  const image = resolveAssetUrl(item.imageUrl, ASSET_BASE_URL);

  return (
    <PageTransition className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {restaurant && (
        <Link to={`/restaurants/${restaurant._id}`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600">
          <Icon name="arrowLeft" className="h-4 w-4" />
          Back to {restaurant.name}
        </Link>
      )}

      <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card">
        <div className="h-64 w-full bg-ink-100">
          {image ? (
            <img src={image} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              <Icon name="utensils" className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="p-6">
          <VegDot isVeg={item.isVeg} />
          <h1 className="mt-2 font-display text-2xl font-bold text-ink-900">{item.name}</h1>
          <p className="mt-1 text-lg font-semibold text-ink-700">{formatCurrency(item.price)}</p>
          {item.description && <p className="mt-3 text-sm text-ink-500">{item.description}</p>}

          {item.addOns?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-ink-800">Customize</h3>
              <div className="mt-3 space-y-2">
                {item.addOns.map((addOn) => (
                  <label
                    key={addOn.name}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-ink-100 px-4 py-3 hover:bg-ink-50"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium text-ink-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-brand-500"
                        checked={selectedAddOns.some((a) => a.name === addOn.name)}
                        onChange={() => toggleAddOn(addOn)}
                      />
                      {addOn.name}
                    </span>
                    <span className="text-sm text-ink-500">+{formatCurrency(addOn.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3 rounded-xl border border-ink-200 px-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center text-ink-600">
                <Icon name="minus" className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-bold text-ink-900">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="flex h-9 w-9 items-center justify-center text-ink-600">
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleAddToCart} loading={adding} disabled={!item.isAvailable}>
              Add {formatCurrency(total)}
            </Button>
          </div>
          {!item.isAvailable && <p className="mt-3 text-center text-sm font-semibold text-danger-500">Currently unavailable</p>}
        </div>
      </div>
    </PageTransition>
  );
}
