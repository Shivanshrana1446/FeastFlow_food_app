import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderApi } from '@/api/orderApi';
import { reviewApi } from '@/api/reviewApi';
import { useFetch } from '@/hooks/useFetch';
import { useToast, errorMessage } from '@/hooks/useToast';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import StarRating from '@/components/ui/StarRating';
import StatusBadge from '@/components/ui/StatusBadge';
import OrderTimeline from '@/components/order/OrderTimeline';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS, TERMINAL_ORDER_STATUSES } from '@/utils/constants';

function ReviewForm({ orderId, onSubmitted }) {
  const notify = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await reviewApi.create({ order: orderId, rating, comment: comment || undefined });
      notify('Thanks for your review!', 'success');
      onSubmitted();
    } catch (err) {
      notify(errorMessage(err, 'Could not submit review'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mt-6 p-5">
      <h3 className="font-display text-base font-bold text-ink-900">Rate your order</h3>
      <div className="mt-3">
        <StarRating value={rating} onChange={setRating} size="h-7 w-7" />
      </div>
      <TextArea
        className="mt-3"
        placeholder="How was the food and delivery experience?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button size="sm" className="mt-3" onClick={handleSubmit} loading={submitting}>
        Submit review
      </Button>
    </Card>
  );
}

export default function OrderTracking() {
  const { id } = useParams();
  const [reviewed, setReviewed] = useState(false);
  const { data: order, loading, refetch } = useFetch(() => orderApi.getById(id), [id]);

  const isTerminal = order && TERMINAL_ORDER_STATUSES.includes(order.status);

  useEffect(() => {
    if (isTerminal) return undefined;
    const interval = setInterval(refetch, 15000);
    return () => clearInterval(interval);
  }, [isTerminal, refetch]);

  if (loading && !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return <EmptyState icon="receipt" title="Order not found" className="mx-auto mt-16 max-w-lg" />;
  }

  return (
    <PageTransition className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{order.restaurant?.name}</h1>
          <p className="mt-1 text-sm text-ink-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-5 font-display text-base font-bold text-ink-900">Order status</h2>
          <OrderTimeline status={order.status} statusHistory={order.statusHistory} />
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-display text-sm font-bold text-ink-900">Delivery address</h3>
            <p className="mt-2 flex items-start gap-2 text-sm text-ink-600">
              <Icon name="mapPin" className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
              {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state}{' '}
              {order.deliveryAddress?.postalCode}
            </p>
            {order.deliveryPartner && (
              <>
                <h3 className="mt-4 font-display text-sm font-bold text-ink-900">Delivery partner</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-ink-600">
                  <Icon name="bike" className="h-4 w-4 text-ink-500" />
                  {order.deliveryPartner.name}
                  {order.deliveryPartner.phone && ` · ${order.deliveryPartner.phone}`}
                </p>
              </>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-sm font-bold text-ink-900">Order summary</h3>
            <div className="mt-3 space-y-1.5 text-sm text-ink-600">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-ink-100 pt-3 text-sm text-ink-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.pricing?.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.pricing?.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>{formatCurrency(order.pricing?.deliveryFee)}</span>
              </div>
            </div>
            <div className="mt-2 flex justify-between border-t border-ink-100 pt-2 text-sm font-bold text-ink-900">
              <span>Total</span>
              <span>{formatCurrency(order.pricing?.total)}</span>
            </div>
          </Card>
        </div>
      </div>

      {order.status === ORDER_STATUS.DELIVERED && !reviewed && (
        <ReviewForm orderId={order._id} onSubmitted={() => setReviewed(true)} />
      )}
    </PageTransition>
  );
}
