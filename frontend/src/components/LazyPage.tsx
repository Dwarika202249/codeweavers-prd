import { Suspense, type ReactNode } from 'react';
import { PageLoader } from '../components';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Wrapper component for lazy loaded pages with error boundary
export function LazyPage({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
