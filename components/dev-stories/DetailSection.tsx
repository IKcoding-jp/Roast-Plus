'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui';

const MarkdownRenderer = dynamic(
  () => import('@/components/MarkdownRenderer').then(mod => ({ default: mod.MarkdownRenderer })),
);

interface DetailSectionProps {
  content: string;
  tags?: string[];
}

export const DetailSection: React.FC<DetailSectionProps> = ({ content, tags }) => {
  return (
    <div className="bg-surface rounded-2xl p-4 sm:p-6 shadow-sm border border-edge">
      {/* 詳細説明 */}
      <div className="max-w-none">
        <MarkdownRenderer content={content} />
      </div>

      {/* タグ */}
      {tags && tags.length > 0 && (
        <div className="mt-6 pt-4 border-t border-edge">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} size="sm">#{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
