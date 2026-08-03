import { useCallback } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { toastAdded } from '@/features/ui/uiSlice';

export function useToast() {
  const dispatch = useAppDispatch();
  return useCallback((message, type = 'info') => dispatch(toastAdded(message, type)), [dispatch]);
}

/** Extracts a human-readable message from an axios error / thunk rejection. */
export function errorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || (typeof error === 'string' ? error : fallback);
}
