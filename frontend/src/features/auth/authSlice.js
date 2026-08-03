import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/api/authApi';
import { setAccessToken, clearAccessToken } from '@/api/tokenManager';

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    const { accessToken } = await authApi.refreshToken();
    setAccessToken(accessToken);
    const user = await authApi.getMe();
    return user;
  } catch (error) {
    clearAccessToken();
    return rejectWithValue(error?.response?.data?.message);
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const { user, accessToken } = await authApi.login(payload);
    setAccessToken(accessToken);
    return user;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Unable to log in');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { user, accessToken } = await authApi.register(payload);
    setAccessToken(accessToken);
    return user;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Unable to create account');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    clearAccessToken();
  }
});

const initialState = {
  user: null,
  status: 'idle', // idle | loading | succeeded | failed
  authChecked: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateCurrentUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authChecked = true;
        state.user = action.payload;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'idle';
        state.authChecked = true;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authChecked = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authChecked = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { updateCurrentUser } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthChecked = (state) => state.auth.authChecked;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
