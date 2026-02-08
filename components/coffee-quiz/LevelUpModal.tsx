'use client';

import { motion } from 'framer-motion';
import { Modal } from '@/components/ui';

interface LevelUpModalProps {
  show: boolean;
  newLevel: number;
  onClose: () => void;
}

// 閉じるアイコン
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// 星アイコン
const StarIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export function LevelUpModal({ show, newLevel, onClose }: LevelUpModalProps) {
  return (
    <Modal show={show} onClose={onClose}>
      <>
        {/* ヘッダー - ローストプラスカラー */}
            <div className="bg-gradient-to-r from-spot via-spot-hover to-spot px-6 py-8 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
              >
                <XIcon />
              </button>

              {/* 星のアニメーション */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 10, ease: 'linear' },
                  scale: { repeat: Infinity, duration: 1.5 },
                }}
                className="text-white/90"
              >
                <StarIcon />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mt-3"
              >
                レベルアップ
              </motion.h2>
            </div>

            {/* コンテンツ */}
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-spot-subtle border-2 border-spot/20 mb-4"
              >
                <span className="text-4xl font-bold text-spot">
                  {newLevel}
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-ink-sub mb-6"
              >
                おめでとうございます
                <br />
                レベル {newLevel} に到達しました
              </motion.p>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="w-full bg-spot hover:bg-spot-hover text-white py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                続ける
              </motion.button>
            </div>
          </>
    </Modal>
  );
}
