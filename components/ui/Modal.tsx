/**
 * モーダル/ダイアログ用の共通Backdropコンポーネント
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

export interface ModalProps {
  /**
   * モーダルの表示/非表示
   */
  show: boolean;

  /**
   * モーダルを閉じる際のコールバック
   */
  onClose: () => void;

  /**
   * モーダルのコンテンツ
   */
  children: ReactNode;

  /**
   * コンテンツのクラス名（カスタマイズ用）
   */
  contentClassName?: string;

  /**
   * Backdropのクリックでモーダルを閉じるかどうか（デフォルト: true）
   */
  closeOnBackdropClick?: boolean;
}

/**
 * 共通モーダルコンポーネント
 * - Backdropアニメーション
 * - コンテンツのスプリングアニメーション
 * - Backdropクリックで閉じる機能
 */
export function Modal({
  show,
  onClose,
  children,
  contentClassName = 'bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full',
  closeOnBackdropClick = true,
}: ModalProps) {
  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={contentClassName}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
