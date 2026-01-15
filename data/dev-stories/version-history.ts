import type { VersionHistoryEntry } from '@/types';

// 更新履歴データ
export const VERSION_HISTORY: VersionHistoryEntry[] = [
  {
    version: '0.5.18',
    date: '2026-01-15',
    summary: '機能整理アップデート',
  },
  {
    version: '0.5.17',
    date: '2026-01-10',
    summary: 'ドリップガイド機能追加',
  },
  {
    version: '0.5.16',
    date: '2026-01-05',
    summary: '作業進捗機能追加',
  },
  {
    version: '0.5.15',
    date: '2025-12-28',
    summary: 'クリスマスモード追加',
  },
  {
    version: '0.5.14',
    date: '2025-12-20',
    summary: '欠点豆図鑑機能追加',
  },
];

// 最新のバージョン履歴を取得
export const getLatestVersionHistory = (count: number = 5): VersionHistoryEntry[] => {
  return VERSION_HISTORY.slice(0, count);
};
