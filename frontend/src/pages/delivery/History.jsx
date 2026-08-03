import { deliveryApi } from '@/api/deliveryApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import OrderCard from '@/components/order/OrderCard';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';

export default function DeliveryHistory() {
  const { page, limit, setPage } = usePagination(10);
  const { data: orders, meta, loading } = useFetch(() => deliveryApi.listHistory({ page, limit, sortBy: 'updatedAt:desc' }), [page, limit]);

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Delivery History</h1>

      {loading ? (
        <ListSkeleton count={5} />
      ) : !orders?.length ? (
        <EmptyState icon="list" title="No deliveries yet" description="Your completed and cancelled deliveries will appear here." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
