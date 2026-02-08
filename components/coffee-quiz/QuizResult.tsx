'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface QuizResultProps {
  correct: number;
  incorrect: number;
  totalXP: number;
  accuracy: number;
  onRetry: () => void;
  returnUrl?: string;  // 戻り先URL（デフォルト: /coffee-trivia）
}

// アイコン
const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export function QuizResult({
  correct,
  incorrect,
  totalXP,
  accuracy,
  onRetry,
  returnUrl = '/coffee-trivia',
}: QuizResultProps) {
  const isPerfect = accuracy === 100;

  // 結果に応じたスタイル
  const getResultConfig = () => {
    if (isPerfect) {
      return {
        text: 'パーフェクト',
        gradient: 'from-[#d4af37] via-spot to-[#d4af37]',
      };
    }
    if (accuracy >= 80) {
      return {
        text: 'よくできました',
        gradient: 'from-spot to-spot-hover',
      };
    }
    if (accuracy >= 60) {
      return {
        text: 'いい調子',
        gradient: 'from-spot-hover to-card-header-from',
      };
    }
    return {
      text: '復習しよう',
      gradient: 'from-card-header-via to-card-header-from',
    };
  };

  const config = getResultConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface rounded-2xl shadow-lg overflow-hidden border border-edge"
    >
      {/* ヘッダー */}
      <div className={`relative px-6 py-8 text-center bg-gradient-to-r ${config.gradient}`}>
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 text-white"
          >
            <TrophyIcon />
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-1">クイズ完了</h2>
          <p className="text-white/80 text-sm">{config.text}</p>
        </div>
      </div>

      {/* 統計 */}
      <div className="p-5">
        {/* 正解率 */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="relative inline-flex items-center justify-center w-28 h-28"
          >
            {/* 背景リング */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="var(--edge)"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="56"
                cy="56"
                r="48"
                stroke={isPerfect ? '#d4af37' : 'var(--color-spot)'}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 302' }}
                animate={{ strokeDasharray: `${(accuracy / 100) * 302} 302` }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              />
            </svg>

            {/* 数値 */}
            <div className="flex items-baseline">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`text-3xl font-bold ${isPerfect ? 'text-[#d4af37]' : 'text-spot'}`}
              >
                {accuracy}
              </motion.span>
              <span className={`text-base ${isPerfect ? 'text-[#d4af37]' : 'text-spot'}`}>%</span>
            </div>
          </motion.div>
          <p className="text-ink-muted text-xs mt-2">正解率</p>
        </div>

        {/* 詳細統計 */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-success-subtle rounded-xl p-3 text-center border border-success/20"
          >
            <span className="text-2xl font-bold text-emerald-600">{correct}</span>
            <p className="text-emerald-600/70 text-xs mt-0.5">正解</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-danger-subtle rounded-xl p-3 text-center border border-danger/20"
          >
            <span className="text-2xl font-bold text-rose-500">{incorrect}</span>
            <p className="text-rose-500/70 text-xs mt-0.5">不正解</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-spot-subtle rounded-xl p-3 text-center border border-spot/20"
          >
            <span className="text-2xl font-bold text-spot">+{totalXP}</span>
            <p className="text-spot/70 text-xs mt-0.5">XP</p>
          </motion.div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-2.5">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={onRetry}
            className="group w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-semibold bg-spot hover:bg-spot-hover text-white transition-colors active:scale-[0.98]"
          >
            <span className="group-hover:rotate-180 transition-transform duration-300">
              <RefreshIcon />
            </span>
            もう一度挑戦
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              href={returnUrl}
              className="w-full flex items-center justify-center gap-2 bg-edge-subtle text-ink py-3 px-5 rounded-xl font-semibold hover:bg-edge transition-colors"
            >
              <HomeIcon />
              {returnUrl === '/coffee-trivia' ? 'ダッシュボードへ' : '戻る'}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
