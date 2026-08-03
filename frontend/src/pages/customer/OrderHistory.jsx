import { useMemo, useState } from 'react';
import { orderApi } from '@/api/orderApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import OrderCard from '@/components/order/OrderCard';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import PageTransition from '@/components/common/PageTransition';
import { ORDER_STATUS_OPTIONS } from '@/utils/constants';

const STATUS_OPTIONS = [{ value: '', label: 'All orders' }, ...ORDER_STATUS_OPTIONS];

export default function OrderHistory() {
  const { page, limit, setPage } = usePagination(10);
  const [status, setStatus] = useState('');

  const params = useMemo(
    () => ({ page, limit, status: status || undefined, sortBy: 'createdAt:desc' }),
    [page, limit, status]
  );

  const { data: orders, meta, loading, error } = useFetch(() => orderApi.list(params), [JSON.stringify(params)]);

  return (
    <PageTransition className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Order history</h1>
        <Select
          className="!h-10 w-44"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : error ? (
        <EmptyState icon="alertCircle" title="Couldn't load orders" description={error} />
      ) : orders.length === 0 ? (
        <EmptyState icon="receipt" title="No orders yet" description="Your placed orders will show up here." actionLabel="Browse restaurants" actionTo="/restaurants" />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} to={`/orders/${order._id}`} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
