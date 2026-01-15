'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';
import Link from 'next/link';
import { IoNewspaper, IoRocket, IoBug, IoStar, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { MdAutoAwesome, MdHistory } from 'react-icons/md';
import { RiLightbulbFlashFill } from 'react-icons/ri';
import type { ChangelogEntry, ChangelogEntryType } from '@/types';

// エントリデータ（後でFirestoreから取得するように変更可能）
const SAMPLE_ENTRIES: ChangelogEntry[] = [
  {
    id: 'v0518-update-1',
    type: 'update',
    title: 'v0.5.18 機能整理アップデート',
    content: `今回のアップデートでは、アプリをシンプルで使いやすくするための整理を行いました。

【削除した機能】
・ハンドピックタイマー
・カウンター機能

これらの機能は、実際の運用で使用頻度が低かったため、アプリをすっきりさせる目的で削除しました。

【その他の変更】
・ドリップガイドの「新レシピ登場」ラベルを整理しました

今後もより使いやすいアプリを目指して改善を続けていきます！`,
    version: '0.5.18',
    date: '2026-01-15',
    tags: ['整理', '機能削除'],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// カテゴリの設定
const CATEGORY_CONFIG: Record<ChangelogEntryType, { label: string; icon: typeof IoNewspaper; color: string; bgColor: string }> = {
  update: { label: 'アップデート', icon: MdHistory, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  story: { label: '開発秘話', icon: RiLightbulbFlashFill, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  feature: { label: '新機能', icon: IoRocket, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  bugfix: { label: 'バグ修正', icon: IoBug, color: 'text-red-600', bgColor: 'bg-red-100' },
  improvement: { label: '改善', icon: MdAutoAwesome, color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

type FilterType = 'all' | ChangelogEntryType;

export default function ChangelogPage() {
  const { user, loading } = useAuth();
  useAppLifecycle();

  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // フィルタリングされたエントリ
  const filteredEntries = useMemo(() => {
    const entries = SAMPLE_ENTRIES;
    if (filter === 'all') {
      return entries;
    }
    return entries.filter((entry) => entry.type === filter);
  }, [filter]);

  // 日付でソート（新しい順）
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredEntries]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5]">
      <header className="flex-none px-4 py-3 sm:px-6 lg:px-8 flex items-center bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
        <Link
          href="/"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          title="戻る"
          aria-label="戻る"
        >
          <HiArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="ml-3 text-lg font-bold text-gray-800">更新履歴・開発秘話</h1>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6">
        {/* フィルターボタン */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all'
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            すべて
          </button>
          {(Object.entries(CATEGORY_CONFIG) as [ChangelogEntryType, typeof CATEGORY_CONFIG[ChangelogEntryType]][]).map(
            ([type, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${filter === type
                    ? `${config.bgColor} ${config.color} shadow-md`
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                </button>
              );
            }
          )}
        </div>

        {/* エントリ一覧 */}
        {sortedEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <IoNewspaper className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <p className="text-gray-500">まだエントリがありません</p>
          </div>
        ) : (
          <div className="relative">
            {/* タイムライン線 */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#EF8A00]/30 via-[#EF8A00]/20 to-transparent" />

            <div className="space-y-4">
              {sortedEntries.map((entry, index) => {
                const config = CATEGORY_CONFIG[entry.type];
                const Icon = config.icon;
                const isExpanded = expandedIds.has(entry.id);
                const contentLines = entry.content.split('\n');
                const shouldTruncate = contentLines.length > 3 || entry.content.length > 150;
                const displayContent = isExpanded
                  ? entry.content
                  : contentLines.slice(0, 2).join('\n').slice(0, 150) + (shouldTruncate ? '...' : '');

                return (
                  <div
                    key={entry.id}
                    className="relative pl-10 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* タイムラインドット */}
                    <div
                      className={`absolute left-2 top-4 w-5 h-5 rounded-full ${config.bgColor} border-2 border-white shadow-md flex items-center justify-center`}
                    >
                      <Icon className={`h-2.5 w-2.5 ${config.color}`} />
                    </div>

                    {/* カード */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4">
                        {/* ヘッダー */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                              >
                                <Icon className="h-3 w-3" />
                                {config.label}
                              </span>
                              {entry.version && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  <IoStar className="h-3 w-3" />
                                  v{entry.version}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-gray-800">{entry.title}</h3>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(entry.date)}</span>
                        </div>

                        {/* コンテンツ */}
                        <div className="text-sm text-gray-600 whitespace-pre-line">{displayContent}</div>

                        {/* 展開/折りたたみボタン */}
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleExpand(entry.id)}
                            className="mt-2 flex items-center gap-1 text-sm text-[#EF8A00] hover:text-[#d67a00] font-medium transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <IoChevronUp className="h-4 w-4" />
                                閉じる
                              </>
                            ) : (
                              <>
                                <IoChevronDown className="h-4 w-4" />
                                続きを読む
                              </>
                            )}
                          </button>
                        )}

                        {/* タグ */}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {entry.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-md border border-gray-100"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
