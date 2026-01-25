import type { VersionHistoryEntry } from '@/types';

// 更新履歴データ
export const VERSION_HISTORY: VersionHistoryEntry[] = [
  {
    version: '0.9.2',
    date: '2026-01-25',
    summary: 'スマホでもヘッダーキャラクターを表示 #32',
  },
  {
    version: '0.9.1',
    date: '2026-01-25',
    summary: '開発秘話エピソード6を非エンジニア向けに改善',
  },
  {
    version: '0.9.0',
    date: '2026-01-25',
    summary: '再利用可能なUIコンポーネントライブラリを追加',
  },
  {
    version: '0.8.0',
    date: '2026-01-26',
    summary: 'クイズ自動遷移・バッジデザイン刷新・更新履歴詳細ページ・Vitest導入',
  },
  {
    version: '0.7.0',
    date: '2026-01-24',
    summary: 'James Hoffmann V60レシピ・クイズ機能強化・利用規約同意機能を追加',
  },
  {
    version: '0.6.1',
    date: '2026-01-18',
    summary: 'スケジュール読み取り機能の修正と改善',
  },
  {
    version: '0.6.0',
    date: '2026-01-18',
    summary: 'AIテイスティング分析・スケジュールOCR・開発秘話の追加',
  },
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
