'use client';

import React from 'react';
import Image from 'next/image';
import { RiLightbulbFlashFill } from 'react-icons/ri';
import { BackLink } from '@/components/ui';
import { EpisodeCard } from '@/components/dev-stories/EpisodeCard';
import { getSortedEpisodes } from '@/data/dev-stories/episodes';

export default function DevStoriesPage() {
  const episodes = getSortedEpisodes();

  return (
    <div className="h-screen overflow-y-hidden flex flex-col px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 lg:pt-8 pb-2 sm:pb-3 lg:pb-4 bg-page transition-colors duration-1000">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <header className="mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <BackLink href="/" variant="icon-only" aria-label="戻る" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-ink">開発秘話</h1>
              <p className="text-ink-sub text-sm mt-1 hidden sm:block">
                様々なキャラクターが、ローストプラスの開発を語ります。
              </p>
            </div>
            {/* キャラクター画像 */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Image
                src="/avatars/header_characters.png"
                alt="フカイリとアサイリ"
                width={48}
                height={48}
                className="h-10 sm:h-12 w-auto object-contain animate-wobble-left"
              />
              <Image
                src="/avatars/header_dori_server.png"
                alt="ドリとサーバ"
                width={48}
                height={48}
                className="h-10 sm:h-12 w-auto object-contain animate-wobble-right"
              />
              <Image
                src="/avatars/header_mill_kettle.png"
                alt="ミルとケトル"
                width={48}
                height={48}
                className="h-10 sm:h-12 w-auto object-contain animate-wobble-left"
              />
              <Image
                src="/avatars/header_press_siphon.png"
                alt="プレスとサイフォン"
                width={48}
                height={48}
                className="h-10 sm:h-12 w-auto object-contain animate-wobble-right"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto pb-20 sm:pb-0">
          {episodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-ground rounded-full">
                  <RiLightbulbFlashFill className="h-12 w-12 text-ink-muted" />
                </div>
              </div>
              <p className="text-ink-sub">まだエピソードがありません</p>
              <p className="text-sm text-ink-muted mt-2">新しいエピソードをお楽しみに！</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {episodes.map((episode) => (
                <EpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
