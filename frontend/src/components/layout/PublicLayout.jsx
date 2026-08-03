import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
