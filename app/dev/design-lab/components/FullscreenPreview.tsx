'use client';

import { useEffect, useCallback } from 'react';
import { HiX } from 'react-icons/hi';

interface FullscreenPreviewProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function FullscreenPreview({ children, onClose }: FullscreenPreviewProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full h-full">
        {children}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="閉じる"
        >
          <HiX className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
