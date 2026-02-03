import Link from 'next/link';
import { CATEGORY_LABELS } from '@/lib/coffee-quiz/types';
import type { QuizCategory } from '@/lib/coffee-quiz/types';

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

interface QuizPageHeaderProps {
  returnUrl: string;
  mode: string;
  category: QuizCategory | null;
}

export function QuizPageHeader({ returnUrl, mode, category }: QuizPageHeaderProps) {
  const getTitle = () => {
    if (mode === 'single') return '問題';
    if (category) return CATEGORY_LABELS[category];
    return 'デイリークイズ';
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[#211714]/5 px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <Link
          href={returnUrl}
          className="flex items-center gap-1.5 text-[#3A2F2B] hover:text-[#EF8A00] transition-colors"
        >
          <ArrowLeftIcon />
          <span className="text-sm font-medium">戻る</span>
        </Link>
        <h1 className="font-semibold text-[#211714]">{getTitle()}</h1>
        <div className="w-14" />
      </div>
    </header>
  );
}
