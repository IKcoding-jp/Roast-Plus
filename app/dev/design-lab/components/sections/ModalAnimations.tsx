'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Transition, TargetAndTransition } from 'framer-motion';
import { Button } from '@/components/ui';

interface AnimationPattern {
  name: string;
  description: string;
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
}

const animationPatterns: AnimationPattern[] = [
  {
    name: 'Current',
    description: '現行: scale 0.5→1 + spring (damping: 20)',
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
    transition: { type: 'spring', damping: 20 },
  },
  {
    name: 'Fade Only',
    description: 'opacity のみ。最も控えめ',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  {
    name: 'Fade + Subtle Scale',
    description: '微小スケール (0.95→1) + フェード。上品',
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  {
    name: 'Slide Up',
    description: '下からスライド (y: 30→0)。モバイルアプリ風',
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 30, opacity: 0 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  {
    name: 'Slide Up + Spring',
    description: '下からスライド + spring (damping: 25, stiffness: 300)',
    initial: { y: 40, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 40, opacity: 0 },
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
];

function DemoModal({
  show,
  onClose,
  pattern,
}: {
  show: boolean;
  onClose: () => void;
  pattern: AnimationPattern;
}) {
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
            initial={pattern.initial}
            animate={pattern.animate}
            exit={pattern.exit}
            transition={pattern.transition}
            onClick={(e) => e.stopPropagation()}
            className="bg-overlay rounded-2xl shadow-xl overflow-hidden max-w-sm w-full border border-edge p-6"
          >
            <h3 className="text-lg font-bold text-ink mb-2">{pattern.name}</h3>
            <p className="text-sm text-ink-muted mb-4">{pattern.description}</p>
            <pre className="text-xs bg-surface rounded-lg p-3 mb-4 text-ink-muted overflow-x-auto">
              {JSON.stringify(
                {
                  initial: pattern.initial,
                  animate: pattern.animate,
                  transition: pattern.transition,
                },
                null,
                2
              )}
            </pre>
            <Button variant="secondary" size="sm" onClick={onClose}>
              閉じる
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ModalAnimations() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">
          Modalアニメーション比較
        </h2>
        <p className="text-sm text-ink-muted">
          各パターンの「開く」ボタンをクリックして、アニメーションを比較してください。
        </p>
      </div>

      <div className="grid gap-4">
        {animationPatterns.map((pattern, index) => (
          <div
            key={pattern.name}
            className="flex items-center justify-between rounded-xl border border-edge bg-surface p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-ink">{pattern.name}</span>
                {index === 0 && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                    現行
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-muted">{pattern.description}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpenIndex(index)}
            >
              開く
            </Button>
          </div>
        ))}
      </div>

      {animationPatterns.map((pattern, index) => (
        <DemoModal
          key={pattern.name}
          show={openIndex === index}
          onClose={() => setOpenIndex(null)}
          pattern={pattern}
        />
      ))}
    </div>
  );
}
