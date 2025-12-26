import { useEffect, useState } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open && !loading) onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  // Trigger fade/scale animation on mount
  useEffect(() => {
    if (open) {
      // small delay to ensure transition runs
      const id = window.setTimeout(() => setIsVisible(true), 10);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-200 ${isVisible ? 'opacity-50' : 'opacity-0'}`}
        onClick={() => !loading && onCancel()}
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-md rounded-lg bg-gray-900 border border-gray-800 p-6 shadow-lg transform transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white mb-2">{title}</h2>
        <p className="text-sm text-gray-300 mb-4">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded bg-gray-800 text-gray-300"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded ${loading ? 'bg-gray-700 text-gray-300' : 'bg-red-600 text-white'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Working...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
