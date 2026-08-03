import { useMemo, useState } from 'react';
import { orderApi } from '@/api/orderApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import { useToast, errorMessage } from '@/hooks/useToast';
import Table from '@/components/ui/Table';
import StatusBadge from '@/components/ui/StatusBadge';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS_OPTIONS } from '@/utils/constants';

const STATUS_FILTER_OPTIONS = [{ value: '', label: 'All statuses' }, ...ORDER_STATUS_OPTIONS];
const STATUS_ACTION_OPTIONS = [{ value: '', label: 'Change status...' }, ...ORDER_STATUS_OPTIONS];

export default function AdminOrders() {
  const { page, limit, setPage } = usePagination(10);
  const [status, setStatus] = useState('');
  const [actingId, setActingId] = useState(null);
  const notify = useToast();

  const params = useMemo(
    () => ({ page, limit, status: status || undefined, sortBy: 'createdAt:desc' }),
    [page, limit, status]
  );
  const { data: orders, meta, loading, refetch } = useFetch(() => orderApi.list(params), [JSON.stringify(params)]);

  const handleChangeStatus = async (orderId, nextStatus) => {
    if (!nextStatus) return;
    setActingId(orderId);
    try {
      await orderApi.updateStatus(orderId, { status: nextStatus });
      notify('Order status updated', 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  };

  const columns = [
    { key: 'id', header: 'Order', render: (o) => <span className="font-mono text-xs">{o._id.slice(-8)}</span> },
    { key: 'restaurant', header: 'Restaurant', render: (o) => o.restaurant?.name || '—' },
    { key: 'customer', header: 'Customer', render: (o) => o.user?.name || '—' },
    { key: 'total', header: 'Total', render: (o) => formatCurrency(o.pricing?.total) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'placedAt', header: 'Placed', render: (o) => formatDateTime(o.createdAt) },
    {
      key: 'actions',
      header: 'Override status',
      className: 'text-right',
      render: (o) => (
        <Select
          className="!h-9 w-44"
          value=""
          disabled={actingId === o._id}
          onChange={(e) => handleChangeStatus(o._id, e.target.value)}
          options={STATUS_ACTION_OPTIONS.filter((opt) => opt.value !== o.status)}
        />
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">All Orders</h1>
        <Select
          className="!h-10 w-48"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={STATUS_FILTER_OPTIONS}
        />
      </div>

      <Table
        columns={columns}
        data={orders || []}
        loading={loading}
        emptyState={<EmptyState icon="receipt" title="No orders found" />}
      />

      <div className="mt-6">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
