import Link from 'next/link';
import { motion } from 'framer-motion';

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

interface QuizNavigationButtonsProps {
  mode: 'single' | 'sequential' | 'normal';
  returnUrl: string;
  isCorrect: boolean;
  isLastQuestion: boolean;
  onNext: () => void;
}

export function QuizNavigationButtons({
  mode,
  returnUrl,
  isCorrect,
  isLastQuestion,
  onNext,
}: QuizNavigationButtonsProps) {
  // Singleモード
  if (mode === 'single') {
    return (
      <Link
        href={returnUrl}
        className="w-full mt-4 flex items-center justify-center gap-2 bg-[#EF8A00] hover:bg-[#D67A00] text-white py-3.5 px-5 rounded-xl font-semibold transition-colors"
      >
        <ArrowLeftIcon />
        一覧に戻る
      </Link>
    );
  }

  // Sequentialモード
  if (mode === 'sequential') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 space-y-2"
      >
        {isCorrect ? (
          // 正解時
          isLastQuestion ? (
            // 最後の問題
            <Link
              href={returnUrl}
              className="w-full flex items-center justify-center gap-2 bg-[#EF8A00] hover:bg-[#D67A00] text-white py-3.5 px-5 rounded-xl font-semibold transition-colors"
            >
              <ArrowLeftIcon />
              問題一覧に戻る
            </Link>
          ) : (
            // 自動遷移中の表示
            <>
              <div className="w-full flex items-center justify-center gap-2 bg-[#EF8A00]/80 text-white py-3.5 px-5 rounded-xl font-semibold">
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                次の問題へ移動中...
              </div>
              <Link
                href={returnUrl}
                className="w-full flex items-center justify-center gap-2 bg-[#211714]/5 hover:bg-[#211714]/10 text-[#3A2F2B] py-3 px-5 rounded-xl font-medium transition-colors border border-[#211714]/10"
              >
                <ArrowLeftIcon />
                一覧に戻る
              </Link>
            </>
          )
        ) : (
          // 不正解時
          <>
            {!isLastQuestion && (
              <motion.button
                onClick={onNext}
                className="w-full flex items-center justify-center gap-2 bg-[#EF8A00] hover:bg-[#D67A00] text-white py-3.5 px-5 rounded-xl font-semibold transition-colors"
              >
                次の問題へ
                <ArrowRightIcon />
              </motion.button>
            )}
            <Link
              href={returnUrl}
              className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium transition-colors ${
                isLastQuestion
                  ? 'bg-[#EF8A00] hover:bg-[#D67A00] text-white font-semibold py-3.5'
                  : 'bg-[#211714]/5 hover:bg-[#211714]/10 text-[#3A2F2B] border border-[#211714]/10'
              }`}
            >
              <ArrowLeftIcon />
              {isLastQuestion ? '問題一覧に戻る' : '一覧に戻る'}
            </Link>
          </>
        )}
      </motion.div>
    );
  }

  // Normalモード
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onNext}
      className="w-full mt-4 flex items-center justify-center gap-2 bg-[#EF8A00] hover:bg-[#D67A00] text-white py-3.5 px-5 rounded-xl font-semibold transition-colors"
    >
      {isLastQuestion ? (
        '結果を見る'
      ) : (
        <>
          次の問題へ
          <ArrowRightIcon />
        </>
      )}
    </motion.button>
  );
}
