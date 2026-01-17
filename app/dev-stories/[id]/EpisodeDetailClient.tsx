'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiArrowLeft, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { RiLightbulbFlashFill } from 'react-icons/ri';
import { MdConstruction } from 'react-icons/md';
import { DialogueSection } from '@/components/dev-stories/DialogueSection';
import { DetailSection } from '@/components/dev-stories/DetailSection';
import { getEpisodeById, getSortedEpisodes } from '@/data/dev-stories/episodes';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { Loading } from '@/components/Loading';

interface EpisodeDetailClientProps {
    id: string;
}

export default function EpisodeDetailClient({ id }: EpisodeDetailClientProps) {
    const router = useRouter();
    const { isEnabled: isDeveloperMode, isLoading } = useDeveloperMode();

    const episode = getEpisodeById(id);
    const episodes = getSortedEpisodes();

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
            <div
                className="h-screen flex flex-col items-center justify-center px-4"
                style={{ backgroundColor: '#F7F7F5' }}
            >
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                            <RiLightbulbFlashFill className="h-12 w-12 text-gray-400" />
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">エピソードが見つかりませんでした</p>
                    <Link
                        href="/dev-stories"
                        className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
                    >
                        <HiArrowLeft className="h-5 w-5" />
                        エピソード一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: '#F7F7F5' }}
        >
            {/* ヘッダー */}
            <header className="flex-none px-4 py-3 sm:px-6 lg:px-8 flex items-center bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
                <Link
                    href="/dev-stories"
                    className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                    title="戻る"
                    aria-label="戻る"
                >
                    <HiArrowLeft className="h-6 w-6" />
                </Link>
                <div className="ml-3 flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-gray-800 truncate">{episode.title}</h1>
                    {episode.subtitle && (
                        <p className="text-sm text-gray-500 truncate">{episode.subtitle}</p>
                    )}
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-1 container mx-auto p-4 lg:p-6 max-w-3xl">
                {/* 日付 */}
                <div className="text-sm text-gray-400 mb-4">{formatDate(episode.publishedAt)}</div>

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
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 -ml-2 min-h-[44px]"
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
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 -mr-2 min-h-[44px]"
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
