'use client';

import React, { useState } from 'react';
import type { VersionHistoryEntry } from '@/types';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { Button } from '@/components/ui';

interface VersionHistoryProps {
  entries: VersionHistoryEntry[];
  maxDisplay?: number;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  entries,
  maxDisplay = 5,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayedEntries = isExpanded ? entries : entries.slice(0, maxDisplay);
  const hasMore = entries.length > maxDisplay;

  return (
    <div>
      <ul className="space-y-2">
        {displayedEntries.map((entry) => (
          <li
            key={entry.version}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-sm font-medium rounded">
                v{entry.version}
              </span>
              {entry.summary && (
                <span className="text-sm text-gray-600">{entry.summary}</span>
              )}
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatDate(entry.date)}
            </span>
          </li>
        ))}
      </ul>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 !min-h-0 text-amber-600 hover:text-amber-700"
        >
          {isExpanded ? (
            <>
              <IoChevronUp className="h-4 w-4 mr-1" />
              閉じる
            </>
          ) : (
            <>
              <IoChevronDown className="h-4 w-4 mr-1" />
              もっと見る ({entries.length - maxDisplay}件)
            </>
          )}
        </Button>
      )}
    </div>
  );
};
