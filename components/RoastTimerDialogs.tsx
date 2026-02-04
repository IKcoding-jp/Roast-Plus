'use client';

import { useEffect } from 'react';
import { Button, Modal } from '@/components/ui';

interface CompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  isChristmasMode: boolean;
}

export function CompletionDialog({ isOpen, onClose, onContinue, isChristmasMode }: CompletionDialogProps) {
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
    <Modal show={isOpen} onClose={onClose} contentClassName={`rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 ${isChristmasMode ? 'bg-[#0a2818]' : 'bg-white'}`}>
      <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
        もうすぐ焙煎が完了します。
      </h2>
      <p className={`text-base sm:text-lg mb-6 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
        タッパーと木べらを持って焙煎室に行きましょう。
      </p>
      <div className="flex gap-3 sm:gap-4 justify-end">
        <Button variant="primary" size="md" onClick={onContinue} isChristmasMode={isChristmasMode}>
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
  isChristmasMode: boolean;
}

export function ContinuousRoastDialog({
  isOpen,
  onClose,
  onYes,
  onNo,
  isChristmasMode,
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
    <Modal show={isOpen} onClose={onClose} contentClassName={`rounded-lg shadow-xl p-6 sm:p-8 max-w-lg w-full mx-4 ${isChristmasMode ? 'bg-[#0a2818]' : 'bg-white'}`}>
      <h2 className={`text-xl sm:text-2xl font-bold mb-4 whitespace-nowrap ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
        続けて焙煎しますか？
      </h2>
      <p className={`text-base sm:text-lg mb-6 whitespace-nowrap ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
        焙煎機が温かいうちに次の焙煎が可能です。
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          variant="primary"
          size="md"
          onClick={onYes}
          className="flex-1 sm:flex-none order-1 sm:order-2 whitespace-nowrap"
          isChristmasMode={isChristmasMode}
        >
          続けて焙煎する
        </Button>
        <Button
          variant="info"
          size="md"
          onClick={onNo}
          className="flex-1 sm:flex-none order-2 sm:order-1 whitespace-nowrap"
          isChristmasMode={isChristmasMode}
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
  isChristmasMode: boolean;
}

export function AfterPurgeDialog({ isOpen, onClose, onRecord, isChristmasMode }: AfterPurgeDialogProps) {
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
    <Modal show={isOpen} onClose={onClose} contentClassName={`rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 ${isChristmasMode ? 'bg-[#0a2818]' : 'bg-white'}`}>
      <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
        お疲れ様でした！
      </h2>
      <p className={`text-base sm:text-lg mb-6 whitespace-pre-line ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
        機械をアフターパージに設定してください。{'\n'}焙煎時間の記録ができます。
      </p>
      <div className="flex gap-3 sm:gap-4 justify-end">
        <Button variant="secondary" size="md" onClick={onClose} isChristmasMode={isChristmasMode}>
          閉じる
        </Button>
        <Button variant="primary" size="md" onClick={onRecord} isChristmasMode={isChristmasMode}>
          記録に進む
        </Button>
      </div>
    </Modal>
  );
}

