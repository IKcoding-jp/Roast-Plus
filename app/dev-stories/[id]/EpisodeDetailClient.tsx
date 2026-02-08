'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { RiLightbulbFlashFill } from 'react-icons/ri';
import { BackLink } from '@/components/ui';
import { DialogueSection } from '@/components/dev-stories/DialogueSection';
import { DetailSection } from '@/components/dev-stories/DetailSection';
import { getEpisodeById, getSortedEpisodes } from '@/data/dev-stories/episodes';

interface EpisodeDetailClientProps {
    id: string;
}

export default function EpisodeDetailClient({ id }: EpisodeDetailClientProps) {
    const router = useRouter();

    const episode = getEpisodeById(id);
    const episodes = getSortedEpisodes();

    // 前後のエピソード
    const currentIndex = episodes.findIndex((e) => e.id === id);
    const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
    const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (!episode) {
        return (
            <div className="h-screen flex flex-col items-center justify-center px-4 bg-page transition-colors duration-1000">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-ground rounded-full">
                            <RiLightbulbFlashFill className="h-12 w-12 text-ink-muted" />
                        </div>
                    </div>
                    <p className="text-ink-sub mb-4">エピソードが見つかりませんでした</p>
                    <BackLink href="/dev-stories">エピソード一覧に戻る</BackLink>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-page transition-colors duration-1000">
            {/* ヘッダー */}
            <header className="flex-none px-4 py-3 sm:px-6 lg:px-8 flex items-center bg-surface/50 backdrop-blur-sm border-b border-edge/50">
                <BackLink href="/dev-stories" variant="icon-only" aria-label="戻る" className="-ml-2" />
                <div className="ml-3 flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-ink truncate">{episode.title}</h1>
                    {episode.subtitle && (
                        <p className="text-sm text-ink-sub truncate">{episode.subtitle}</p>
                    )}
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-1 container mx-auto p-4 lg:p-6 max-w-3xl">
                {/* 日付 */}
                <div className="text-sm text-ink-muted mb-4">{formatDate(episode.publishedAt)}</div>

                {/* 対話セクション */}
                <div className="mb-6">
                    <DialogueSection dialogues={episode.dialogues} episodeId={episode.id} />
                </div>

                {/* 詳細説明セクション */}
                <DetailSection content={episode.detailContent} tags={episode.tags} />

                {/* 前後ナビゲーション */}
                <div className="mt-8 flex justify-between items-center gap-4">
                    {prevEpisode ? (
                        <button
                            onClick={() => router.push(`/dev-stories/${prevEpisode.id}`)}
                            className="flex items-center gap-2 text-ink-sub hover:text-ink transition-colors p-2 -ml-2 min-h-[44px]"
                        >
                            <HiChevronLeft className="h-5 w-5" />
                            <span className="text-sm">前のエピソード</span>
                        </button>
                    ) : (
                        <div />
                    )}
                    {nextEpisode ? (
                        <button
                            onClick={() => router.push(`/dev-stories/${nextEpisode.id}`)}
                            className="flex items-center gap-2 text-ink-sub hover:text-ink transition-colors p-2 -mr-2 min-h-[44px]"
                        >
                            <span className="text-sm">次のエピソード</span>
                            <HiChevronRight className="h-5 w-5" />
                        </button>
                    ) : (
                        <div />
                    )}
                </div>
            </main>
        </div>
    );
}
