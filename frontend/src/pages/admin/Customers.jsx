import { useMemo, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import { useToast, errorMessage } from '@/hooks/useToast';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/common/PageTransition';
import { formatDate } from '@/utils/format';

export default function AdminCustomers() {
  const { page, limit, setPage } = usePagination(10);
  const [q, setQ] = useState('');
  const [actingId, setActingId] = useState(null);
  const notify = useToast();

  const params = useMemo(() => ({ page, limit, q: q || undefined }), [page, limit, q]);
  const { data: customers, meta, loading, refetch } = useFetch(() => adminApi.listCustomers(params), [JSON.stringify(params)]);

  const handleToggleStatus = async (customer) => {
    setActingId(customer._id);
    try {
      await adminApi.setUserStatus(customer._id, !customer.isActive);
      notify(customer.isActive ? 'Customer deactivated' : 'Customer activated', 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  };

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} src={c.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{c.name}</p>
            <p className="truncate text-xs text-ink-500">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (c) => c.phone || '—' },
    { key: 'addresses', header: 'Addresses', render: (c) => c.addresses?.length ?? 0 },
    { key: 'joined', header: 'Joined', render: (c) => formatDate(c.createdAt) },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <Badge variant={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Deactivated'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (c) => (
        <Button
          size="sm"
          variant={c.isActive ? 'outline' : 'primary'}
          loading={actingId === c._id}
          onClick={() => handleToggleStatus(c)}
        >
          {c.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Customers</h1>

      <div className="mb-6">
        <SearchBar placeholder="Search by name or email..." onSearch={(v) => { setQ(v); setPage(1); }} />
      </div>

      <Table
        columns={columns}
        data={customers || []}
        loading={loading}
        emptyState={<EmptyState icon="user" title="No customers found" />}
      />

      <div className="mt-6">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
