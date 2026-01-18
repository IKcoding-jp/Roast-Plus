'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface XPGainAnimationProps {
  xp: number;
  show: boolean;
  onComplete?: () => void;
}

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
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: 2, duration: 0.3 }}
              className="text-2xl"
            >
              ⭐
            </motion.span>
            <span className="text-xl font-bold">+{xp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
