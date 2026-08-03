import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/common/PageTransition';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { ROLE_HOME_PATH } from '@/utils/constants';

export default function Unauthorized() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <PageTransition className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        <Icon name="shield" className="h-9 w-9" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">Access denied</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        Your account doesn&apos;t have permission to view this page.
      </p>
      <Button to={user ? ROLE_HOME_PATH[user.role] : '/'} className="mt-6">
        Take me back
      </Button>
    </PageTransition>
  );
}
