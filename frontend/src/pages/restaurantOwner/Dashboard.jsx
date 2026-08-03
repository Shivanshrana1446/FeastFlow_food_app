import { restaurantApi } from '@/api/restaurantApi';
import { useFetch } from '@/hooks/useFetch';
import { useOwnerRestaurant } from '@/hooks/useOwnerRestaurant';
import StatCard from '@/components/common/StatCard';
import Card from '@/components/ui/Card';
import StarRating from '@/components/ui/StarRating';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeletonGrid } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency } from '@/utils/format';
import { ORDER_STATUS_LABEL } from '@/utils/constants';

export default function OwnerDashboard() {
  const { restaurant, loading: loadingRestaurant } = useOwnerRestaurant();
  const { data: stats, loading: loadingStats } = useFetch(
    () => (restaurant ? restaurantApi.getDashboard(restaurant._id) : Promise.resolve(null)),
    [restaurant?._id]
  );

  if (loadingRestaurant) return <CardSkeletonGrid count={4} />;

  if (!restaurant) {
    return (
      <EmptyState
        icon="store"
        title="Set up your restaurant"
        description="Create your restaurant profile to start managing your menu and receiving orders."
        actionLabel="Manage restaurant"
        actionTo="/owner/restaurant"
      />
    );
  }

  return (
    <PageTransition>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-ink-500">Here's how your restaurant is performing.</p>
        </div>
        {stats && <StarRating value={stats.ratingAvg} count={stats.ratingCount} size="h-5 w-5" />}
      </div>

      {loadingStats || !stats ? (
        <CardSkeletonGrid count={4} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon="rupee" label="Total revenue" value={formatCurrency(stats.totalRevenue)} tone="success" />
            <StatCard icon="receipt" label="Delivered orders" value={stats.totalDeliveredOrders} tone="brand" />
            <StatCard icon="clock" label="Orders in progress" value={
              (stats.ordersByStatus.placed || 0) +
              (stats.ordersByStatus.confirmed || 0) +
              (stats.ordersByStatus.preparing || 0)
            } tone="warning" />
            <StatCard icon="starFilled" label="Average rating" value={stats.ratingAvg?.toFixed(1) || '—'} tone="info" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="font-display text-base font-bold text-ink-900">Orders by status</h2>
              <div className="mt-4 space-y-3">
                {Object.entries(stats.ordersByStatus).length === 0 ? (
                  <p className="text-sm text-ink-500">No orders yet.</p>
                ) : (
                  Object.entries(stats.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-ink-600">{ORDER_STATUS_LABEL[status] || status}</span>
                      <span className="font-semibold text-ink-900">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-base font-bold text-ink-900">Top selling items</h2>
              <div className="mt-4 space-y-3">
                {stats.topSellingItems.length === 0 ? (
                  <p className="text-sm text-ink-500">No sales yet.</p>
                ) : (
                  stats.topSellingItems.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="text-ink-600">{item.name}</span>
                      <span className="font-semibold text-ink-900">{item.quantitySold} sold</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </PageTransition>
  );
}
