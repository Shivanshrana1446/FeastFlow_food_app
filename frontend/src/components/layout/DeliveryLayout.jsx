import DashboardLayout from './DashboardLayout';

const NAV_ITEMS = [
  { to: '/delivery/assigned', icon: 'bike', label: 'Assigned Orders', end: true },
  { to: '/delivery/tracking', icon: 'navigation', label: 'Delivery Tracking' },
  { to: '/delivery/history', icon: 'list', label: 'History' },
];

export default function DeliveryLayout() {
  return <DashboardLayout navItems={NAV_ITEMS} roleLabel="Delivery Partner" />;
}
