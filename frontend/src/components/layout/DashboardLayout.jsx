import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Icon from '@/components/ui/Icon';
import Avatar from '@/components/ui/Avatar';
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import NotificationBell from '@/components/common/NotificationBell';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser, logout } from '@/features/auth/authSlice';
import { useToast } from '@/hooks/useToast';

export default function DashboardLayout({ navItems, roleLabel }) {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    notify('Logged out successfully', 'success');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <Sidebar items={navItems} roleLabel={roleLabel} className="hidden md:flex" />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="absolute left-0 top-0 h-full"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Sidebar items={navItems} roleLabel={roleLabel} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 bg-white px-4 sm:px-6">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <span className="hidden text-sm font-semibold text-ink-500 md:block">{roleLabel} Dashboard</span>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-ink-100" aria-label={`Account menu for ${user?.name}`}>
                  <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
                  <Icon name="chevronDown" className="h-3.5 w-3.5 text-ink-500" />
                </button>
              }
            >
              <div className="border-b border-ink-100 px-3 py-2">
                <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
                <p className="truncate text-xs text-ink-500">{user?.email}</p>
              </div>
              <DropdownItem icon="logOut" onClick={handleLogout} className="text-danger-600 hover:bg-danger-50">
                Log out
              </DropdownItem>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
