import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/common/PageTransition';

export default function NotFound() {
  return (
    <PageTransition className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <Icon name="search" className="h-9 w-9" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold text-ink-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        We couldn&apos;t find the page you&apos;re looking for. It may have been moved or doesn&apos;t exist.
      </p>
      <Button to="/" className="mt-6">
        Back to home
      </Button>
    </PageTransition>
  );
}
