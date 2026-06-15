import type { ReactNode, KeyboardEvent } from 'react';
import { useEffect } from 'react';
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler as unknown as EventListener);
    return () => document.removeEventListener('keydown', handler as unknown as EventListener);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-border animate-[fadeIn_200ms_ease-out]">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
