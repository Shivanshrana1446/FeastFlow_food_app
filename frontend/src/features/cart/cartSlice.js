import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '@/api/cartApi';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    return await cartApi.getCart();
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message);
  }
});

export const addCartItem = createAsyncThunk('cart/addItem', async (payload, { rejectWithValue }) => {
  try {
    return await cartApi.addItem(payload);
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Could not add item to cart');
  }
});

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return await cartApi.updateItem(itemId, { quantity });
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

export const removeCartItem = createAsyncThunk('cart/removeItem', async (itemId, { rejectWithValue }) => {
  try {
    return await cartApi.removeItem(itemId);
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message);
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await cartApi.clearCart();
    return null;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message);
  }
});

const initialState = {
  cart: null,
  status: 'idle',
  mutating: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart(state) {
      state.cart = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.mutating = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.mutating = false;
        state.cart = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.mutating = false;
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.mutating = false;
        state.cart = null;
      })
      // addMatcher must come after every addCase in the chain (RTK requirement).
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/pending') && !action.type.includes('fetch'),
        (state) => {
          state.mutating = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected') && !action.type.includes('fetch'),
        (state, action) => {
          state.mutating = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCart = (state) => state.cart.cart;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartMutating = (state) => state.cart.mutating;
export const selectCartItemCount = (state) =>
  state.cart.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
