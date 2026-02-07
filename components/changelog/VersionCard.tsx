'use client';

import React from 'react';
import type { ChangelogEntry } from '@/types';
import { CHANGE_TYPE_CONFIG } from '@/data/dev-stories/detailed-changelog';
import { Card } from '@/components/ui/Card';

interface VersionCardProps {
  entry: ChangelogEntry;
}

export const VersionCard: React.FC<VersionCardProps> = ({ entry }) => {
  const typeConfig = CHANGE_TYPE_CONFIG[entry.type];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card variant="hoverable" className="p-4 sm:p-5">
      {/* ヘッダー部分 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {entry.version && (
          <span className="px-2.5 py-1 bg-spot-subtle text-spot text-sm font-semibold rounded">
            v{entry.version}
          </span>
        )}
        <span className={`px-2.5 py-1 ${typeConfig.bgColor} ${typeConfig.color} text-sm font-medium rounded`}>
          {typeConfig.label}
        </span>
        <span className="text-sm text-ink-muted ml-auto">
          {formatDate(entry.date)}
        </span>
      </div>

      {/* タイトル */}
      <h3 className="text-lg font-semibold mb-2 text-ink">
        {entry.title}
      </h3>

      {/* 内容 */}
      <div className="text-sm whitespace-pre-line leading-relaxed text-ink-sub">
        {entry.content}
      </div>

      {/* タグ */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-edge">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded bg-ground text-ink-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};
