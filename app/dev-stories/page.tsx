'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi';
import { RiLightbulbFlashFill } from 'react-icons/ri';
import { MdConstruction } from 'react-icons/md';
import { EpisodeCard } from '@/components/dev-stories/EpisodeCard';
import { getSortedEpisodes } from '@/data/dev-stories/episodes';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { Loading } from '@/components/Loading';

export default function DevStoriesPage() {
  const episodes = getSortedEpisodes();
  const router = useRouter();
  const { isEnabled: isDeveloperMode, isLoading } = useDeveloperMode();

  if (isLoading) {
    return <Loading />;
  }

  // 開発者モードがオフの場合は開発中モーダルを表示
  if (!isDeveloperMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F7F7F5' }}>
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-amber-100 rounded-full">
              <MdConstruction className="h-12 w-12 text-amber-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">開発中の機能です</h2>
          <p className="text-gray-600 mb-6">
            この機能は現在開発中です。<br />
            公開までしばらくお待ちください。
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-y-hidden flex flex-col px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 lg:pt-8 pb-2 sm:pb-3 lg:pb-4"
      style={{ backgroundColor: '#F7F7F5' }}
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <header className="mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              title="戻る"
              aria-label="戻る"
            >
              <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">開発秘話</h1>
              <p className="text-gray-500 text-sm mt-1 hidden sm:block">
                アサイリとフカイリが、ローストプラスの開発を語ります。
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto pb-20 sm:pb-0">
          {episodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-amber-100 rounded-full">
                  <RiLightbulbFlashFill className="h-12 w-12 text-amber-400" />
                </div>
              </div>
              <p className="text-gray-500">まだエピソードがありません</p>
              <p className="text-sm text-gray-400 mt-2">新しいエピソードをお楽しみに！</p>
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
