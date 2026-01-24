'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface HelpGuideModalProps {
  show: boolean;
  onClose: () => void;
}

// 閉じるアイコン
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// はてなアイコン
const HelpCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

// 説明セクションのカード
function GuideCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-[#FDF8F0] rounded-xl p-3 border border-[#211714]/5"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div>
          <h4 className="font-semibold text-[#211714] text-sm mb-1">{title}</h4>
          <p className="text-[#3A2F2B]/70 text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function HelpGuideModal({ show, onClose }: HelpGuideModalProps) {
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
            className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full max-h-[85vh] flex flex-col"
          >
            {/* ヘッダー - オレンジグラデーション */}
            <div className="bg-gradient-to-r from-[#EF8A00] via-[#D67A00] to-[#EF8A00] px-6 py-6 text-center relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
              >
                <XIcon />
              </button>

              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  scale: { repeat: Infinity, duration: 2 },
                }}
                className="text-white/90 flex justify-center"
              >
                <HelpCircleIcon />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-white mt-2"
              >
                使い方ガイド
              </motion.h2>
            </div>

            {/* コンテンツ - スクロール可能 */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <GuideCard
                icon="🎯"
                title="定着率とは"
                description="各問題の記憶定着度を表すパーセンテージです。正解するほど定着率が上がり、67%以上で「定着済み」になります。全75問の定着を目指しましょう！"
                delay={0.3}
              />

              <GuideCard
                icon="📊"
                title="習得度について"
                description="一度でも正解した問題は「正解済み」としてカウントされます。さらに定着率が67%以上になると「マスター」ラベルが表示されます。全75問の正解を目指しましょう！"
                delay={0.35}
              />

              <GuideCard
                icon="⭐"
                title="レベルと経験値"
                description="クイズに答えるとXP（経験値）がもらえます。XPを貯めるとレベルアップ！正解するほど多くのXPが獲得できます。"
                delay={0.4}
              />

              <GuideCard
                icon="📚"
                title="学習モード"
                description="「今日のクイズ」はランダム出題、「復習」は忘れかけの問題を出題、「カテゴリ別学習」は好きな分野を集中学習できます。"
                delay={0.45}
              />
            </div>

            {/* フッターボタン */}
            <div className="p-4 pt-0 flex-shrink-0">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="w-full bg-[#EF8A00] hover:bg-[#D67A00] text-white py-3 px-6 rounded-xl font-semibold transition-colors"
              >
                わかった
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
