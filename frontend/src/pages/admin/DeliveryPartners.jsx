import { useState } from 'react';
import { adminApi } from '@/api/adminApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import { useToast, errorMessage } from '@/hooks/useToast';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import StarRating from '@/components/ui/StarRating';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/common/PageTransition';

export default function AdminDeliveryPartners() {
  const { page, limit, setPage } = usePagination(10);
  const [actingId, setActingId] = useState(null);
  const notify = useToast();

  const { data: partners, meta, loading, refetch } = useFetch(() => adminApi.listDeliveryPartners({ page, limit }), [page, limit]);

  const handleToggleStatus = async (profile) => {
    setActingId(profile._id);
    try {
      await adminApi.setUserStatus(profile.user._id, !profile.user.isActive);
      notify(profile.user.isActive ? 'Delivery partner deactivated' : 'Delivery partner activated', 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  };

  const columns = [
    {
      key: 'partner',
      header: 'Partner',
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.user?.name} size="sm" />
          <div>
            <p className="font-semibold text-ink-900">{p.user?.name}</p>
            <p className="text-xs text-ink-500">{p.user?.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'vehicle', header: 'Vehicle', render: (p) => <span className="capitalize">{p.vehicleType}</span> },
    { key: 'rating', header: 'Rating', render: (p) => <StarRating value={p.ratingAvg} count={p.ratingCount} size="h-3.5 w-3.5" /> },
    {
      key: 'availability',
      header: 'Availability',
      render: (p) => <Badge variant={p.isAvailable ? 'success' : 'neutral'}>{p.isAvailable ? 'Online' : 'Offline'}</Badge>,
    },
    {
      key: 'status',
      header: 'Account',
      render: (p) => <Badge variant={p.user?.isActive ? 'success' : 'danger'}>{p.user?.isActive ? 'Active' : 'Deactivated'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <Button
          size="sm"
          variant={p.user?.isActive ? 'outline' : 'primary'}
          loading={actingId === p._id}
          onClick={() => handleToggleStatus(p)}
        >
          {p.user?.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Delivery Partners</h1>

      <Table
        columns={columns}
        data={partners || []}
        keyField="_id"
        loading={loading}
        emptyState={<EmptyState icon="bike" title="No delivery partners yet" />}
      />

      <div className="mt-6">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
