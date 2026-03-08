'use client';

import { createContext, useContext, useEffect } from 'react';
import { useToast, type Toast as ToastType } from '@/hooks/useToast';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle, IoWarning } from 'react-icons/io5';
import { IconButton } from '@/components/ui';

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toast.toasts.map((toastItem) => (
          <ToastItem key={toastItem.id} toast={toastItem} onClose={() => toast.removeToast(toastItem.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  const toastStyleMap: Record<string, { bg: string; border: string; text: string }> = {
    success: {
      bg: 'var(--color-success-subtle)',
      border: 'var(--color-success)',
      text: 'var(--color-success)',
    },
    error: {
      bg: 'var(--color-danger-subtle)',
      border: 'var(--color-danger)',
      text: 'var(--color-danger)',
    },
    warning: {
      bg: 'var(--color-warning-subtle)',
      border: 'var(--color-warning)',
      text: 'var(--color-warning)',
    },
    info: {
      bg: 'var(--color-spot-subtle)',
      border: 'var(--color-spot)',
      text: 'var(--color-spot)',
    },
  };

  const styles = toastStyleMap[toast.type] ?? toastStyleMap.info;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <IoCheckmarkCircle className="w-5 h-5" />;
      case 'error':
        return <IoCloseCircle className="w-5 h-5" />;
      case 'warning':
        return <IoWarning className="w-5 h-5" />;
      default:
        return <IoInformationCircle className="w-5 h-5" />;
    }
  };

  return (
    <div
      className="border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[500px] flex items-start gap-3 pointer-events-auto animate-in slide-in-from-right-full fade-in duration-300"
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
        color: styles.text,
      }}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <IconButton
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="flex-shrink-0 opacity-60 hover:opacity-100 !min-h-0 !min-w-0 !p-0"
        style={{ color: styles.text }}
        aria-label="閉じる"
      >
        <IoCloseCircle className="w-5 h-5" />
      </IconButton>
    </div>
  );
}

