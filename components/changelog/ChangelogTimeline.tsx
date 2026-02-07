'use client';

import React from 'react';
import type { ChangelogEntry } from '@/types';
import { VersionCard } from './VersionCard';
import { MdHistory } from 'react-icons/md';

interface ChangelogTimelineProps {
  entries: ChangelogEntry[];
}

export const ChangelogTimeline: React.FC<ChangelogTimelineProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-ground rounded-full">
            <MdHistory className="h-12 w-12 text-ink-muted" />
          </div>
        </div>
        <p className="text-ink-muted">該当する更新履歴がありません</p>
        <p className="text-sm text-ink-muted mt-2">フィルターを変更してみてください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <VersionCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
};
