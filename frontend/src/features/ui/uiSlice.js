import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  toasts: [], // { id, type: 'success'|'error'|'info', message }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toastAdded: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare(message, type = 'info') {
        return { payload: { id: nanoid(), message, type } };
      },
    },
    toastRemoved(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { toastAdded, toastRemoved } = uiSlice.actions;
export default uiSlice.reducer;

export const selectToasts = (state) => state.ui.toasts;
