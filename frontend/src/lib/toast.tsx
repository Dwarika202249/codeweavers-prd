import toast, { Toaster as HotToaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Custom toast styles matching our dark theme
const baseStyle = {
  background: '#1f2937', // gray-800
  color: '#f3f4f6', // gray-100
  border: '1px solid #374151', // gray-700
  padding: '16px',
  borderRadius: '12px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
};

// Success toast
export const showSuccess = (message: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex w-full max-w-md items-start gap-3 rounded-xl border border-green-500/30 bg-gray-800 p-4 shadow-lg`}
      >
        <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
        <p className="flex-1 text-sm text-gray-100">{message}</p>
        <button
          onClick={() => toast.dismiss(t.id)}
          aria-label="Dismiss notification"
          className="shrink-0 text-gray-400 transition-colors hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration: 4000 }
  );
};

// Error toast
export const showError = (message: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex w-full max-w-md items-start gap-3 rounded-xl border border-red-500/30 bg-gray-800 p-4 shadow-lg`}
      >
        <XCircle className="h-5 w-5 shrink-0 text-red-400" />
        <p className="flex-1 text-sm text-gray-100">{message}</p>
        <button
          onClick={() => toast.dismiss(t.id)}
          aria-label="Dismiss notification"
          className="shrink-0 text-gray-400 transition-colors hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration: 5000 }
  );
};

// Warning toast
export const showWarning = (message: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex w-full max-w-md items-start gap-3 rounded-xl border border-yellow-500/30 bg-gray-800 p-4 shadow-lg`}
      >
        <AlertCircle className="h-5 w-5 shrink-0 text-yellow-400" />
        <p className="flex-1 text-sm text-gray-100">{message}</p>
        <button
          onClick={() => toast.dismiss(t.id)}
          aria-label="Dismiss notification"
          className="shrink-0 text-gray-400 transition-colors hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration: 4000 }
  );
};

// Info toast
export const showInfo = (message: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex w-full max-w-md items-start gap-3 rounded-xl border border-indigo-500/30 bg-gray-800 p-4 shadow-lg`}
      >
        <Info className="h-5 w-5 shrink-0 text-indigo-400" />
        <p className="flex-1 text-sm text-gray-100">{message}</p>
        <button
          onClick={() => toast.dismiss(t.id)}
          aria-label="Dismiss notification"
          className="shrink-0 text-gray-400 transition-colors hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ),
    { duration: 4000 }
  );
};

// Loading toast - returns toast id for dismissal
export const showLoading = (message: string) => {
  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex w-full max-w-md items-start gap-3 rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-lg`}
      >
        <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
        <p className="flex-1 text-sm text-gray-100">{message}</p>
      </div>
    ),
    { duration: Infinity }
  );
};

// Dismiss a specific toast
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Promise toast - for async operations
export const showPromise = <T,>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: Error) => string);
  }
) => {
  return toast.promise(
    promise,
    {
      loading,
      success: typeof success === 'string' ? success : success,
      error: typeof error === 'string' ? error : error,
    },
    {
      style: baseStyle,
      success: {
        icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      },
      error: {
        icon: <XCircle className="h-5 w-5 text-red-400" />,
      },
      loading: {
        icon: (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
        ),
      },
    }
  );
};

// Custom Toaster component with dark theme styling
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        style: baseStyle,
        duration: 4000,
        success: {
          iconTheme: {
            primary: '#4ade80', // green-400
            secondary: '#1f2937', // gray-800
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171', // red-400
            secondary: '#1f2937', // gray-800
          },
        },
      }}
      containerStyle={{
        top: 80, // Below navbar
      }}
    />
  );
}

// Re-export the base toast for simple use cases
export { toast };
