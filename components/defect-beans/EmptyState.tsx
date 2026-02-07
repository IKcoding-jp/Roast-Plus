'use client';

import { HiSearch, HiOutlineCollection, HiPlus } from 'react-icons/hi';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  hasSearchOrFilter: boolean;
  onAddClick: () => void;
  isChristmasMode?: boolean;
}

export function EmptyState({ hasSearchOrFilter, onAddClick, isChristmasMode = false }: EmptyStateProps) {
  return (
    <div className="py-12 sm:py-16 text-center">
      <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
        {/* アイコン */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${
            isChristmasMode ? 'bg-[#d4af37]/20' : 'bg-amber-100'
          }`}></div>
          <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${
            isChristmasMode ? 'bg-white/5' : 'bg-amber-50'
          }`}>
            {hasSearchOrFilter ? (
              <HiSearch className={`w-10 h-10 sm:w-12 sm:h-12 ${isChristmasMode ? 'text-[#d4af37]' : 'text-amber-400'}`} />
            ) : (
              <HiOutlineCollection className={`w-10 h-10 sm:w-12 sm:h-12 ${isChristmasMode ? 'text-[#d4af37]' : 'text-amber-400'}`} />
            )}
          </div>
        </div>

        {/* メッセージ */}
        <div className="space-y-2">
          <h3 className={`text-lg sm:text-xl font-semibold ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            {hasSearchOrFilter
              ? '検索条件に一致する欠点豆がありません'
              : '欠点豆が登録されていません'}
          </h3>
          <p className={`text-sm sm:text-base max-w-md mx-auto ${isChristmasMode ? 'text-[#f8f1e7]/60' : 'text-gray-500'}`}>
            {hasSearchOrFilter
              ? '別のキーワードで検索するか、フィルタを変更してみてください。'
              : '最初の欠点豆を追加して、図鑑を始めましょう。'}
          </p>
        </div>

        {/* アクションボタン（登録がない場合のみ表示） */}
        {!hasSearchOrFilter && (
          <Button
            variant="primary"
            onClick={onAddClick}
            isChristmasMode={isChristmasMode}
            className="mt-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <HiPlus className="w-5 h-5" />
            <span className="font-medium">欠点豆を追加</span>
          </Button>
        )}
      </div>
    </div>
  );
}
