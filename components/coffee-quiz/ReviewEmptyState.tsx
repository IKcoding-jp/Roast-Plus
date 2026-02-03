import Link from 'next/link';

const CheckCircleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export function ReviewEmptyState() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
        <CheckCircleIcon />
      </div>
      <h2 className="text-lg font-bold text-[#211714] mb-2">お疲れ様です！</h2>
      <p className="text-[#3A2F2B]/70 mb-6">
        今のところ復習が必要な問題はありません。<br />
        クイズに挑戦して新しい問題を覚えましょう！
      </p>
      <Link
        href="/coffee-trivia"
        className="inline-block bg-[#EF8A00] hover:bg-[#D67A00] text-white py-2.5 px-6 rounded-xl font-semibold transition-colors"
      >
        ダッシュボードへ戻る
      </Link>
    </div>
  );
}
