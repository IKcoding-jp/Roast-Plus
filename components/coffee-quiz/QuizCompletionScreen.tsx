import Link from 'next/link';
import { motion } from 'framer-motion';

interface QuizCompletionScreenProps {
  correct: number;
  totalXP: number;
  returnUrl: string;
}

export function QuizCompletionScreen({ correct, totalXP, returnUrl }: QuizCompletionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl p-6 text-center shadow-sm border border-edge"
    >
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
        correct > 0 ? 'bg-success-subtle text-emerald-600' : 'bg-danger-subtle text-rose-600'
      }`}>
        {correct > 0 ? '✓' : '✗'}
      </div>
      <h2 className="text-lg font-bold text-ink mb-2">
        {correct > 0 ? '正解！' : '不正解'}
      </h2>
      <p className="text-ink-muted text-sm mb-4">
        +{totalXP} XP獲得
      </p>
      <Link
        href={returnUrl}
        className="inline-block bg-spot hover:bg-spot-hover text-white py-2.5 px-6 rounded-xl font-semibold transition-colors"
      >
        問題一覧に戻る
      </Link>
    </motion.div>
  );
}
