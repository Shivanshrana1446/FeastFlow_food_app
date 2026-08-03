import { useMemo, useState } from 'react';
import { orderApi } from '@/api/orderApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import { useToast, errorMessage } from '@/hooks/useToast';
import Table from '@/components/ui/Table';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/common/PageTransition';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS, ORDER_STATUS_OPTIONS } from '@/utils/constants';

const NEXT_STATUS = {
  [ORDER_STATUS.PLACED]: { status: ORDER_STATUS.CONFIRMED, label: 'Confirm' },
  [ORDER_STATUS.CONFIRMED]: { status: ORDER_STATUS.PREPARING, label: 'Start preparing' },
  [ORDER_STATUS.PREPARING]: { status: ORDER_STATUS.READY_FOR_PICKUP, label: 'Mark ready' },
};
const CANCELLABLE = [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING];

const STATUS_OPTIONS = [{ value: '', label: 'All statuses' }, ...ORDER_STATUS_OPTIONS];

export default function OwnerOrders() {
  const { page, limit, setPage } = usePagination(10);
  const [status, setStatus] = useState('');
  const [actingId, setActingId] = useState(null);
  const notify = useToast();

  const params = useMemo(
    () => ({ page, limit, status: status || undefined, sortBy: 'createdAt:desc' }),
    [page, limit, status]
  );
  const { data: orders, meta, loading, refetch } = useFetch(() => orderApi.list(params), [JSON.stringify(params)]);

  const handleTransition = async (orderId, nextStatus) => {
    setActingId(orderId);
    try {
      await orderApi.updateStatus(orderId, { status: nextStatus });
      notify('Order updated', 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  };

  const columns = [
    { key: 'id', header: 'Order', render: (o) => <span className="font-mono text-xs">{o._id.slice(-8)}</span> },
    { key: 'customer', header: 'Customer', render: (o) => o.user?.name || '—' },
    { key: 'items', header: 'Items', render: (o) => `${o.items.length} item${o.items.length > 1 ? 's' : ''}` },
    { key: 'total', header: 'Total', render: (o) => formatCurrency(o.pricing?.total) },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
    { key: 'placedAt', header: 'Placed', render: (o) => formatDateTime(o.createdAt) },
    {
      key: 'actions',
      header: '',
      render: (o) => (
        <div className="flex justify-end gap-2">
          {NEXT_STATUS[o.status] && (
            <Button
              size="sm"
              variant="outline"
              loading={actingId === o._id}
              onClick={() => handleTransition(o._id, NEXT_STATUS[o.status].status)}
            >
              {NEXT_STATUS[o.status].label}
            </Button>
          )}
          {CANCELLABLE.includes(o.status) && (
            <Button size="sm" variant="ghost" className="!text-danger-500" onClick={() => handleTransition(o._id, ORDER_STATUS.CANCELLED)}>
              Cancel
            </Button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <PageTransition>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Orders</h1>
        <Select
          className="!h-10 w-48"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
        />
      </div>

      <Table
        columns={columns}
        data={orders || []}
        loading={loading}
        emptyState={<EmptyState icon="receipt" title="No orders yet" description="Orders placed at your restaurant will show up here." />}
      />

      <div className="mt-6">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
