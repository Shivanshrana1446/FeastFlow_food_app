import { useState } from 'react';
import { deliveryApi } from '@/api/deliveryApi';
import { useFetch } from '@/hooks/useFetch';
import { useToast, errorMessage } from '@/hooks/useToast';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency } from '@/utils/format';
import { ORDER_STATUS } from '@/utils/constants';

const NEXT_ACTION = {
  [ORDER_STATUS.ASSIGNED]: { fn: 'pickedUp', label: 'Mark picked up' },
  [ORDER_STATUS.PICKED_UP]: { fn: 'outForDelivery', label: 'Start delivery' },
  [ORDER_STATUS.OUT_FOR_DELIVERY]: { fn: 'delivered', label: 'Mark delivered' },
};
const ACCEPT_ACTION = { label: 'Accept' };

function AvailabilityToggle() {
  const { data: profile, loading, refetch } = useFetch(() => deliveryApi.getProfile(), []);
  const notify = useToast();
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await deliveryApi.setAvailability(!profile.isAvailable);
      notify(profile.isAvailable ? "You're now offline" : "You're now online", 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setToggling(false);
    }
  };

  if (loading || !profile) return null;

  return (
    <Card className="mb-6 flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${profile.isAvailable ? 'bg-success-50 text-success-600' : 'bg-ink-100 text-ink-500'}`}>
          <Icon name="bike" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-900">{profile.isAvailable ? "You're online" : "You're offline"}</p>
          <p className="text-xs text-ink-500">{profile.vehicleType} · {profile.isAvailable ? 'Receiving new orders' : 'Not receiving orders'}</p>
        </div>
      </div>
      <Button size="sm" variant={profile.isAvailable ? 'outline' : 'primary'} loading={toggling} onClick={handleToggle}>
        {profile.isAvailable ? 'Go offline' : 'Go online'}
      </Button>
    </Card>
  );
}

function OrderRow({ order, action, onAct, acting }) {
  return (
    <Card className="flex items-center justify-between gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">{order.restaurant?.name}</p>
        <p className="mt-0.5 text-xs text-ink-500">
          {order.restaurant?.address?.line1}, {order.restaurant?.address?.city}
        </p>
        <p className="mt-1 text-xs text-ink-500">{order.items?.length} items · {formatCurrency(order.pricing?.total)}</p>
      </div>
      <StatusBadge status={order.status} />
      {action && (
        <Button size="sm" loading={acting} onClick={() => onAct(order)}>
          {action.label}
        </Button>
      )}
    </Card>
  );
}

export default function AssignedOrders() {
  const { data: available, loading: loadingAvailable, refetch: refetchAvailable } = useFetch(
    () => deliveryApi.listAvailable({ limit: 20 }),
    []
  );
  const { data: assigned, loading: loadingAssigned, refetch: refetchAssigned } = useFetch(
    () => deliveryApi.listAssigned({ limit: 20 }),
    []
  );
  const notify = useToast();
  const [actingId, setActingId] = useState(null);

  const refetchAll = () => {
    refetchAvailable();
    refetchAssigned();
  };

  const handleAccept = async (order) => {
    setActingId(order._id);
    try {
      await deliveryApi.accept(order._id);
      notify('Order accepted', 'success');
      refetchAll();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleAdvance = async (order) => {
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    setActingId(order._id);
    try {
      await deliveryApi[action.fn](order._id);
      notify('Order updated', 'success');
      refetchAll();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  };

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Assigned Orders</h1>
      <AvailabilityToggle />

      <section className="mb-8">
        <h2 className="mb-3 font-display text-base font-bold text-ink-900">My active deliveries</h2>
        {loadingAssigned ? (
          <ListSkeleton count={2} />
        ) : !assigned?.length ? (
          <EmptyState icon="bike" title="No active deliveries" description="Accept an order below to get started." />
        ) : (
          <div className="space-y-3">
            {assigned.map((order) => (
              <OrderRow key={order._id} order={order} action={NEXT_ACTION[order.status]} onAct={handleAdvance} acting={actingId === order._id} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-base font-bold text-ink-900">Available for pickup</h2>
        {loadingAvailable ? (
          <ListSkeleton count={3} />
        ) : !available?.length ? (
          <EmptyState icon="package" title="No orders available right now" description="Check back soon — new orders appear here as they're ready." />
        ) : (
          <div className="space-y-3">
            {available.map((order) => (
              <OrderRow key={order._id} order={order} action={ACCEPT_ACTION} onAct={handleAccept} acting={actingId === order._id} />
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
