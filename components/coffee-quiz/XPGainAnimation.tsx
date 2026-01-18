'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface XPGainAnimationProps {
  xp: number;
  show: boolean;
  onComplete?: () => void;
}

// 星アイコン
const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export function XPGainAnimation({ xp, show, onComplete }: XPGainAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && xp > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, xp, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -30, scale: 1 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed top-1/3 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
        >
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#EF8A00] to-[#D67A00] text-white px-5 py-2.5 rounded-full shadow-lg">
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: 2, duration: 0.3 }}
              className="text-white"
            >
              <StarIcon />
            </motion.span>
            <span className="text-lg font-bold">+{xp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
