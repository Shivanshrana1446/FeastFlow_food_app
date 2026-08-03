import { adminApi } from '@/api/adminApi';
import { useFetch } from '@/hooks/useFetch';
import StatCard from '@/components/common/StatCard';
import Card from '@/components/ui/Card';
import BarList from '@/components/common/BarList';
import { CardSkeletonGrid } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency } from '@/utils/format';
import { ORDER_STATUS_LABEL, ROLES } from '@/utils/constants';

const ROLE_LABEL = {
  [ROLES.CUSTOMER]: 'Customers',
  [ROLES.RESTAURANT_OWNER]: 'Restaurant owners',
  [ROLES.DELIVERY_PARTNER]: 'Delivery partners',
  [ROLES.ADMIN]: 'Admins',
};

export default function AdminDashboard() {
  const { data: stats, loading } = useFetch(() => adminApi.getDashboard(), []);

  if (loading || !stats) return <CardSkeletonGrid count={4} />;

  const totalUsers = Object.values(stats.usersByRole).reduce((a, b) => a + b, 0);

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Platform Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="users" label="Total users" value={totalUsers} tone="brand" />
        <StatCard icon="store" label="Approved restaurants" value={stats.restaurants.approved} tone="success" />
        <StatCard icon="clock" label="Pending approval" value={stats.restaurants.pendingApproval} tone="warning" />
        <StatCard icon="rupee" label="Total revenue" value={formatCurrency(stats.totalRevenue)} tone="info" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-base font-bold text-ink-900">Users by role</h2>
          <div className="mt-5">
            <BarList
              items={Object.entries(stats.usersByRole).map(([role, count]) => ({ label: ROLE_LABEL[role] || role, value: count }))}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-base font-bold text-ink-900">Orders by status</h2>
          <div className="mt-5">
            <BarList
              items={Object.entries(stats.ordersByStatus).map(([status, count]) => ({
                label: ORDER_STATUS_LABEL[status] || status,
                value: count,
              }))}
              barClassName="bg-success-500"
            />
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
