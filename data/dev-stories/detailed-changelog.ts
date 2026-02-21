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
    id: 'v0.12.0',
    version: '0.12.0',
    date: '2026-02-21',
    type: 'feature',
    title: '<!-- ユーザーに見える変化のみ。技術的な内容は不要です --> など 4件の更新',
    content: `
<!-- ユーザーに見える変化のみ。技術的な内容は不要です -->
<!-- ユーザー向けの変更なし（内部改善のみ）の場合は "-" のままにしてください -->

- changelog自動化が使えるようになりました
- PRに「ユーザー向け更新内容」を書くと、アプリの更新履歴に自動で反映されます
    `.trim(),
    tags: [],
    createdAt: '2026-02-21T23:30:43.802Z',
    updatedAt: '2026-02-21T23:30:43.802Z',
  },
  {
    id: 'v0.11.0',
    version: '0.11.0',
    date: '2026-02-03',
    type: 'feature',
    title: '開発者モード時にUIコンポーネントカタログへのリンク追加 [Issue #125]',
    content: `
- 開発者モード時にUIコンポーネントカタログへのリンク追加 [Issue #125]
- NotificationCard・VersionCardをUI Cardに統一
- 担当表ページの共通UI化とテーマ対応
    `.trim(),
    tags: [],
    createdAt: '2026-02-03T09:58:53.922Z',
    updatedAt: '2026-02-03T10:52:23.082Z',
  },
  {
    id: 'v0.10.2',
    version: '0.10.2',
    date: '2026-02-01',
    type: 'bugfix',
    title: 'SplashScreenのHydrationミスマッチエラーを解消',
    content: `
- SplashScreenのHydrationミスマッチエラーを解消
- 焙煎タイマー関連分割
- PostToolUseフックによるESLint自動整形を導入
- husky + lint-staged によるpre-commitフックを導入
- セキュリティ監査スキルとGitleaksを導入
- dx: 複雑度監視スキル（Lizard）の導入
- dx: Stop Hookによるテスト強制ゲートの導入
- dx: Security Reviewer & QA Agentサブエージェントの導入
- dx: Knipによるデッドコード排除スキルの導入
    `.trim(),
    tags: [],
    createdAt: '2026-02-01T01:09:28.615Z',
    updatedAt: '2026-02-01T08:51:03.475Z',
  },
  {
    id: 'v0.10.1',
    version: '0.10.1',
    date: '2026-01-31',
    type: 'update',
    title: 'Stitchデザインを使用した試飲記録一覧ページのUI改善',
    content: `
- Stitchデザインを使用した試飲記録一覧ページのUI改善
- [#44 #45] カード・ダイアログ統一と背景色・カラーシステム整理
    `.trim(),
    tags: [],
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
- デジタル時計ページの追加とカスタマイズ設定
- React Hooks eslint-disable箇所の見直し
- エラーハンドリング改善（alert→Toast統一）
- Firebase関数とカメラ処理のエラーハンドリングを強化
- security: CORSドメイン制限とセキュリティヘッダーを追加
    `.trim(),
    tags: [],
    createdAt: '2026-01-30T21:17:52.917Z',
    updatedAt: '2026-01-30T23:19:13.842Z',
  },
  {
    id: 'v0.9.1',
    version: '0.9.1',
    date: '2026-01-25',
    type: 'improvement',
    title: 'UI改善・バグ修正・コード整理',
    content: `
- RoastTimer.tsx を責務別に分割してコードを整理
- デバッグ用 console.log を削除
- 試飲感想記録ページのレイアウトシフトを修正
- スマホでもヘッダーキャラクターを表示
- 開発秘話エピソード6を非エンジニア向けに改善
- 📝 Phase 2: フォーム統一（P0: 入力フィールド）
    `.trim(),
    tags: ['UI', 'バグ修正', 'リファクタリング'],
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
    title: 'クイズ自動遷移・バッジデザイン刷新・更新履歴詳細ページ・Vitest導入',
    content: `
## 機能追加
- クイズで正解後に次の問題へ自動遷移する機能を追加
- 更新履歴の詳細表示専用ページを追加
- バッジアイコンをLucideに変更してモダンなデザインに
- ドリップガイドのレシピ表示順序を最適化
- 開発秘話 Episode 006「Claude Codeを使ってみた」を追加
- ホーム画面にカテゴリラベルを追加

## バグ修正
- カテゴリ別クイズで回答後に○×マークが即時反映されない問題を修正
- スマホ画面で「○○時まで」表記がはみ出る問題を修正
- バッジアイコンが正しく表示されない問題を修正

## 開発者向け
- Vitestテストフレームワークを導入
- PRマージ時のバージョン自動更新機能を追加
- ESLintエラー・警告を全て解消
    `.trim(),
    tags: ['クイズ', 'UI', 'テスト', 'CI/CD'],
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
- James Hoffmann V60レシピを追加
- クイズ機能の強化（カテゴリ追加、結果保存）
- 利用規約・プライバシーポリシーの同意機能を実装
- ユーザー同意状態のFirestore管理
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
- Gemini AIによるテイスティング分析機能を追加
- スケジュール画像のOCR読み取り機能
- 開発秘話セクションを追加
- キャラクター対話形式でアプリの成り立ちを紹介
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
    title: '機能整理アップデート',
    content: `
- ナビゲーション構造の見直し
- 未使用機能の整理
- パフォーマンス最適化
    `.trim(),
    tags: ['リファクタリング'],
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
