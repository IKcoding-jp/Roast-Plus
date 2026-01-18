'use client';

import { motion } from 'framer-motion';
import { HiRefresh, HiHome } from 'react-icons/hi';
import Link from 'next/link';

interface QuizResultProps {
  correct: number;
  incorrect: number;
  totalXP: number;
  accuracy: number;
  onRetry: () => void;
}

export function QuizResult({
  correct,
  incorrect,
  totalXP,
  accuracy,
  onRetry,
}: QuizResultProps) {
  const total = correct + incorrect;
  const isPerfect = accuracy === 100;
  const isGood = accuracy >= 80;

  // 結果に応じたメッセージとスタイル
  const getResultConfig = () => {
    if (isPerfect) {
      return {
        emoji: '🎉',
        text: 'パーフェクト！素晴らしい！',
        gradient: 'from-[#d4af37] via-[#f4d03f] to-[#d4af37]',
        shadow: 'shadow-[0_0_40px_rgba(212,175,55,0.4)]',
      };
    }
    if (accuracy >= 90) {
      return {
        emoji: '🌟',
        text: '素晴らしい結果です！',
        gradient: 'from-[#EF8A00] via-[#FF9A1A] to-[#EF8A00]',
        shadow: 'shadow-[0_0_30px_rgba(239,138,0,0.3)]',
      };
    }
    if (accuracy >= 80) {
      return {
        emoji: '👏',
        text: 'よくできました！',
        gradient: 'from-[#EF8A00] to-[#D67A00]',
        shadow: 'shadow-lg',
      };
    }
    if (accuracy >= 60) {
      return {
        emoji: '💪',
        text: 'いい調子！復習を続けよう',
        gradient: 'from-[#D67A00] to-[#211714]',
        shadow: 'shadow-lg',
      };
    }
    return {
      emoji: '📚',
      text: '復習して知識を深めよう！',
      gradient: 'from-[#3A2F2B] to-[#211714]',
      shadow: 'shadow-lg',
    };
  };

  const config = getResultConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white/95 backdrop-blur-sm rounded-2xl ${config.shadow} overflow-hidden border border-[#EF8A00]/10`}
    >
      {/* ヘッダー */}
      <div className={`relative px-6 py-10 text-center bg-gradient-to-r ${config.gradient}`}>
        {/* 装飾パターン */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          {isPerfect && (
            <>
              <div className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full animate-pulse" />
              <div className="absolute top-8 right-8 w-6 h-6 bg-white rounded-full animate-pulse delay-100" />
              <div className="absolute bottom-8 left-1/4 w-4 h-4 bg-white rounded-full animate-pulse delay-200" />
            </>
          )}
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-7xl mb-4"
          >
            {config.emoji}
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">クイズ完了！</h2>
          <p className="text-white/90 drop-shadow-sm">{config.text}</p>
        </div>
      </div>

      {/* 統計 */}
      <div className="p-6">
        {/* 正解率 - サークルプログレス風 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="relative inline-flex items-center justify-center w-32 h-32"
          >
            {/* 背景リング */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#f3f4f6"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                stroke={isPerfect ? '#d4af37' : '#EF8A00'}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 352' }}
                animate={{ strokeDasharray: `${(accuracy / 100) * 352} 352` }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              />
            </svg>

            {/* 数値 */}
            <div className="flex items-baseline">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`text-4xl font-bold ${isPerfect ? 'text-[#d4af37]' : 'text-[#EF8A00]'}`}
              >
                {accuracy}
              </motion.span>
              <span className={`text-lg ${isPerfect ? 'text-[#d4af37]' : 'text-[#EF8A00]'}`}>%</span>
            </div>
          </motion.div>
          <p className="text-[#3A2F2B]/70 text-sm mt-2">正解率</p>
        </div>

        {/* 詳細統計 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 text-center border border-emerald-200/50"
          >
            <span className="text-3xl font-bold text-emerald-600">{correct}</span>
            <p className="text-emerald-600/80 text-xs mt-1 font-medium">正解</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-4 text-center border border-rose-200/50"
          >
            <span className="text-3xl font-bold text-rose-500">{incorrect}</span>
            <p className="text-rose-500/80 text-xs mt-1 font-medium">不正解</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-[#FDF8F0] to-[#F7F2EB] rounded-xl p-4 text-center border border-[#EF8A00]/20"
          >
            <span className="text-3xl font-bold text-[#EF8A00]">+{totalXP}</span>
            <p className="text-[#EF8A00]/80 text-xs mt-1 font-medium">XP獲得</p>
          </motion.div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={onRetry}
            className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold overflow-hidden transition-all active:scale-[0.98]"
          >
            {/* グラデーション背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#EF8A00] to-[#D67A00] group-hover:from-[#D67A00] group-hover:to-[#EF8A00] transition-all duration-500" />

            <span className="relative z-10 flex items-center gap-2 text-white">
              <HiRefresh className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              もう一度挑戦
            </span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              href="/coffee-trivia"
              className="w-full flex items-center justify-center gap-2 bg-[#211714]/5 text-[#211714] py-3 px-6 rounded-xl font-bold hover:bg-[#211714]/10 transition-all"
            >
              <HiHome className="w-5 h-5" />
              ダッシュボードへ
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
