import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { PageErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <PageErrorBoundary>
      <RouterProvider router={router} />
    </PageErrorBoundary>
  );
}

export default App;
