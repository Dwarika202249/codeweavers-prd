import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { PageErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { initGA } from './lib/analytics';

function App() {
  // Initialize Google Analytics on mount
  useEffect(() => {
    initGA();
  }, []);

  return (
    <PageErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </PageErrorBoundary>
  );
}

export default App;
