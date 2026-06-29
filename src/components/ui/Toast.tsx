import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners = new Set<(toasts: ToastItem[]) => void>();
let toasts: ToastItem[] = [];

function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function showToast(message: string, type: ToastType = 'info') {
  const item = { id: ++toastId, message, type };
  toasts = [...toasts, item];
  notify();

  window.setTimeout(() => {
    toasts = toasts.filter((toast) => toast.id !== item.id);
    notify();
  }, 3500);
}

const typeClasses: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-stone-200 bg-white text-stone-800',
};

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (next: ToastItem[]) => setItems(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role={item.type === 'error' ? 'alert' : 'status'}
          className={`fade-in flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg ${typeClasses[item.type]}`}
        >
          <span className="text-sm">{item.message}</span>
          <button
            type="button"
            className="text-stone-500 hover:text-stone-800"
            onClick={() => {
              toasts = toasts.filter((toast) => toast.id !== item.id);
              notify();
            }}
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
