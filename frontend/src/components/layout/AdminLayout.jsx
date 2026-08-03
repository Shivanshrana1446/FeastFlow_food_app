import DashboardLayout from './DashboardLayout';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/admin/customers', icon: 'user', label: 'Customers' },
  { to: '/admin/restaurants', icon: 'store', label: 'Restaurants' },
  { to: '/admin/delivery-partners', icon: 'bike', label: 'Delivery Partners' },
  { to: '/admin/orders', icon: 'receipt', label: 'Orders' },
  { to: '/admin/users', icon: 'users', label: 'All Users' },
  { to: '/admin/analytics', icon: 'trendingUp', label: 'Analytics' },
];

export default function AdminLayout() {
  return <DashboardLayout navItems={NAV_ITEMS} roleLabel="Admin" />;
}
