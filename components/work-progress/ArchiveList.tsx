'use client';

import React from 'react';
import type { WorkProgress } from '@/types';
import WorkProgressCard from './WorkProgressCard';

interface Props {
  archived: WorkProgress[];
  onUnarchive: (id: string) => void;
  onAddProgress: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function ArchiveList({ archived, onUnarchive, onAddProgress, onEdit }: Props) {
  if (archived.length === 0) {
    return <p className="text-sm text-gray-600">アーカイブ済みの作業はありません。</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {archived
        .sort((a, b) => new Date(b.archivedAt || 0).getTime() - new Date(a.archivedAt || 0).getTime())
        .map((wp) => (
          <WorkProgressCard
            key={wp.id}
            workProgress={wp}
            onEdit={() => onEdit(wp.id)}
            onAddProgress={() => onAddProgress(wp.id)}
            onArchive={undefined}
            onUnarchive={() => onUnarchive(wp.id)}
            onStatusChange={() => {}}
            isHistoryOpen={false}
            toggleHistory={() => {}}
          />
        ))}
    </div>
  );
}
