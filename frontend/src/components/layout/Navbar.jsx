import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown';
import NotificationBell from '@/components/common/NotificationBell';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser, logout } from '@/features/auth/authSlice';
import { selectCartItemCount } from '@/features/cart/cartSlice';
import { useToast } from '@/hooks/useToast';
import { ROLES, ROLE_HOME_PATH } from '@/utils/constants';

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${isActive ? 'text-brand-600' : 'text-ink-600 hover:text-ink-900'}`;

export default function Navbar() {
  const user = useAppSelector(selectCurrentUser);
  const cartCount = useAppSelector(selectCartItemCount);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notify = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCustomer = user?.role === ROLES.CUSTOMER;

  const handleLogout = async () => {
    await dispatch(logout());
    notify('Logged out successfully', 'success');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/restaurants" className={navLinkClass}>
              Restaurants
            </NavLink>
            <NavLink to="/food" className={navLinkClass}>
              Search Food
            </NavLink>
            {isCustomer && (
              <NavLink to="/orders" className={navLinkClass}>
                My Orders
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && <NotificationBell />}

          {isCustomer && (
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
            >
              <Icon name="cart" className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-500 text-2xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {!user && (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" to="/login">
                Log in
              </Button>
              <Button size="sm" to="/signup">
                Sign up
              </Button>
            </div>
          )}

          {user && (
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-ink-100" aria-label={`Account menu for ${user.name}`}>
                  <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                  <Icon name="chevronDown" className="hidden h-3.5 w-3.5 text-ink-500 sm:block" />
                </button>
              }
            >
              <div className="border-b border-ink-100 px-3 py-2">
                <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                <p className="truncate text-xs text-ink-500">{user.email}</p>
              </div>
              {isCustomer ? (
                <>
                  <DropdownItem icon="user" to="/profile">
                    Profile
                  </DropdownItem>
                  <DropdownItem icon="receipt" to="/orders">
                    Order History
                  </DropdownItem>
                </>
              ) : (
                <DropdownItem icon="dashboard" to={ROLE_HOME_PATH[user.role]}>
                  Go to dashboard
                </DropdownItem>
              )}
              <DropdownItem icon="logOut" onClick={handleLogout} className="text-danger-600 hover:bg-danger-50">
                Log out
              </DropdownItem>
            </Dropdown>
          )}

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="absolute right-0 top-0 h-full w-72 bg-white p-5 shadow-lifted"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full p-1.5 hover:bg-ink-100"
                >
                  <Icon name="close" className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-8 flex flex-col gap-1">
                <Link to="/restaurants" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                  Restaurants
                </Link>
                <Link to="/food" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                  Search Food
                </Link>
                {isCustomer && (
                  <>
                    <Link to="/orders" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                      My Orders
                    </Link>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                      Profile
                    </Link>
                  </>
                )}
                {!user && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button variant="outline" to="/login" onClick={() => setMobileOpen(false)}>
                      Log in
                    </Button>
                    <Button to="/signup" onClick={() => setMobileOpen(false)}>
                      Sign up
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
