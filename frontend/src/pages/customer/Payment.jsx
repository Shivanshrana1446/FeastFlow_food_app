import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderApi } from '@/api/orderApi';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency } from '@/utils/format';
import { PAYMENT_METHOD_LABEL } from '@/utils/constants';

export default function Payment() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [payment, setPayment] = useState(location.state?.payment || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order) return;
    orderApi
      .getById(orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) return null;

  const isPending = payment?.status === 'pending';

  return (
    <PageTransition className="mx-auto max-w-md px-4 py-14 text-center sm:px-6">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
          isPending ? 'bg-warning-50 text-warning-500' : 'bg-success-50 text-success-500'
        }`}
      >
        <Icon name={isPending ? 'clock' : 'checkCircle'} className="h-10 w-10" />
      </motion.span>

      <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">
        {isPending ? 'Order placed — pay on delivery' : 'Payment successful'}
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Your order from <span className="font-semibold text-ink-700">{order.restaurant?.name}</span> has been confirmed.
      </p>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-5 text-left shadow-card">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-500">Order ID</span>
          <span className="font-mono text-xs font-semibold text-ink-800">{order._id}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-sm">
          <span className="text-ink-500">Payment method</span>
          <span className="font-semibold text-ink-800">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-sm">
          <span className="text-ink-500">Status</span>
          <Badge variant={isPending ? 'warning' : 'success'}>{payment?.status || 'paid'}</Badge>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-base font-bold text-ink-900">
          <span>Total paid</span>
          <span>{formatCurrency(order.pricing?.total)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" className="flex-1" to="/restaurants">
          Order more food
        </Button>
        <Button className="flex-1" to={`/orders/${order._id}`}>
          Track order
        </Button>
      </div>
    </PageTransition>
  );
}
