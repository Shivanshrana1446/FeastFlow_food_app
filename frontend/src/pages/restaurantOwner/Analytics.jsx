import { restaurantApi } from '@/api/restaurantApi';
import { useFetch } from '@/hooks/useFetch';
import { useOwnerRestaurant } from '@/hooks/useOwnerRestaurant';
import Card from '@/components/ui/Card';
import BarList from '@/components/common/BarList';
import StatCard from '@/components/common/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeletonGrid } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency } from '@/utils/format';
import { ORDER_STATUS_LABEL } from '@/utils/constants';

export default function OwnerAnalytics() {
  const { restaurant, loading: loadingRestaurant } = useOwnerRestaurant();
  const { data: stats, loading } = useFetch(
    () => (restaurant ? restaurantApi.getDashboard(restaurant._id) : Promise.resolve(null)),
    [restaurant?._id]
  );

  if (loadingRestaurant || loading || !stats) {
    if (!loadingRestaurant && !restaurant) {
      return <EmptyState icon="trendingUp" title="No restaurant yet" description="Create a restaurant to see analytics." actionLabel="Manage restaurant" actionTo="/owner/restaurant" />;
    }
    return <CardSkeletonGrid count={4} />;
  }

  const avgOrderValue = stats.totalDeliveredOrders > 0 ? stats.totalRevenue / stats.totalDeliveredOrders : 0;

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Analytics</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon="rupee" label="Total revenue" value={formatCurrency(stats.totalRevenue)} tone="success" />
        <StatCard icon="receipt" label="Delivered orders" value={stats.totalDeliveredOrders} tone="brand" />
        <StatCard icon="trendingUp" label="Avg. order value" value={formatCurrency(avgOrderValue)} tone="info" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-base font-bold text-ink-900">Order status breakdown</h2>
          <div className="mt-5">
            <BarList
              items={Object.entries(stats.ordersByStatus).map(([status, count]) => ({
                label: ORDER_STATUS_LABEL[status] || status,
                value: count,
              }))}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-base font-bold text-ink-900">Top selling items</h2>
          <div className="mt-5">
            <BarList
              items={stats.topSellingItems.map((item) => ({ label: item.name, value: item.quantitySold }))}
              valueFormatter={(v) => `${v} sold`}
              barClassName="bg-success-500"
            />
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
