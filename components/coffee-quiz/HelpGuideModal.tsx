'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal, Button } from '@/components/ui';

interface HelpGuideModalProps {
  show: boolean;
  onClose: () => void;
}

// ─── ミニビジュアルコンポーネント ───────────────────────────────────

// 定着率ゲージ（円弧 67%）
function RetentionGauge() {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.67;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="relative w-14 h-14 flex-shrink-0">
        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
          <circle
            cx="28" cy="28" r={radius}
            fill="none"
            strokeWidth="5"
            style={{ stroke: 'var(--edge)' }}
          />
          <motion.circle
            cx="28" cy="28" r={radius}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            style={{ stroke: 'var(--spot)' }}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-spot">67%</span>
        </div>
      </div>
      <div className="text-left space-y-0.5">
        <div className="text-xs text-ink-muted">定着率の目標</div>
        <div className="text-sm font-semibold text-ink">67%以上で定着済み</div>
        <div className="text-xs text-ink-sub">全75問を目指そう</div>
      </div>
    </div>
  );
}

// 習得度バッジ列
function MasteryBadge() {
  const items = [
    { icon: '○', label: '未挑戦', active: false },
    { icon: '✓', label: '正解済み', active: false },
    { icon: '⭐', label: 'マスター', active: true },
  ];
  return (
    <div className="flex gap-2 justify-center">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 280, damping: 18 }}
          className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl border ${
            item.active
              ? 'bg-spot/10 border-spot/30'
              : 'bg-surface border-edge'
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span className={`text-[10px] font-medium ${item.active ? 'text-spot' : 'text-ink-muted'}`}>
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// XP プログレスバー
function XPBar() {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-ink">Lv.3</span>
        <span className="text-xs text-ink-muted">450 / 1000 XP</span>
      </div>
      <div className="h-2.5 bg-surface rounded-full overflow-hidden border border-edge">
        <motion.div
          className="h-full bg-spot rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '45%' }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-ink-muted">
        <span>Lv.3</span>
        <span>→ Lv.4まで 550 XP</span>
      </div>
    </div>
  );
}

// 学習モード 3アイコン
function ModeIcons() {
  const modes = [
    { icon: '📅', label: '今日の\nクイズ' },
    { icon: '🔄', label: '復習' },
    { icon: '📂', label: 'カテゴリ\n別' },
  ];
  return (
    <div className="flex gap-4 justify-center py-1">
      {modes.map((mode, i) => (
        <motion.div
          key={i}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="flex flex-col items-center gap-1.5 w-14"
        >
          <span className="text-2xl">{mode.icon}</span>
          <span className="text-[10px] text-ink-sub text-center leading-tight whitespace-pre-line">
            {mode.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── ステップデータ ─────────────────────────────────────────────────

interface Step {
  icon: string;
  label: string;
  title: string;
  description: string;
  visual: ReactNode;
}

const STEPS: Step[] = [
  {
    icon: '🎯',
    label: '定着率',
    title: '記憶がどれだけ定着しているか',
    description: '各問題の記憶定着度をパーセンテージで表します。正解するほど上がり、67%以上で「定着済み」に。全75問を定着済みにしよう！',
    visual: <RetentionGauge />,
  },
  {
    icon: '⭐',
    label: '習得度',
    title: '正解した問題がわかる',
    description: '一度でも正解すると「正解済み」カウント。定着率67%以上でマスターラベルが付きます。全75問の正解を目指そう！',
    visual: <MasteryBadge />,
  },
  {
    icon: '📈',
    label: 'レベルとXP',
    title: 'クイズでXPを獲得してレベルアップ',
    description: 'クイズに答えるたびにXP（経験値）獲得。正解すればするほど多くのXPがもらえます。レベルが上がるほど達成感UP！',
    visual: <XPBar />,
  },
  {
    icon: '📚',
    label: '学習モード',
    title: '3つのモードで効率的に学習',
    description: '「今日のクイズ」はランダム出題、「復習」は忘れかけを重点出題、「カテゴリ別」は好きな分野を集中学習できます。',
    visual: <ModeIcons />,
  },
];

// ─── スライドアニメーション ──────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: 'easeInOut' as const },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  }),
};

// ─── メインコンポーネント ────────────────────────────────────────────

export function HelpGuideModal({ show, onClose }: HelpGuideModalProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <Modal
      show={show}
      onClose={handleClose}
    >
      <div className="relative flex flex-col">
        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-surface/80 text-ink-muted hover:text-ink transition-colors"
          aria-label="閉じる"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ステップコンテンツ - 固定高さで高さぶれを防止 */}
        <div className="relative overflow-hidden" style={{ height: '340px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-x-0 top-0 px-6 pt-8 pb-2 flex flex-col items-center text-center gap-2"
            >
              {/* 大アイコン */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-spot/10 text-4xl"
              >
                {current.icon}
              </motion.div>

              {/* ラベルチップ */}
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-3 py-0.5 rounded-full bg-spot-subtle text-spot text-xs font-semibold border border-spot/20"
              >
                {current.label}
              </motion.span>

              {/* タイトル */}
              <motion.h2
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-base font-bold text-ink leading-snug"
              >
                {current.title}
              </motion.h2>

              {/* 説明 */}
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-ink-sub leading-relaxed min-h-[63px]"
              >
                {current.description}
              </motion.p>

              {/* ミニビジュアル - min-h で全ステップ同一高さに統一 */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="w-full p-3 rounded-xl bg-surface border border-edge min-h-[92px] flex flex-col justify-center"
              >
                {current.visual}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ドットインジケーター */}
        <div className="flex justify-center gap-1.5 py-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`ステップ ${i + 1}`}
              className="flex items-center"
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-spot'
                    : 'w-2 bg-edge hover:bg-ink-muted'
                }`}
              />
            </button>
          ))}
        </div>

        {/* ナビゲーション */}
        <div className="px-6 pb-6 flex gap-2">
          {!isFirst && (
            <Button
              variant="outline"
              onClick={() => goTo(step - 1)}
              className="flex-none"
            >
              ← 前へ
            </Button>
          )}
          {isLast ? (
            <Button
              variant="primary"
              onClick={handleClose}
              className="flex-1"
            >
              はじめる 🎉
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => goTo(step + 1)}
              className="flex-1"
            >
              次へ →
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
