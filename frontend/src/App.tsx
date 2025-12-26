import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { PageErrorBoundary } from './components/ErrorBoundary';
import { initGA } from './lib/analytics';

function App() {
  // Initialize Google Analytics on mount
  useEffect(() => {
    initGA();
  }, []);

  return (
    <PageErrorBoundary>
      <RouterProvider router={router} />
    </PageErrorBoundary>
  );
}

export default App;
