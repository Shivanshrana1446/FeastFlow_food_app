import { adminApi } from '@/api/adminApi';
import { useFetch } from '@/hooks/useFetch';
import Card from '@/components/ui/Card';
import StatCard from '@/components/common/StatCard';
import BarList from '@/components/common/BarList';
import { CardSkeletonGrid } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency } from '@/utils/format';
import { ROLES } from '@/utils/constants';

const ROLE_LABEL = {
  [ROLES.CUSTOMER]: 'Customers',
  [ROLES.RESTAURANT_OWNER]: 'Restaurant owners',
  [ROLES.DELIVERY_PARTNER]: 'Delivery partners',
  [ROLES.ADMIN]: 'Admins',
};

export default function AdminAnalytics() {
  const { data: stats, loading } = useFetch(() => adminApi.getDashboard(), []);

  if (loading || !stats) return <CardSkeletonGrid count={4} />;

  const avgOrderValue = stats.totalDeliveredOrders > 0 ? stats.totalRevenue / stats.totalDeliveredOrders : 0;
  const totalRestaurants = stats.restaurants.approved + stats.restaurants.pendingApproval;
  const approvalRate = totalRestaurants > 0 ? (stats.restaurants.approved / totalRestaurants) * 100 : 0;

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Platform Analytics</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon="rupee" label="Total revenue" value={formatCurrency(stats.totalRevenue)} tone="success" />
        <StatCard icon="trendingUp" label="Avg. order value" value={formatCurrency(avgOrderValue)} tone="brand" />
        <StatCard icon="percent" label="Restaurant approval rate" value={`${approvalRate.toFixed(0)}%`} tone="info" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-base font-bold text-ink-900">User composition</h2>
          <div className="mt-5">
            <BarList
              items={Object.entries(stats.usersByRole).map(([role, count]) => ({ label: ROLE_LABEL[role] || role, value: count }))}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-base font-bold text-ink-900">Restaurant approvals</h2>
          <div className="mt-5">
            <BarList
              items={[
                { label: 'Approved', value: stats.restaurants.approved },
                { label: 'Pending', value: stats.restaurants.pendingApproval },
              ]}
              barClassName="bg-info-500"
            />
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
