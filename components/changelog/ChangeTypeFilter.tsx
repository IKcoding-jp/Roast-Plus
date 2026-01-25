'use client';

import React from 'react';
import type { ChangelogEntryType } from '@/types';
import { CHANGE_TYPE_CONFIG, FILTER_TYPES } from '@/data/dev-stories/detailed-changelog';

interface ChangeTypeFilterProps {
  selectedTypes: ChangelogEntryType[];
  onToggle: (type: ChangelogEntryType) => void;
  onClear: () => void;
}

export const ChangeTypeFilter: React.FC<ChangeTypeFilterProps> = ({
  selectedTypes,
  onToggle,
  onClear,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-500 mr-1">フィルター:</span>
      {FILTER_TYPES.map((type) => {
        const config = CHANGE_TYPE_CONFIG[type];
        const isSelected = selectedTypes.includes(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {config.label}
          </button>
        );
      })}
      {selectedTypes.length > 0 && (
        <button
          onClick={onClear}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          クリア
        </button>
      )}
    </div>
  );
};
