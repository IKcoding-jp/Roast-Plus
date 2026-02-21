'use client';

import React, { useState, useMemo } from 'react';
import type { ChangelogEntryType } from '@/types';
import { ChangeTypeFilter, ChangelogTimeline } from '@/components/changelog';
import { DETAILED_CHANGELOG } from '@/data/dev-stories/detailed-changelog';
import { FloatingNav } from '@/components/ui/FloatingNav';
import { Card } from '@/components/ui/Card';

export default function ChangelogPage() {
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
      className="min-h-screen flex flex-col px-3 sm:px-6 lg:px-8 pt-14 pb-20 sm:pb-8 bg-page"
    >
      <FloatingNav backHref="/settings" />
      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1">
        {/* フィルター */}
        <Card className="p-4 mb-6 flex-shrink-0">
          <ChangeTypeFilter
            selectedTypes={selectedTypes}
            onToggle={handleToggleType}
            onClear={handleClearFilter}
          />
        </Card>

        {/* メインコンテンツ */}
        <main className="flex-1">
          <ChangelogTimeline entries={filteredEntries} />
        </main>

        {/* フッター */}
        <footer className="mt-8 pt-6 border-t border-edge text-center flex-shrink-0">
          <p className="text-sm text-ink-muted">
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
