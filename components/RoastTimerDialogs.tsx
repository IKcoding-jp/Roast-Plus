'use client';

import { useEffect } from 'react';
import { Button, Modal } from '@/components/ui';

interface CompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function CompletionDialog({ isOpen, onClose, onContinue }: CompletionDialogProps) {
  useEffect(() => {
    if (isOpen) {
      // ダイアログが開いた時にフォーカスを管理
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={onClose} contentClassName="rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 bg-surface">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-ink">
        もうすぐ焙煎が完了します。
      </h2>
      <p className="text-base sm:text-lg mb-6 text-ink-sub">
        タッパーと木べらを持って焙煎室に行きましょう。
      </p>
      <div className="flex gap-3 sm:gap-4 justify-end">
        <Button variant="primary" size="md" onClick={onContinue}>
          OK
        </Button>
      </div>
    </Modal>
  );
}

interface ContinuousRoastDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}

export function ContinuousRoastDialog({
  isOpen,
  onClose,
  onYes,
  onNo,
}: ContinuousRoastDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={onClose} contentClassName="rounded-lg shadow-xl p-6 sm:p-8 max-w-lg w-full mx-4 bg-surface">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 whitespace-nowrap text-ink">
        続けて焙煎しますか？
      </h2>
      <p className="text-base sm:text-lg mb-6 whitespace-nowrap text-ink-sub">
        焙煎機が温かいうちに次の焙煎が可能です。
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          variant="primary"
          size="md"
          onClick={onYes}
          className="flex-1 sm:flex-none order-1 sm:order-2 whitespace-nowrap"
        >
          続けて焙煎する
        </Button>
        <Button
          variant="info"
          size="md"
          onClick={onNo}
          className="flex-1 sm:flex-none order-2 sm:order-1 whitespace-nowrap"
        >
          アフターパージ
        </Button>
      </div>
    </Modal>
  );
}

interface AfterPurgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRecord: () => void;
}

export function AfterPurgeDialog({ isOpen, onClose, onRecord }: AfterPurgeDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Modal show={isOpen} onClose={onClose} contentClassName="rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 bg-surface">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-ink">
        お疲れ様でした！
      </h2>
      <p className="text-base sm:text-lg mb-6 whitespace-pre-line text-ink-sub">
        機械をアフターパージに設定してください。{'\n'}焙煎時間の記録ができます。
      </p>
      <div className="flex gap-3 sm:gap-4 justify-end">
        <Button variant="secondary" size="md" onClick={onClose}>
          閉じる
        </Button>
        <Button variant="primary" size="md" onClick={onRecord}>
          記録に進む
        </Button>
      </div>
    </Modal>
  );
}

