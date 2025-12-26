import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree.
 * Displays a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Call optional error handler (could send to error tracking service)
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-100 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            
            <h2 className="mt-6 text-xl font-semibold text-white">
              Something went wrong
            </h2>
            
            <p className="mt-2 text-gray-400">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
            </p>

            {/* Error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-300">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-400">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 overflow-auto text-xs text-gray-500">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Page-level error boundary with full-screen styling
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-8">
          <div className="max-w-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
            
            <h1 className="mt-8 text-2xl font-bold text-white">
              Oops! Something went wrong
            </h1>
            
            <p className="mt-4 text-gray-400">
              We encountered an unexpected error. Our team has been notified. 
              Please try refreshing the page or return to the homepage.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh Page
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 font-medium text-gray-200 transition-colors hover:bg-gray-700"
              >
                <Home className="h-5 w-5" />
                Go to Homepage
              </a>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              If this problem persists, please{' '}
              <a href="/contact" className="text-indigo-400 hover:text-indigo-300">
                contact us
              </a>
              .
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Section-level error boundary with minimal styling
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName = 'section' 
}: { 
  children: ReactNode;
  sectionName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-sm text-gray-300">
            Failed to load {sectionName}. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Refresh
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
