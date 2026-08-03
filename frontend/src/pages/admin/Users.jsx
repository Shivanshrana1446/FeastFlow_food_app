import { useMemo, useState } from 'react';
import { adminApi } from '@/api/adminApi';
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
import { useToast, errorMessage } from '@/hooks/useToast';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import SearchBar from '@/components/ui/SearchBar';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import PageTransition from '@/components/common/PageTransition';
import { formatDate } from '@/utils/format';
import { ROLES } from '@/utils/constants';

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: ROLES.CUSTOMER, label: 'Customer' },
  { value: ROLES.RESTAURANT_OWNER, label: 'Restaurant Owner' },
  { value: ROLES.DELIVERY_PARTNER, label: 'Delivery Partner' },
  { value: ROLES.ADMIN, label: 'Admin' },
];

export default function AdminUsers() {
  const { page, limit, setPage } = usePagination(10);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [actingId, setActingId] = useState(null);
  const notify = useToast();

  const params = useMemo(() => ({ page, limit, role: role || undefined, q: q || undefined }), [page, limit, role, q]);
  const { data: users, meta, loading, refetch } = useFetch(() => adminApi.listUsers(params), [JSON.stringify(params)]);

  const handleToggleStatus = async (user) => {
    setActingId(user._id);
    try {
      await adminApi.setUserStatus(user._id, !user.isActive);
      notify(user.isActive ? 'User deactivated' : 'User activated', 'success');
      refetch();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setActingId(null);
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} src={u.avatarUrl} size="sm" />
          <div>
            <p className="font-semibold text-ink-900">{u.name}</p>
            <p className="text-xs text-ink-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (u) => <Badge variant="neutral">{u.role}</Badge> },
    { key: 'joined', header: 'Joined', render: (u) => formatDate(u.createdAt) },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Deactivated'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u) => (
        <Button
          size="sm"
          variant={u.isActive ? 'outline' : 'primary'}
          loading={actingId === u._id}
          onClick={() => handleToggleStatus(u)}
        >
          {u.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <PageTransition>
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Users</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <SearchBar placeholder="Search by name or email..." onSearch={(v) => { setQ(v); setPage(1); }} className="flex-1" />
        <Select
          className="!h-11 w-full sm:w-52"
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          options={ROLE_OPTIONS}
        />
      </div>

      <Table
        columns={columns}
        data={users || []}
        loading={loading}
        emptyState={<EmptyState icon="users" title="No users found" />}
      />

      <div className="mt-6">
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
