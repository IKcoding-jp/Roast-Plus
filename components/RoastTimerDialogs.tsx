'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          もうすぐ焙煎が完了します。
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6">
          タッパーと木べらを持って焙煎室に行きましょう。
        </p>
        <div className="flex gap-3 sm:gap-4 justify-end">
          <Button variant="primary" size="md" onClick={onContinue}>
            OK
          </Button>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-lg w-full mx-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 whitespace-nowrap">
          続けて焙煎しますか？
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 whitespace-nowrap">
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
            variant="secondary"
            size="md"
            onClick={onNo}
            className="flex-1 sm:flex-none order-2 sm:order-1 whitespace-nowrap !bg-[#00b8d4] hover:!bg-[#00a0b8]"
          >
            アフターパージ
          </Button>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          お疲れ様でした！
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 whitespace-pre-line">
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
      </div>
    </div>
  );
}

