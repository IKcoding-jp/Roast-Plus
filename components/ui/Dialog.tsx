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

  const contentClassName = 'bg-overlay rounded-2xl shadow-xl overflow-hidden max-w-sm w-full border border-edge';

  const cancelBtnClass = 'flex-1 bg-ground hover:bg-edge text-ink-sub py-2.5 px-4 rounded-xl font-medium transition-colors border border-edge disabled:opacity-50';

  const confirmBtnClass = isDanger
    ? 'flex-1 bg-danger hover:bg-danger/90 text-white py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-50'
    : 'flex-1 bg-spot hover:bg-spot-hover text-page py-2.5 px-4 rounded-xl font-medium transition-colors disabled:opacity-50';

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
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-danger-subtle">
              <Warning
                size={28}
                className="text-danger"
                weight="fill"
              />
            </div>
          </div>
        )}

        <h3 className={`text-lg font-bold text-ink ${isDanger ? 'text-center' : ''} mb-2`}>
          {title}
        </h3>

        {description && (
          <p className={`text-sm text-ink-sub ${isDanger ? 'text-center' : ''} mb-6`}>
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
