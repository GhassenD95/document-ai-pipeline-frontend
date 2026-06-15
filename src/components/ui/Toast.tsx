import { useState, useCallback } from 'react';

interface ToastState {
  message: string;
  visible: boolean;
}

let showToastFn: ((msg: string) => void) | null = null;

export function showToast(message: string) {
  showToastFn?.(message);
}

export function Toast() {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });

  showToastFn = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  if (!toast.visible) return null;

  return (
    <div className="fixed top-20 right-8 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg shadow-lg z-[100] flex items-center gap-2 transition-all duration-300">
      <span className="material-symbols-outlined text-[18px]">check_circle</span>
      <span className="font-label-md text-label-md">{toast.message}</span>
    </div>
  );
}
