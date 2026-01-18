'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

interface LevelUpModalProps {
  show: boolean;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ show, newLevel, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full"
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-8 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/70 hover:text-white"
              >
                <HiX className="w-6 h-6" />
              </button>

              {/* 星のアニメーション */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { repeat: Infinity, duration: 10, ease: 'linear' },
                  scale: { repeat: Infinity, duration: 1.5 },
                }}
                className="text-6xl mb-4"
              >
                ⭐
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mb-2"
              >
                レベルアップ！
              </motion.h2>
            </div>

            {/* コンテンツ */}
            <div className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4"
              >
                <span className="text-4xl font-bold text-purple-600">
                  {newLevel}
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-6"
              >
                おめでとうございます！
                <br />
                レベル {newLevel} に到達しました！
              </motion.p>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                続ける
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
