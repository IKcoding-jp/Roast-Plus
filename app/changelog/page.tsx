'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { MdHistory } from 'react-icons/md';
import type { ChangelogEntryType } from '@/types';
import { ChangeTypeFilter, ChangelogTimeline } from '@/components/changelog';
import { DETAILED_CHANGELOG } from '@/data/dev-stories/detailed-changelog';
import { useChristmasMode } from '@/hooks/useChristmasMode';

export default function ChangelogPage() {
  const { isChristmasMode } = useChristmasMode();
  const [selectedTypes, setSelectedTypes] = useState<ChangelogEntryType[]>([]);

  const handleToggleType = (type: ChangelogEntryType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleClearFilter = () => {
    setSelectedTypes([]);
  };

  const filteredEntries = useMemo(() => {
    if (selectedTypes.length === 0) {
      return DETAILED_CHANGELOG;
    }
    return DETAILED_CHANGELOG.filter((entry) =>
      selectedTypes.includes(entry.type)
    );
  }, [selectedTypes]);

  return (
    <div
      className="min-h-screen flex flex-col px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 lg:pt-8 pb-20 sm:pb-8"
      style={{ backgroundColor: '#F7F7F5' }}
    >
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1">
        {/* ヘッダー */}
        <header className="mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              title="戻る"
              aria-label="戻る"
            >
              <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <MdHistory className="h-7 w-7 text-amber-500" />
                更新履歴
              </h1>
              <p className="text-gray-500 text-sm mt-1 hidden sm:block">
                ローストプラスの更新内容をご確認いただけます
              </p>
            </div>
          </div>
        </header>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6 flex-shrink-0">
          <ChangeTypeFilter
            selectedTypes={selectedTypes}
            onToggle={handleToggleType}
            onClear={handleClearFilter}
          />
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1">
          <ChangelogTimeline entries={filteredEntries} isChristmasMode={isChristmasMode} />
        </main>

        {/* フッター */}
        <footer className="mt-8 pt-6 border-t border-gray-200 text-center flex-shrink-0">
          <p className="text-sm text-gray-400">
            全 {DETAILED_CHANGELOG.length} 件の更新履歴
            {selectedTypes.length > 0 && (
              <span className="ml-2">（{filteredEntries.length} 件表示中）</span>
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
