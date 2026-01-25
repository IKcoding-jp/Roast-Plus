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
    id: 'v0.9.0',
    version: '0.9.0',
    date: '2026-01-25',
    type: 'feature',
    title: '再利用可能なUIコンポーネントライブラリを追加',
    content: `
## Summary

- \`.claude/skills/roastplus-ui/components.md\` のデザインパターンに準拠したUIコンポーネントを作成
- 通常モードとクリスマスモードの両方に対応
- アクセシビリティを考慮（最小タッチサイズ44px、フォーカスリング、aria属性）

## 作成したコンポーネント

### components/ui/
| コンポーネント | 説明 |
|---------------|------|
| \`Button.tsx\` | 5 variants (primary, secondary, danger, outline, ghost) × 3 sizes (sm, md, lg) |
| \`Input.tsx\` | テキスト入力（ラベル、エラー表示対応） |
| \`Select.tsx\` | ドロップダウン選択 |
| \`Textarea.tsx\` | 複数行テキスト入力 |
| \`Card.tsx\` | 3 variants (default, hoverable, action) |
| \`index.ts\` | 統一インポート用エクスポート |

### その他
- \`docs/UI_AUDIT.md\` - UI一貫性監査レポート
- \`app/ui-test/page.tsx\` - コンポーネントテストページ（/ui-test でアクセス可能）

## 使用方法

\`\`\`tsx
import { Button, Input, Select, Textarea, Card } from '@/components/ui';
import { useChristmasMode } from '@/hooks/useChristmasMode';

function MyForm() {
  const { isChristmasMode } = useChristmasMode();

  return (
    <Card isChristmasMode={isChristmasMode}>
      <Input label="名前" isChristmasMode={isChristmasMode} />
      <Button variant="primary" isChristmasMode={isChristmasMode}>
        送信
      </Button>
    </Card>
  );
}
\`\`\`

## Test plan

- [x] 開発サーバーで動作確認（\`npm run dev\`）
- [x] すべてのButton variants表示確認
- [x] すべてのButton sizes表示確認
- [x] Button states (disabled, loading, fullWidth) 動作確認
- [x] Input（ラベル、プレースホルダー、エラー）動作確認
- [x] Select ドロップダウン動作確認
- [x] Textarea 動作確認
- [x] Card variants 表示確認
- [x] クリスマスモード切り替え動作確認
- [x] コンソールエラーなし確認

## Related Issues

Closes #41 (Phase 1: UIコンポーネント基盤作成)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
    `.trim(),
    tags: [],
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
