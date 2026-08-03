import { useMemo, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import { useToast, errorMessage } from '@/hooks/useToast';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/common/PageTransition';
import { formatDate } from '@/utils/format';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Approved' },
  { value: 'false', label: 'Pending approval' },
];

export default function AdminRestaurants() {
  const { page, limit, setPage } = usePagination(10);
  const [isApproved, setIsApproved] = useState('');
  const [q, setQ] = useState('');
  const [actingId, setActingId] = useState(null);
  const notify = useToast();

  const params = useMemo(
    () => ({ page, limit, isApproved: isApproved || undefined, q: q || undefined }),
    [page, limit, isApproved, q]
  );
  const { data: restaurants, meta, loading, refetch } = useFetch(() => adminApi.listRestaurants(params), [JSON.stringify(params)]);

  const handleSetApproval = async (restaurant, approved) => {
    setActingId(restaurant._id);
    try {
      await adminApi.setRestaurantApproval(restaurant._id, approved);
      notify(approved ? 'Restaurant approved' : 'Approval revoked', 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Restaurant',
      render: (r) => (
        <div>
          <p className="font-semibold text-ink-900">{r.name}</p>
          <p className="text-xs text-ink-500">{r.address?.city}</p>
        </div>
      ),
    },
    { key: 'cuisine', header: 'Cuisine', render: (r) => r.cuisine?.join(', ') || '—' },
    { key: 'created', header: 'Created', render: (r) => formatDate(r.createdAt) },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <div className="flex flex-col gap-1">
          <Badge variant={r.isApproved ? 'success' : 'warning'}>{r.isApproved ? 'Approved' : 'Pending'}</Badge>
          <Badge variant={r.isOpen ? 'info' : 'neutral'}>{r.isOpen ? 'Open' : 'Closed'}</Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <Button
          size="sm"
          variant={r.isApproved ? 'outline' : 'primary'}
          loading={actingId === r._id}
          onClick={() => handleSetApproval(r, !r.isApproved)}
        >
          {r.isApproved ? 'Revoke approval' : 'Approve'}
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Restaurants</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <SearchBar placeholder="Search restaurants..." onSearch={(v) => { setQ(v); setPage(1); }} className="flex-1" />
        <Select
          className="!h-11 w-full sm:w-52"
          value={isApproved}
          onChange={(e) => { setIsApproved(e.target.value); setPage(1); }}
          options={STATUS_OPTIONS}
        />
      </div>

      <Table
        columns={columns}
        data={restaurants || []}
        loading={loading}
        emptyState={<EmptyState icon="store" title="No restaurants found" />}
      />

      <div className="mt-6">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
