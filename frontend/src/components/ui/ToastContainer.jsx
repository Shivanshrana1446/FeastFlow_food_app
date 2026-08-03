import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectToasts, toastRemoved } from '@/features/ui/uiSlice';
import Icon from './Icon';

const ICONS = { success: 'checkCircle', error: 'alertCircle', info: 'info' };
const STYLES = {
  success: 'bg-success-50 text-success-700 border-success-200',
  error: 'bg-danger-50 text-danger-700 border-danger-200',
  info: 'bg-info-50 text-info-700 border-info-200',
};

function ToastItem({ toast }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(toastRemoved(toast.id)), 3800);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40 }}
      className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lifted ${
        STYLES[toast.type] || STYLES.info
      }`}
    >
      <Icon name={ICONS[toast.type] || 'info'} className="h-4.5 w-4.5 shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => dispatch(toastRemoved(toast.id))}
        aria-label="Dismiss notification"
        className="opacity-60 hover:opacity-100"
      >
        <Icon name="close" className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const toasts = useAppSelector(selectToasts);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-100 flex w-full max-w-sm flex-col gap-2.5"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
