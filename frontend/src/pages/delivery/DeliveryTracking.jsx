import { useState } from 'react';
import { deliveryApi } from '@/api/deliveryApi';
import { useFetch } from '@/hooks/useFetch';
import { useToast, errorMessage } from '@/hooks/useToast';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import OrderTimeline from '@/components/order/OrderTimeline';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency } from '@/utils/format';
import { ORDER_STATUS } from '@/utils/constants';

const NEXT_ACTION = {
  [ORDER_STATUS.ASSIGNED]: { fn: 'pickedUp', label: 'Mark picked up' },
  [ORDER_STATUS.PICKED_UP]: { fn: 'outForDelivery', label: 'Start delivery' },
  [ORDER_STATUS.OUT_FOR_DELIVERY]: { fn: 'delivered', label: 'Mark delivered' },
};

export default function DeliveryTracking() {
  const { data: assigned, loading, refetch } = useFetch(() => deliveryApi.listAssigned({ limit: 1, sortBy: 'createdAt:asc' }), []);
  const notify = useToast();
  const [acting, setActing] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);

  const order = assigned?.[0];
  const action = order && NEXT_ACTION[order.status];

  const handleAdvance = async () => {
    setActing(true);
    try {
      await deliveryApi[action.fn](order._id);
      notify('Order updated', 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setActing(false);
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) return notify('Location is not supported on this device', 'error');
    setSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await deliveryApi.setLocation([position.coords.longitude, position.coords.latitude]);
          notify('Location updated', 'success');
        } catch (err) {
          notify(errorMessage(err), 'error');
        } finally {
          setSharingLocation(false);
        }
      },
      () => {
        notify('Could not get your location', 'error');
        setSharingLocation(false);
      }
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl">
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon="navigation"
        title="No active delivery"
        description="Accept an order from your assigned orders to start tracking a delivery."
        actionLabel="View assigned orders"
        actionTo="/delivery/assigned"
      />
    );
  }

  return (
    <PageTransition className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Delivery Tracking</h1>
        <StatusBadge status={order.status} />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-base font-bold text-ink-900">{order.restaurant?.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
              <Icon name="mapPin" className="h-4 w-4" />
              {order.restaurant?.address?.line1}, {order.restaurant?.address?.city}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleShareLocation} loading={sharingLocation}>
            <Icon name="navigation" className="h-4 w-4" />
            Share location
          </Button>
        </div>

        <div className="mt-6 rounded-xl bg-ink-50 p-4">
          <p className="text-sm font-semibold text-ink-800">Deliver to</p>
          <p className="mt-1 text-sm text-ink-600">
            {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state}{' '}
            {order.deliveryAddress?.postalCode}
          </p>
          {order.user && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-600">
              <Icon name="user" className="h-4 w-4 text-ink-500" />
              {order.user.name} {order.user.phone && `· ${order.user.phone}`}
            </p>
          )}
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-ink-800">Order total: {formatCurrency(order.pricing?.total)}</p>
          <OrderTimeline status={order.status} statusHistory={order.statusHistory} />
        </div>

        {action && (
          <Button className="mt-4 w-full" onClick={handleAdvance} loading={acting}>
            {action.label}
          </Button>
        )}
      </Card>
    </PageTransition>
  );
}
