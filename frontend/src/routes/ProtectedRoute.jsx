import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthChecked, selectCurrentUser } from '@/features/auth/authSlice';
import Spinner from '@/components/ui/Spinner';

/** Blocks rendering until the initial auth bootstrap resolves, then requires a logged-in user. */
export default function ProtectedRoute() {
  const authChecked = useAppSelector(selectAuthChecked);
  const user = useAppSelector(selectCurrentUser);
  const location = useLocation();

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <Spinner label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
