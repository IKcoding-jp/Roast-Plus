'use client';

import React from 'react';

interface DetailSectionProps {
  content: string;
  tags?: string[];
}

export const DetailSection: React.FC<DetailSectionProps> = ({ content, tags }) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      {/* 詳細説明 */}
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
      </div>

      {/* タグ */}
      {tags && tags.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
