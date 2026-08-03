import DashboardLayout from './DashboardLayout';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/admin/users', icon: 'users', label: 'Users' },
  { to: '/admin/restaurants', icon: 'store', label: 'Restaurants' },
  { to: '/admin/orders', icon: 'receipt', label: 'Orders' },
  { to: '/admin/delivery-partners', icon: 'bike', label: 'Delivery Partners' },
  { to: '/admin/analytics', icon: 'trendingUp', label: 'Analytics' },
];

export default function AdminLayout() {
  return <DashboardLayout navItems={NAV_ITEMS} roleLabel="Admin" />;
}
