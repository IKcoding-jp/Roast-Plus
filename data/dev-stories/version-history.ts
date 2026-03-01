import type { VersionHistoryEntry } from '@/types';

// 更新履歴データ
export const VERSION_HISTORY: VersionHistoryEntry[] = [
  {
    version: '0.14.1',
    date: '2026-03-01',
    summary: '欠点豆図鑑の追加フォームが固まる問題を修正しました など 3件の更新',
  },
  {
    version: '0.14.0',
    date: '2026-02-26',
    summary: 'ドリップガイドにドリップパックレシピを追加しました など 2件の更新',
  },
  {
    version: '0.13.0',
    date: '2026-02-23',
    summary: 'テーマ選択画面のデザインをリニューアルしました など 4件の更新',
  },
  {
    version: '0.12.0',
    date: '2026-02-21',
    summary: 'ダークモード・テーマ切り替え機能を追加しました など 7件の更新',
  },
  {
    version: '0.11.0',
    date: '2026-02-03',
    summary: '担当表・通知カードのデザインを統一しました など 3件の更新',
  },
  {
    version: '0.10.2',
    date: '2026-02-01',
    summary: 'アプリ起動時に画面が一瞬ちらつく問題を修正しました',
  },
  {
    version: '0.10.1',
    date: '2026-01-31',
    summary: '試飲記録の一覧画面をリデザインしました',
  },
  {
    version: '0.10.0',
    date: '2026-01-30',
    summary: 'デジタル時計ページを追加しました など 3件の更新',
  },
  {
    version: '0.9.1',
    date: '2026-01-25',
    summary: 'スマホでのUI改善・バグ修正 など 3件の更新',
  },
  {
    version: '0.9.0',
    date: '2026-01-25',
    summary: 'アプリ全体のデザインを統一しました',
  },
  {
    version: '0.8.0',
    date: '2026-01-26',
    summary: 'クイズ自動遷移・バッジデザイン刷新・更新履歴詳細ページを追加しました',
  },
  {
    version: '0.7.0',
    date: '2026-01-24',
    summary: 'James Hoffmann V60レシピ・クイズ機能強化・利用規約同意機能を追加しました',
  },
  {
    version: '0.6.1',
    date: '2026-01-18',
    summary: 'スケジュール読み取り機能の修正と改善',
  },
  {
    version: '0.6.0',
    date: '2026-01-18',
    summary: 'AIテイスティング分析・スケジュールOCR・開発秘話を追加しました',
  },
  {
    version: '0.5.18',
    date: '2026-01-15',
    summary: 'ナビゲーションを整理して使いやすくしました',
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
  {
    version: '0.5.0',
    date: '2025-12-09',
    summary: 'スケジュール読み取りを改善しました',
  },
  {
    version: '0.4.0',
    date: '2025-12-05',
    summary: '担当表の設定・ドリップガイドのヒントを強化しました',
  },
  {
    version: '0.3.0',
    date: '2025-11-23',
    summary: 'ドリップガイドを追加・担当表を全面刷新しました',
  },
  {
    version: '0.2.0',
    date: '2025-11-15',
    summary: '焙煎タイマー・欠点豆図鑑・作業進捗を追加しました',
  },
  {
    version: '0.1.0',
    date: '2025-11-07',
    summary: 'アプリの基本機能をリリースしました',
  },
];

// 最新のバージョン履歴を取得
export const getLatestVersionHistory = (count: number = 5): VersionHistoryEntry[] => {
  return VERSION_HISTORY.slice(0, count);
};
