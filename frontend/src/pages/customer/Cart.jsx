import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  clearCart,
  fetchCart,
  removeCartItem,
  selectCart,
  selectCartMutating,
  selectCartStatus,
  updateCartItem,
} from '@/features/cart/cartSlice';
import CartItemRow from '@/components/cart/CartItemRow';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency } from '@/utils/format';

export default function Cart() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector(selectCart);
  const status = useAppSelector(selectCartStatus);
  const mutating = useAppSelector(selectCartMutating);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const subtotal = useMemo(
    () =>
      cart?.items?.reduce((sum, item) => {
        const addOnsTotal = (item.addOns || []).reduce((s, a) => s + a.price, 0);
        return sum + (item.price + addOnsTotal) * item.quantity;
      }, 0) || 0,
    [cart]
  );

  const handleIncrement = useCallback(
    (item) => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 })),
    [dispatch]
  );
  const handleDecrement = useCallback(
    (item) =>
      item.quantity > 1
        ? dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))
        : dispatch(removeCartItem(item._id)),
    [dispatch]
  );
  const handleRemove = useCallback((item) => dispatch(removeCartItem(item._id)), [dispatch]);

  if (status === 'loading' && !cart) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <ListSkeleton count={4} />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <PageTransition className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          description="Browse restaurants and add some delicious food to get started."
          actionLabel="Browse restaurants"
          actionTo="/restaurants"
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Your cart</h1>
        <button
          onClick={() => dispatch(clearCart())}
          disabled={mutating}
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-danger-500"
        >
          <Icon name="trash" className="h-4 w-4" />
          Clear cart
        </button>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-500">
          {cart.restaurant?.name || 'Restaurant'}
        </p>
        <div>
          {cart.items.map((item) => (
            <CartItemRow
              key={item._id}
              item={item}
              busy={mutating}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between text-sm text-ink-600">
          <span>Item subtotal</span>
          <span className="font-semibold text-ink-900">{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-1.5 text-xs text-ink-500">Taxes and delivery fee are calculated at checkout.</p>
        <Button className="mt-5 w-full" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </Button>
      </div>
    </PageTransition>
  );
}
