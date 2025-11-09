'use client';

import { createContext, useContext, useEffect } from 'react';
import { useToast, type Toast as ToastType } from '@/hooks/useToast';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle, IoWarning } from 'react-icons/io5';

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

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

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
      className={`
        ${getToastStyles()}
        border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[500px]
        flex items-start gap-3 pointer-events-auto
        animate-in slide-in-from-right-full fade-in duration-300
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="閉じる"
      >
        <IoCloseCircle className="w-5 h-5" />
      </button>
    </div>
  );
}

