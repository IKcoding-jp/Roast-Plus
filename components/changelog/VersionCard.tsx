'use client';

import React from 'react';
import type { ChangelogEntry } from '@/types';
import { CHANGE_TYPE_CONFIG } from '@/data/dev-stories/detailed-changelog';

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
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
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {entry.title}
      </h3>

      {/* 内容 */}
      <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
        {entry.content}
      </div>

      {/* タグ */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
