---
name: roastplus-ui
description: ローストプラスのUI/UXデザインシステム完全リファレンス。CSS変数ベースのセマンティックトークン、共通UIコンポーネント（Button, Card, Modal, Dialog, Input等）のAPI仕様、レイアウトパターン、アニメーション、7テーマ対応システム（data-theme属性+CSS変数で自動切替）を提供。UIページ・コンポーネントの新規作成、既存UIの修正、デザイン一貫性チェック、テーマ対応実装時に使用。
---

# ローストプラス UIデザインシステム

## 基本原則

- **テーマ自動切替**: CSS変数 + `data-theme` 属性で7テーマ自動切替。コンポーネント側でのテーマ判定・prop不要
- **共通コンポーネント必須**: `@/components/ui` を使用。生Tailwindでボタン・カード・入力を作らない
- **セマンティックトークン必須**: `bg-surface`, `text-ink`, `border-edge` 等を使用。ハードコード色（`bg-white`, `text-gray-800`）禁止
- **モーダル背景は `bg-overlay`**: `bg-surface` はダーク系テーマで半透明のため不可
- **アクセシビリティ**: 最小タッチターゲット44px、WCAG AAコントラスト比、`prefers-reduced-motion` 対応

## 共通コンポーネント一覧

```tsx
import {
  Button, IconButton, BackLink, FloatingNav,  // ボタン・ナビ系
  Input, NumberInput, InlineInput,     // 入力系
  Textarea, Select, Checkbox, Switch,  // フォーム系
  Card, Modal, Dialog,                 // コンテナ系
  Badge, RoastLevelBadge,             // バッジ系
  Tabs, TabsList, TabsTrigger, TabsContent,  // タブ系
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,  // アコーディオン
  ProgressBar, EmptyState,            // フィードバック系
} from '@/components/ui';
```

### 主要コンポーネントのvariant一覧

| コンポーネント | variants |
|-------------|---------|
| Button | `primary`, `secondary`, `danger`, `success`, `warning`, `info`, `outline`, `ghost`, `coffee`, `surface`（10種） |
| Card | `default`, `hoverable`, `action`, `coffee`, `table`, `guide`（6種） |
| Badge | `default`, `primary`, `secondary`, `success`, `warning`, `danger`, `coffee`（7種） |

全コンポーネントのProps・variants・使用例は [components.md](references/components.md) を参照。

### 新規コンポーネント追加手順

1. `components/ui/NewComponent.tsx` を作成（CSS変数ベース、forwardRef、min-h-[44px]タッチターゲット）
2. `components/ui/index.ts` にエクスポート追加
3. `components/ui/registry.tsx` にデモとレジストリエントリを追加
4. Developer Design Lab（`/dev/design-lab`）に自動表示

## リファレンスドキュメント

| ファイル | 内容 | 参照タイミング |
|---------|------|---------------|
| [design-tokens.md](references/design-tokens.md) | CSS変数トークン完全一覧（43変数）、Tailwindマッピング、ブランドカラー | 配色・スタイリング時 |
| [components.md](references/components.md) | 全コンポーネントのProps・variants・使用例 | コンポーネント使用時 |
| [layouts.md](references/layouts.md) | ページレイアウト3パターン、ヘッダー、グリッド、スペーシング | ページ新規作成時 |
| [animations.md](references/animations.md) | CSSアニメーション、Tailwindトランジション、Framer Motion | アニメーション実装時 |
| [themes.md](references/themes.md) | テーマ固有カスタマイズ、条件付き装飾の実装方法 | テーマ固有の装飾が必要な場合のみ |
