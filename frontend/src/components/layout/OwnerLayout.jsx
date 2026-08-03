import DashboardLayout from './DashboardLayout';

const NAV_ITEMS = [
  { to: '/owner/dashboard', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/owner/restaurant', icon: 'store', label: 'Manage Restaurant' },
  { to: '/owner/menu', icon: 'utensils', label: 'Manage Menu' },
  { to: '/owner/orders', icon: 'receipt', label: 'Orders' },
  { to: '/owner/analytics', icon: 'trendingUp', label: 'Analytics' },
];

export default function OwnerLayout() {
  return <DashboardLayout navItems={NAV_ITEMS} roleLabel="Restaurant Owner" />;
}
