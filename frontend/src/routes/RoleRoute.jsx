import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';

/** Must be nested inside <ProtectedRoute /> — assumes `user` is already guaranteed non-null. */
export default function RoleRoute({ roles }) {
  const user = useAppSelector(selectCurrentUser);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
