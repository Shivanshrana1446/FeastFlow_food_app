import { describe, expect, it } from 'vitest';
import reducer, {
  addCartItem,
  clearCart,
  fetchCart,
  removeCartItem,
  resetCart,
  updateCartItem,
} from './cartSlice';

const initialState = { cart: null, status: 'idle', mutating: false, error: null };

describe('cartSlice reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('marks status as loading while fetch is pending', () => {
    const state = reducer(initialState, fetchCart.pending('req1'));
    expect(state.status).toBe('loading');
  });

  it('stores the cart on a successful fetch', () => {
    const cart = { _id: 'c1', items: [] };
    const state = reducer(initialState, fetchCart.fulfilled(cart, 'req1'));
    expect(state.status).toBe('succeeded');
    expect(state.cart).toEqual(cart);
  });

  it('records the error message when fetch fails', () => {
    const state = reducer(initialState, fetchCart.rejected(new Error('boom'), 'req1', undefined, 'Network error'));
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Network error');
  });

  it('sets mutating while an item is being added, and clears it on success', () => {
    const pendingState = reducer(initialState, addCartItem.pending('req1', { menuItem: 'm1', quantity: 1 }));
    expect(pendingState.mutating).toBe(true);

    const cart = { _id: 'c1', items: [{ _id: 'i1', quantity: 1 }] };
    const fulfilledState = reducer(pendingState, addCartItem.fulfilled(cart, 'req1', { menuItem: 'm1', quantity: 1 }));
    expect(fulfilledState.mutating).toBe(false);
    expect(fulfilledState.cart).toEqual(cart);
  });

  it('does not set mutating for the fetch thunk (only mutation thunks)', () => {
    const state = reducer(initialState, fetchCart.pending('req1'));
    expect(state.mutating).toBe(false);
  });

  it('updates the cart after updateCartItem and removeCartItem succeed', () => {
    const afterUpdate = reducer(
      initialState,
      updateCartItem.fulfilled({ _id: 'c1', items: [{ _id: 'i1', quantity: 3 }] }, 'req1', { itemId: 'i1', quantity: 3 })
    );
    expect(afterUpdate.cart.items[0].quantity).toBe(3);

    const afterRemove = reducer(afterUpdate, removeCartItem.fulfilled({ _id: 'c1', items: [] }, 'req2', 'i1'));
    expect(afterRemove.cart.items).toHaveLength(0);
  });

  it('clears the cart to null when clearCart succeeds', () => {
    const withCart = { ...initialState, cart: { _id: 'c1', items: [{ _id: 'i1' }] } };
    const state = reducer(withCart, clearCart.fulfilled(null, 'req1'));
    expect(state.cart).toBeNull();
    expect(state.mutating).toBe(false);
  });

  it('records the error and clears mutating when a mutation thunk is rejected', () => {
    const state = reducer(
      { ...initialState, mutating: true },
      addCartItem.rejected(new Error('boom'), 'req1', { menuItem: 'm1', quantity: 1 }, 'Could not add item to cart')
    );
    expect(state.mutating).toBe(false);
    expect(state.error).toBe('Could not add item to cart');
  });

  it('resets the cart via the resetCart action', () => {
    const withCart = { cart: { _id: 'c1' }, status: 'succeeded', mutating: false, error: null };
    expect(reducer(withCart, resetCart())).toEqual({ ...withCart, cart: null, status: 'idle' });
  });
});
