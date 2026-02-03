'use client';

import React from 'react';
import type { ChangelogEntry } from '@/types';
import { CHANGE_TYPE_CONFIG } from '@/data/dev-stories/detailed-changelog';
import { Card } from '@/components/ui/Card';

interface VersionCardProps {
  entry: ChangelogEntry;
  isChristmasMode?: boolean;
}

export const VersionCard: React.FC<VersionCardProps> = ({ entry, isChristmasMode = false }) => {
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
    <Card variant="hoverable" isChristmasMode={isChristmasMode} className="p-4 sm:p-5">
      {/* ヘッダー部分 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {entry.version && (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded">
            v{entry.version}
          </span>
        )}
        <span className={`px-2.5 py-1 ${typeConfig.bgColor} ${typeConfig.color} text-sm font-medium rounded`}>
          {typeConfig.label}
        </span>
        <span className="text-sm text-gray-400 ml-auto">
          {formatDate(entry.date)}
        </span>
      </div>

      {/* タイトル */}
      <h3 className={`text-lg font-semibold mb-2 ${isChristmasMode ? 'text-white' : 'text-gray-800'}`}>
        {entry.title}
      </h3>

      {/* 内容 */}
      <div className={`text-sm whitespace-pre-line leading-relaxed ${isChristmasMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {entry.content}
      </div>

      {/* タグ */}
      {entry.tags && entry.tags.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 mt-3 pt-3 border-t ${isChristmasMode ? 'border-[#d4af37]/20' : 'border-gray-100'}`}>
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-0.5 text-xs rounded ${isChristmasMode ? 'bg-white/10 text-gray-400' : 'bg-gray-50 text-gray-500'}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};
