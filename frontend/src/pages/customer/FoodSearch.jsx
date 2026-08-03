import { useCallback, useEffect, useMemo, useState } from 'react';
import { menuApi } from '@/api/menuApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addCartItem, fetchCart, removeCartItem, selectCart, updateCartItem } from '@/features/cart/cartSlice';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useToast, errorMessage } from '@/hooks/useToast';
import MenuItemCard from '@/components/restaurant/MenuItemCard';
import SearchBar from '@/components/ui/SearchBar';
import FilterPanel from '@/components/ui/FilterPanel';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { ROLES } from '@/utils/constants';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price:asc', label: 'Price: Low to high' },
  { value: 'price:desc', label: 'Price: High to low' },
  { value: 'name:asc', label: 'Name: A to Z' },
];

function findCartLine(cart, menuItemId) {
  return cart?.items?.find((line) => line.menuItem === menuItemId && !line.addOns?.length);
}

export default function FoodSearch() {
  const dispatch = useAppDispatch();
  const notify = useToast();
  const user = useAppSelector(selectCurrentUser);
  const cart = useAppSelector(selectCart);
  const isCustomer = user?.role === ROLES.CUSTOMER;

  const { page, limit, setPage } = usePagination(12);
  const [q, setQ] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('');

  const params = useMemo(
    () => ({ page, limit, q: q || undefined, isVeg: vegOnly || undefined, sortBy: sortBy || undefined }),
    [page, limit, q, vegOnly, sortBy]
  );

  const { data: items, meta, loading, error } = useFetch(() => menuApi.list(params), [JSON.stringify(params)]);

  useEffect(() => {
    if (isCustomer) dispatch(fetchCart());
  }, [isCustomer, dispatch]);

  const handleAdd = useCallback(
    async (item) => {
      if (!isCustomer) return notify('Log in as a customer to order', 'info');
      const result = await dispatch(addCartItem({ menuItem: item._id, quantity: 1, addOns: [] }));
      if (addCartItem.rejected.match(result)) notify(errorMessage(result.payload, 'Could not add item'), 'error');
    },
    [isCustomer, dispatch, notify]
  );

  const handleIncrement = useCallback(
    async (item) => {
      const result = await dispatch(addCartItem({ menuItem: item._id, quantity: 1, addOns: [] }));
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

  return (
    <PageTransition className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Search food</h1>
        <p className="mt-1 text-sm text-ink-500">Find dishes across every restaurant on FeastFlow</p>
      </div>

      <SearchBar
        placeholder="Search for a dish (e.g. 'paneer tikka', 'margherita')..."
        onSearch={(val) => {
          setQ(val);
          setPage(1);
        }}
        className="mb-6"
      />

      <FilterPanel className="mb-6">
        <Select
          className="!h-10 min-w-[190px]"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          options={SORT_OPTIONS}
        />
        <button
          onClick={() => {
            setVegOnly((v) => !v);
            setPage(1);
          }}
          className={`flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${
            vegOnly ? 'border-success-500 bg-success-50 text-success-700' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
          }`}
        >
          Veg only
        </button>
      </FilterPanel>

      {loading ? (
        <ListSkeleton count={6} />
      ) : error ? (
        <EmptyState icon="alertCircle" title="Couldn't load results" description={error} />
      ) : !items?.length ? (
        <EmptyState icon="search" title="No dishes found" description="Try a different search term or clear your filters." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const line = findCartLine(cart, item._id);
            return (
              <MenuItemCard
                key={item._id}
                item={item}
                restaurant={item.restaurant}
                cartLine={line}
                onAdd={handleAdd}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
