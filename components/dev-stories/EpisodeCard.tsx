'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiLightbulbFlashFill } from 'react-icons/ri';
import { Badge } from '@/components/ui';
import type { DevStoryEpisode } from '@/types';

interface EpisodeCardProps {
  episode: DevStoryEpisode;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link href={`/dev-stories/${episode.id}`}>
      <div className="bg-surface rounded-xl shadow-sm border border-edge p-4 hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.98]">
        {/* サムネイル */}
        <div className="relative h-28 bg-ground rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {episode.imageUrl ? (
            <Image
              src={episode.imageUrl}
              alt={episode.title}
              fill
              className="object-cover"
            />
          ) : (
            <RiLightbulbFlashFill className="h-10 w-10 text-ink-muted" />
          )}
        </div>

        {/* タイトル */}
        <h3 className="font-bold text-ink mb-1 line-clamp-1">{episode.title}</h3>
        {episode.subtitle && (
          <p className="text-sm text-ink-sub mb-2 line-clamp-1">{episode.subtitle}</p>
        )}

        {/* タグ */}
        {episode.tags && episode.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {episode.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="sm">{tag}</Badge>
            ))}
          </div>
        )}

        {/* 日付 */}
        <p className="text-xs text-ink-muted">{formatDate(episode.publishedAt)}</p>
      </div>
    </Link>
  );
};
