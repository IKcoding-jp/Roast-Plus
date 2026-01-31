'use client';

import { motion } from 'framer-motion';
import { Modal } from '@/components/ui';

interface ResetConfirmDialogProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// 閉じるアイコン
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// 警告アイコン
const AlertTriangleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export function ResetConfirmDialog({ show, onConfirm, onCancel, isLoading = false }: ResetConfirmDialogProps) {
  return (
    <Modal show={show} onClose={onCancel}>
      <>
        {/* ヘッダー - 警告色 */}
            <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 px-6 py-6 text-center relative">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                <XIcon />
              </button>

              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  scale: { repeat: Infinity, duration: 1.5 },
                }}
                className="text-white/90 flex justify-center"
              >
                <AlertTriangleIcon />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-white mt-2"
              >
                データのリセット
              </motion.h2>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[#3A2F2B] text-center mb-4"
              >
                本当にクイズデータをリセットしますか？
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4"
              >
                <p className="text-rose-700 text-sm font-medium mb-2">
                  以下のデータが削除されます：
                </p>
                <ul className="text-rose-600 text-sm space-y-1">
                  <li>・学習履歴</li>
                  <li>・レベルとXP</li>
                  <li>・獲得バッジ</li>
                  <li>・統計情報</li>
                  <li>・ストリーク</li>
                </ul>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-rose-500 text-sm text-center mb-6 font-medium"
              >
                この操作は取り消せません。
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3"
              >
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 bg-[#FDF8F0] hover:bg-[#F5EFE6] text-[#3A2F2B] py-3 px-4 rounded-xl font-semibold transition-colors border border-[#211714]/10 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'リセット中...' : 'リセット'}
                </button>
              </motion.div>
            </div>
          </>
    </Modal>
  );
}
