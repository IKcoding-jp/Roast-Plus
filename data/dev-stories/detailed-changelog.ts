import type { ChangelogEntry, ChangelogEntryType } from '@/types';

// 変更タイプの日本語ラベルと色定義
export const CHANGE_TYPE_CONFIG: Record<ChangelogEntryType, { label: string; color: string; bgColor: string }> = {
  feature: { label: '機能追加', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  bugfix: { label: '修正', color: 'text-red-700', bgColor: 'bg-red-100' },
  improvement: { label: '改善', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  docs: { label: 'ドキュメント', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  style: { label: 'デザイン', color: 'text-pink-700', bgColor: 'bg-pink-100' },
  update: { label: '更新', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  story: { label: '開発秘話', color: 'text-amber-700', bgColor: 'bg-amber-100' },
};

// 詳細な更新履歴データ
export const DETAILED_CHANGELOG: ChangelogEntry[] = [
  {
    id: 'v0.13.0',
    version: '0.13.0',
    date: '2026-02-23',
    type: 'style',
    title: 'テーマ選択画面のデザインをリニューアルしました',
    content: `
- テーマカードがフルイマーシブデザインになりました（各テーマの雰囲気を直感的に伝える配色でカード全体を塗りつぶし）
- 各テーマに専用アイコンとLIGHT/DARKバッジを追加しました
- テーマに合わせた大きなフォントでテーマ名を表示するようになりました
- カードにアンビエントアニメーションを追加しました（湯気・炎・粒子・葉・光波・雪・星）
    `.trim(),
    tags: ['テーマ', 'UI', '設定'],
    createdAt: '2026-02-23T00:00:00.000Z',
    updatedAt: '2026-02-23T00:00:00.000Z',
  },
  {
    id: 'v0.12.0',
    version: '0.12.0',
    date: '2026-02-21',
    type: 'feature',
    title: 'ダークモード・テーマ切り替え機能を追加しました',
    content: `
- ダークモード（Pure Neutral Dark）を追加しました
- テーマを6種類の中から選べるようになりました（設定 → テーマ）
- コーヒークイズの使い方ガイドをDuolingo風にリデザインしました
- ページ移動時に画面が白くちらつく問題を修正しました
- ホーム画面のヘッダーデザインを改善しました
- アプリのテーマカラーがテーマ切り替えに連動するようになりました
- 特定の記述を含む画像の文字読み取りで発生していた問題を修正しました
    `.trim(),
    tags: ['テーマ', 'ダークモード', 'クイズ', 'UI'],
    createdAt: '2026-02-21T00:00:00.000Z',
    updatedAt: '2026-02-21T00:00:00.000Z',
  },
  {
    id: 'v0.11.0',
    version: '0.11.0',
    date: '2026-02-03',
    type: 'improvement',
    title: '担当表・通知カードのデザインを統一しました',
    content: `
- 担当表ページのデザインを共通スタイルに統一しました
- 通知カードとバージョンカードのデザインを統一しました
- テーマに合わせてカードの色が自動的に切り替わるようになりました
    `.trim(),
    tags: ['UI', 'デザイン'],
    createdAt: '2026-02-03T09:58:53.922Z',
    updatedAt: '2026-02-03T10:52:23.082Z',
  },
  {
    id: 'v0.10.2',
    version: '0.10.2',
    date: '2026-02-01',
    type: 'bugfix',
    title: 'アプリ起動時に画面が一瞬ちらつく問題を修正しました',
    content: `
- アプリ起動時に画面が一瞬ちらつく問題を修正しました
    `.trim(),
    tags: ['バグ修正'],
    createdAt: '2026-02-01T01:09:28.615Z',
    updatedAt: '2026-02-01T08:51:03.475Z',
  },
  {
    id: 'v0.10.1',
    version: '0.10.1',
    date: '2026-01-31',
    type: 'update',
    title: '試飲記録の一覧画面をリデザインしました',
    content: `
- 試飲記録の一覧画面をリデザインしました
    `.trim(),
    tags: ['UI', 'デザイン'],
    createdAt: '2026-01-31T11:54:47.483Z',
    updatedAt: '2026-01-31T16:37:54.894Z',
  },
  {
    id: 'v0.10.0',
    version: '0.10.0',
    date: '2026-01-30',
    type: 'feature',
    title: 'デジタル時計ページの追加とカスタマイズ設定',
    content: `
- デジタル時計ページを追加しました（カスタマイズ設定あり）
- エラー発生時の表示を改善しました（ポップアップからトースト通知に変更）
- カメラ読み取りのエラー表示を改善しました
    `.trim(),
    tags: ['時計', 'UI'],
    createdAt: '2026-01-30T21:17:52.917Z',
    updatedAt: '2026-01-30T23:19:13.842Z',
  },
  {
    id: 'v0.9.1',
    version: '0.9.1',
    date: '2026-01-25',
    type: 'improvement',
    title: 'スマホでのUI改善・バグ修正',
    content: `
- スマホでもヘッダーキャラクターが表示されるようになりました
- 試飲感想記録ページのレイアウトが崩れる問題を修正しました
- 開発秘話エピソード6を読みやすく改善しました
    `.trim(),
    tags: ['UI', 'バグ修正'],
    createdAt: '2026-01-25T20:14:39.382Z',
    updatedAt: '2026-01-25T22:01:57.505Z',
  },
  {
    id: 'v0.9.0',
    version: '0.9.0',
    date: '2026-01-25',
    type: 'improvement',
    title: 'アプリ全体のデザイン統一',
    content: `
- ボタンや入力欄などの見た目を統一しました
- タップしやすい大きさに調整しました
- クリスマスモードにも対応しています
    `.trim(),
    tags: ['デザイン'],
    createdAt: '2026-01-25T19:57:29.187Z',
    updatedAt: '2026-01-25T19:57:29.187Z',
  },
  {
    id: 'v0.8.0',
    version: '0.8.0',
    date: '2026-01-26',
    type: 'feature',
    title: 'クイズ自動遷移・バッジデザイン刷新・更新履歴詳細ページ',
    content: `
## 機能追加
- クイズで正解後に次の問題へ自動遷移する機能を追加しました
- 更新履歴の詳細表示専用ページを追加しました
- バッジアイコンをモダンなデザインに変更しました
- ドリップガイドのレシピ表示順序を最適化しました
- 開発秘話 Episode 006「Claude Codeを使ってみた」を追加しました
- ホーム画面にカテゴリラベルを追加しました

## バグ修正
- カテゴリ別クイズで回答後に○×マークが即時反映されない問題を修正しました
- スマホ画面で「○○時まで」表記がはみ出る問題を修正しました
- バッジアイコンが正しく表示されない問題を修正しました
    `.trim(),
    tags: ['クイズ', 'UI'],
    createdAt: '2026-01-26T00:00:00.000Z',
    updatedAt: '2026-01-26T00:00:00.000Z',
  },
  {
    id: 'v0.7.0',
    version: '0.7.0',
    date: '2026-01-24',
    type: 'feature',
    title: 'James Hoffmann V60レシピ・クイズ機能強化・利用規約同意機能',
    content: `
- James Hoffmann V60レシピを追加しました
- クイズ機能を強化しました（カテゴリ追加、結果保存）
- 利用規約・プライバシーポリシーの同意機能を実装しました
    `.trim(),
    tags: ['ドリップ', 'クイズ', '法的対応'],
    createdAt: '2026-01-24T00:00:00.000Z',
    updatedAt: '2026-01-24T00:00:00.000Z',
  },
  {
    id: 'v0.6.1',
    version: '0.6.1',
    date: '2026-01-18',
    type: 'bugfix',
    title: 'スケジュール読み取り機能の修正と改善',
    content: `
- OCR読み取り精度の向上
- スケジュールパース処理のバグ修正
- エラーハンドリングの改善
    `.trim(),
    tags: ['スケジュール', 'OCR'],
    createdAt: '2026-01-18T00:00:00.000Z',
    updatedAt: '2026-01-18T00:00:00.000Z',
  },
  {
    id: 'v0.6.0',
    version: '0.6.0',
    date: '2026-01-18',
    type: 'feature',
    title: 'AIテイスティング分析・スケジュールOCR・開発秘話',
    content: `
- AIによるテイスティング分析機能を追加しました
- スケジュール画像の文字読み取り機能を追加しました
- 開発秘話セクションを追加しました
- キャラクター対話形式でアプリの成り立ちを紹介しています
    `.trim(),
    tags: ['AI', 'OCR', '開発秘話'],
    createdAt: '2026-01-18T00:00:00.000Z',
    updatedAt: '2026-01-18T00:00:00.000Z',
  },
  {
    id: 'v0.5.18',
    version: '0.5.18',
    date: '2026-01-15',
    type: 'improvement',
    title: 'ナビゲーションを整理して使いやすくしました',
    content: `
- アプリ内のナビゲーションを整理して使いやすくしました
    `.trim(),
    tags: [],
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'v0.5.17',
    version: '0.5.17',
    date: '2026-01-10',
    type: 'feature',
    title: 'ドリップガイド機能追加',
    content: `
- 複数のドリップレシピに対応
- ステップバイステップのガイド表示
- タイマー連動機能
    `.trim(),
    tags: ['ドリップ', 'レシピ'],
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'v0.5.16',
    version: '0.5.16',
    date: '2026-01-05',
    type: 'feature',
    title: '作業進捗機能追加',
    content: `
- 日々の作業進捗を記録
- 進捗履歴の可視化
- グループ別管理機能
    `.trim(),
    tags: ['進捗管理'],
    createdAt: '2026-01-05T00:00:00.000Z',
    updatedAt: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'v0.5.15',
    version: '0.5.15',
    date: '2025-12-28',
    type: 'style',
    title: 'クリスマスモード追加',
    content: `
- ホーム画面のクリスマス装飾
- 雪のアニメーション効果
- 設定から切り替え可能
    `.trim(),
    tags: ['UI', '季節イベント'],
    createdAt: '2025-12-28T00:00:00.000Z',
    updatedAt: '2025-12-28T00:00:00.000Z',
  },
  {
    id: 'v0.5.14',
    version: '0.5.14',
    date: '2025-12-20',
    type: 'feature',
    title: '欠点豆図鑑機能追加',
    content: `
- 欠点豆の種類と特徴を図鑑形式で表示
- 画像付きの詳細説明
- カスタム欠点豆の追加機能
    `.trim(),
    tags: ['欠点豆', '図鑑'],
    createdAt: '2025-12-20T00:00:00.000Z',
    updatedAt: '2025-12-20T00:00:00.000Z',
  },
  {
    id: 'v0.5.0',
    version: '0.5.0',
    date: '2025-12-09',
    type: 'improvement',
    title: 'スケジュール読み取りを改善しました',
    content: `
- スケジュール画像の文字読み取り精度を向上しました
- 担当表のラベルを自由にカスタマイズできるようになりました
    `.trim(),
    tags: ['スケジュール', '担当表'],
    createdAt: '2025-12-09T00:00:00.000Z',
    updatedAt: '2025-12-09T00:00:00.000Z',
  },
  {
    id: 'v0.4.0',
    version: '0.4.0',
    date: '2025-12-05',
    type: 'improvement',
    title: '担当表の設定・ドリップガイドのヒントを強化しました',
    content: `
- 担当表：特定のペアを避ける設定を追加しました
- ドリップガイド：抽出前のヒントを表示するようにしました
- 焙煎タイマー：音声の種類を選べるようになりました
    `.trim(),
    tags: ['担当表', 'ドリップ', '焙煎タイマー'],
    createdAt: '2025-12-05T00:00:00.000Z',
    updatedAt: '2025-12-05T00:00:00.000Z',
  },
  {
    id: 'v0.3.0',
    version: '0.3.0',
    date: '2025-11-23',
    type: 'feature',
    title: 'ドリップガイドを追加・担当表を全面刷新しました',
    content: `
- ドリップガイドを追加しました（ステップごとのガイド表示・完了アニメーション）
- 担当表を全面的に作り直しました（UIを改善）
- シャッフルロジックを改善しました（同じペアが続かないように）
    `.trim(),
    tags: ['ドリップ', '担当表'],
    createdAt: '2025-11-23T00:00:00.000Z',
    updatedAt: '2025-11-23T00:00:00.000Z',
  },
  {
    id: 'v0.2.0',
    version: '0.2.0',
    date: '2025-11-15',
    type: 'feature',
    title: '焙煎タイマー・欠点豆図鑑・作業進捗を追加しました',
    content: `
- 焙煎タイマーを追加しました（焙煎時間を計測・記録）
- 欠点豆図鑑を追加しました（欠点豆の種類と特徴を写真付きで管理）
- 作業進捗管理を追加しました（日々の作業をかんばんボードで管理）
- 複数台のデバイスでタイマー状態がリアルタイム同期するようになりました
    `.trim(),
    tags: ['焙煎タイマー', '欠点豆', '進捗管理'],
    createdAt: '2025-11-15T00:00:00.000Z',
    updatedAt: '2025-11-15T00:00:00.000Z',
  },
  {
    id: 'v0.1.0',
    version: '0.1.0',
    date: '2025-11-07',
    type: 'feature',
    title: 'アプリの基本機能がリリースされました',
    content: `
- ログイン機能（メールアドレス・パスワード認証）
- 担当表（シャッフルで作業分担を自動決定）
- 今日のスケジュール表示（ローストスケジュールを確認）
- 試飲記録（テイスティング結果を記録・一覧表示）
    `.trim(),
    tags: ['基本機能'],
    createdAt: '2025-11-07T00:00:00.000Z',
    updatedAt: '2025-11-07T00:00:00.000Z',
  },
];

// フィルター用の全タイプリスト（表示順）
export const FILTER_TYPES: ChangelogEntryType[] = [
  'feature',
  'improvement',
  'bugfix',
  'style',
  'docs',
];

// 全タグを取得
export const getAllTags = (): string[] => {
  const tagSet = new Set<string>();
  DETAILED_CHANGELOG.forEach((entry) => {
    entry.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
};
