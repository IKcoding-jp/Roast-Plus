'use client';

import { useEffect, useCallback } from 'react';
import { Warning } from 'phosphor-react';
import { Modal } from './Modal';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'danger';
  isChristmasMode?: boolean;
  isLoading?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  onConfirm,
  variant = 'default',
  isChristmasMode = false,
  isLoading = false,
}: DialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const isDanger = variant === 'danger';

  const contentClassName = isChristmasMode
    ? 'bg-[#0a2618] rounded-2xl shadow-xl overflow-hidden max-w-sm w-full border border-[#d4af37]/40'
    : 'bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full';

  const titleColor = isChristmasMode ? 'text-white' : 'text-gray-900';
  const descColor = isChristmasMode ? 'text-gray-300' : 'text-gray-600';

  const cancelBtnClass = isChristmasMode
    ? 'flex-1 bg-white/10 hover:bg-white/20 text-gray-200 py-2.5 px-4 rounded-xl font-medium transition-colors border border-white/10 disabled:opacity-50'
    : 'flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-50';

  const confirmBtnClass = isDanger
    ? isChristmasMode
      ? 'flex-1 bg-red-700 hover:bg-red-800 text-white py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-50'
      : 'flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-50'
    : isChristmasMode
      ? 'flex-1 bg-[#d4af37] hover:bg-[#c4a030] text-[#0a2618] py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-50'
      : 'flex-1 bg-primary hover:bg-primary-dark text-white py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-50';

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      contentClassName={contentClassName}
      closeOnBackdropClick={!isLoading}
    >
      <div className="p-6">
        {isDanger && (
          <div className="flex justify-center mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isChristmasMode ? 'bg-red-900/50' : 'bg-red-100'
            }`}>
              <Warning
                size={28}
                className={isChristmasMode ? 'text-red-400' : 'text-red-600'}
                weight="fill"
              />
            </div>
          </div>
        )}

        <h3 className={`text-lg font-bold ${titleColor} ${isDanger ? 'text-center' : ''} mb-2`}>
          {title}
        </h3>

        {description && (
          <p className={`text-sm ${descColor} ${isDanger ? 'text-center' : ''} mb-6`}>
            {description}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={cancelBtnClass}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmBtnClass}
          >
            {isLoading ? '処理中...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
