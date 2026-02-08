# Implementation Guidelines

**最終更新**: 2026-02-07

---

## 目次

1. [開発フロー](#開発フロー)
2. [コーディング規約](#コーディング規約)
3. [UI実装ルール](#ui実装ルール)
4. [テスト戦略](#テスト戦略)
5. [Git運用](#git運用)
6. [ドキュメント運用](#ドキュメント運用)
7. [メンテナンス](#メンテナンス)

---

## 開発フロー

### 標準フロー（探索→計画→コード→コミット型）

```
1. Working Documents参照
   ↓
2. Serena MCPで探索（読み取り専用）
   ↓
3. 「think hard」で計画立案
   ↓
4. Claude Code標準ツール（Edit/Write）で実装
   ↓
5. lint → build → test
   ↓
6. PR作成、Steering更新ドラフト生成
```

#### 1. Working Documents参照
- `docs/working/{Issue番号}/` の4ファイル（requirement, design, tasklist, testing）を参照
- Issue の目的・背景を理解

#### 2. Serena MCPで探索（読み取り専用）
- **使用ツール**: `search_for_pattern`, `get_symbols_overview`, `find_symbol`, `find_referencing_symbols`
- **禁止**: `replace_symbol_body`, `insert_*`, `rename_symbol`（編集はClaude Code標準ツールで）

#### 3. 「think hard」で計画立案
- 複雑な問題、設計判断は「think hard」で深く考える
- 必要に応じて EnterPlanMode で詳細計画

#### 4. 実装
- Claude Code標準ツール（Edit/Write）で実装
- Context7 MCPで最新ドキュメント参照（`resolve-library-id` → `query-docs`）

#### 5. 検証
```bash
npm run lint && npm run build && npm run test
```

#### 6. PR作成
- git-workflow スキルでコミット
- PR作成
- Steering Documents更新ドラフト生成（fix-issue Phase 11）

---

### TDD型フロー（コード変更のデフォルト）

**コード変更を含む実装では、TDDが基本。** 詳細は `/tdd` スキル（`.claude/skills/tdd/SKILL.md`）を参照。

```
1. テスト設計（testing.md or 対象コード分析）
   ↓
2. 🔴 Red: 失敗テスト作成 → コミット
   ↓
3. 🟢 Green: テスト合格する最小実装 → コミット
   ↓
4. 🔵 Refactor: テスト維持したまま改善 → コミット（必要時のみ）
```

**TDD必須の対象**:
- ビジネスロジック実装（`lib/`）
- カスタムフック実装（`hooks/`）
- コンポーネントのロジック部分（`components/`）
- バグ修正（回帰テスト作成）

**TDD対象外**:
- ビジュアル調整のみ → ビジュアル反復型フロー
- `docs/`, `chore` → そのまま編集

#### SDD × TDD 統合フロー

```
/issue-creator                    /fix-issue
┌──────────────┐            ┌───────────────────────┐
│ Issue作成     │            │ Phase 1: Working読込   │
│ Working生成   │───────────→│ Phase 4: 計画承認      │
│  └ testing.md │   ファイル  │ Phase 5: TDD実装      │
│    (テスト設計)│   経由で連携│  └ /tdd の手順に従う   │
└──────────────┘            │ Phase 7: 検証          │
                            └───────────────────────┘
```

- SDDの `testing.md` がTDDのテスト設計インプットになる
- `/clear` 後も `testing.md` にテスト設計が残り、コンテキスト保持

---

### ビジュアル反復型フロー

```
1. UI実装
   ↓
2. Chrome DevTools MCPでスクショ確認
   ↓
3. 改善 → 再度スクショ
   ↓
4. 完成まで反復
```

**使用タイミング**:
- UI調整（レイアウト、配色、アニメーション）
- レスポンシブデザイン確認
- クリスマスモード対応確認

---

## コーディング規約

### 命名規則

| 種類 | 規則 | 例 |
|-----|------|-----|
| コンポーネント | PascalCase | `QuizCard`, `DripTimer` |
| 関数 | camelCase | `calculateXP`, `updateStreak` |
| 変数 | camelCase | `isLoading`, `userData` |
| ブール値 | `is`, `has`, `should` 始まり | `isChristmasMode`, `hasError` |
| 定数 | UPPER_SNAKE_CASE | `CATEGORY_LABELS`, `XP_CONFIG` |
| 型/インターフェース | PascalCase | `QuizQuestion`, `DripRecipe` |
| ファイル（コンポーネント） | PascalCase | `QuizCard.tsx` |
| ファイル（ユーティリティ） | camelCase | `gamification.ts` |

---

### インポート順序

```typescript
// 1. 外部ライブラリ
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 2. ローカルコンポーネント・モジュール（相対パス）
import { QuizOption } from './QuizOption';
import { calculateXP } from '@/lib/coffee-quiz/gamification';

// 3. 型（import type で明示）
import type { QuizQuestion } from '@/lib/coffee-quiz/types';

// 4. 定数
import { CATEGORY_LABELS, DIFFICULTY_STYLES } from '@/lib/coffee-quiz/types';
```

---

### 型定義方針

#### interface を使う場合
- オブジェクトの構造定義
- クラスが実装するコントラクト
- 拡張（extends）が必要な場合

```typescript
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface ExtendedQuestion extends QuizQuestion {
  explanation: string;
}
```

#### type を使う場合
- ユニオン型
- マッピング型（Record, Pick, Omit等）
- 関数型

```typescript
type QuizCategory = 'basics' | 'roasting' | 'extraction' | 'origin';
type QuizDifficulty = 'easy' | 'medium' | 'hard';
type CategoryLabels = Record<QuizCategory, string>;
type OnSelectHandler = (index: number) => void;
```

---

### コンポーネント構成

```typescript
'use client';  // クライアントコンポーネントの場合のみ

import { useState } from 'react';
import type { Props } from './types';

// Props型定義（同ファイルまたは別ファイル）
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// コンポーネント本体
export function ComponentName({ title, onAction }: ComponentProps) {
  // 1. 状態管理
  const [state, setState] = useState(false);

  // 2. 副作用（useEffect等）
  useEffect(() => {
    // ...
  }, []);

  // 3. イベントハンドラ
  const handleClick = () => {
    onAction?.();
  };

  // 4. レンダリング
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
```

---

### コメント

```typescript
// 単行コメント（日本語可）

/**
 * 関数の説明（JSDoc形式）
 * @param value - パラメータの説明
 * @returns 戻り値の説明
 */
function calculateScore(value: number): number {
  // 処理
}

// TODO: 未実装タスク
// FIXME: 修正が必要な箇所
```

**コメントのルール**:
- 自明なコードにはコメント不要
- 複雑なロジックには必ずコメント
- 「なぜ」を書く（「何を」はコードが示す）

---

### Tailwind CSS

- ユーティリティクラスを直接使用
- 繰り返しパターンは変数化（`DIFFICULTY_STYLES`等）
- ブランドカラー: `#211714`（深茶色）

```typescript
const DIFFICULTY_STYLES = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
} as const;
```

### テーマ対応CSS変数ユーティリティ（推奨）

テーマ自動対応が必要な箇所では、ハードコード色の代わりにセマンティックユーティリティを使用:

```tsx
// ✅ 推奨: テーマ自動対応
<div className="bg-page text-ink border-edge">
  <p className="text-ink-sub">補足テキスト</p>
</div>

// ❌ 非推奨: ハードコード色（テーマ切替で色が変わらない）
<div className="bg-white text-gray-800 border-gray-200">
  <p className="text-gray-500">補足テキスト</p>
</div>
```

| ユーティリティ | 用途 |
|--------------|------|
| `bg-page` | ページ背景 |
| `bg-surface` | カード/パネル背景 |
| `bg-overlay` | モーダル背景 |
| `bg-ground` | セクション背景 |
| `bg-field` | 入力フィールド背景 |
| `text-ink` | 本文テキスト |
| `text-ink-sub` | 補足テキスト |
| `text-ink-muted` | 薄いテキスト |
| `border-edge` | 通常ボーダー |
| `border-edge-strong` | 強調ボーダー |
| `bg-spot` / `text-spot` | アクセントカラー |

---

## UI実装ルール

### 共通UIコンポーネント必須

**最重要ルール**: 生のTailwindでボタン・カード・入力を作らない → `@/components/ui` を使用

#### 共通UIコンポーネント一覧

```tsx
import {
  Button, IconButton,           // ボタン系
  Input, NumberInput, InlineInput, Textarea, Select, Checkbox, Switch,  // フォーム系
  Card, Modal, Dialog,          // コンテナ系
  Badge, Tabs, Accordion, ProgressBar, EmptyState  // その他
} from '@/components/ui';
```

#### 使用例

```tsx
// ✅ 正しい
<Button variant="primary" onClick={handleSubmit}>
  保存
</Button>

// ❌ 間違い
<button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
  保存
</button>
```

---

### クリスマスモード対応

**すべてのコンポーネント**に `isChristmasMode` propを渡す。

#### 実装パターン

```tsx
const { isChristmasMode } = useChristmasMode();

<Button variant="primary" isChristmasMode={isChristmasMode}>保存</Button>
<Card variant="table" isChristmasMode={isChristmasMode}>...</Card>
<Input label="名前" isChristmasMode={isChristmasMode} />
```

---

### 新規共通コンポーネント追加時

1. `components/ui/NewComponent.tsx` を作成
2. `components/ui/index.ts` にエクスポート追加
3. `components/ui/registry.tsx` にデモ追加

```tsx
// registry.tsx への追加例
function NewComponentDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return <NewComponent isChristmasMode={isChristmasMode} />;
}

// componentRegistry配列に追加
{
  name: 'NewComponent',
  description: 'コンポーネントの説明',
  category: 'button' | 'form' | 'container' | 'display' | 'feedback',
  Demo: NewComponentDemo,
}
```

→ `/ui-test` ページに自動表示される

---

### レスポンシブデザイン

- **モバイルファースト**: デフォルトはモバイル表示
- **ブレークポイント**: `md`（768px）以上でタブレット/PC向けレイアウト

```tsx
<div className="flex flex-col md:flex-row">
  {/* モバイル: 縦並び、タブレット以上: 横並び */}
</div>
```

---

## テスト戦略

### テスト種別

| 種別 | 対象 | ツール |
|-----|------|--------|
| ユニットテスト | ロジック関数（`lib/`） | Vitest |
| 統合テスト | カスタムフック（`hooks/`） | Vitest + @testing-library/react |
| コンポーネントテスト | UIコンポーネント（`components/`） | Vitest + @testing-library/react |
| E2Eテスト（自動） | ユーザーフロー・レスポンシブ・a11y・パフォーマンス | Playwright + @axe-core/playwright |
| E2Eテスト（手動） | ビジュアル確認 | Chrome DevTools MCP |

---

### カバレッジ目標

| 対象 | 目標 | 現状（2026-02-05） |
|-----|------|-------------------|
| 全体 | 75%以上 | 76.19% |
| `lib/` | 90%以上 | 89.44% |
| `hooks/` | 85%以上 | 87.9% |

---

### ユニットテスト（Vitest）

#### ファイル命名
- `*.test.ts`, `*.test.tsx`

#### 基本パターン

```typescript
import { describe, it, expect } from 'vitest';
import { calculateXP } from '@/lib/coffee-quiz/gamification';

describe('calculateXP', () => {
  it('should calculate correct XP for easy difficulty', () => {
    expect(calculateXP('easy')).toBe(10);
  });

  it('should calculate correct XP for medium difficulty', () => {
    expect(calculateXP('medium')).toBe(20);
  });

  it('should calculate correct XP for hard difficulty', () => {
    expect(calculateXP('hard')).toBe(30);
  });
});
```

---

### 統合テスト（Hooks）

#### 非同期フックのテストパターン

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

test('should handle async operation', async () => {
  const { result } = renderHook(() => useMyHook());

  // isHydrated等の初期化を待つ
  await act(async () => {
    await vi.runAllTimersAsync();
  });

  // テスト実行
  await act(async () => {
    await result.current.someFunction();
  });

  expect(result.current.data).toBe('expected value');
});
```

---

### コンポーネントテスト（Testing Library）

#### 基本パターン

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizCard } from '@/components/coffee-quiz/QuizCard';

test('should render quiz question', () => {
  render(<QuizCard question="What is coffee?" options={['A', 'B']} />);

  expect(screen.getByText('What is coffee?')).toBeInTheDocument();
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.getByText('B')).toBeInTheDocument();
});

test('should call onSelect when option clicked', () => {
  const onSelect = vi.fn();
  render(<QuizCard question="Q" options={['A']} onSelect={onSelect} />);

  fireEvent.click(screen.getByText('A'));

  expect(onSelect).toHaveBeenCalledWith(0);
});
```

---

### E2Eテスト（Playwright）

#### ディレクトリ構成

```
e2e/
├── fixtures/          # カスタムフィクスチャ・テストデータ
│   ├── test-base.ts   # mockFirebase, isRedirectedToLogin
│   └── test-data.ts   # viewports, performanceThresholds
├── pages/             # ページ単位テスト
├── flows/             # ユーザーフロー（複数ページ横断）
├── responsive/        # レスポンシブテスト（mobile/tablet/desktop）
├── accessibility/     # axe-core自動スキャン + キーボードナビゲーション
└── performance/       # ページロード時間・CLS・メモリリーク
```

#### 認証が必要なページのテストパターン

```typescript
import { isRedirectedToLogin } from '../fixtures/test-base';

test('認証済みの場合のみ動作する機能', async ({ page }) => {
  await page.goto('/schedule');
  await page.waitForLoadState('domcontentloaded');

  const isLogin = await isRedirectedToLogin(page);
  test.skip(isLogin, '認証が必要なためスキップ');

  // 認証済みの場合のテスト
});
```

#### コマンド

```bash
npm run test:e2e          # E2Eテスト実行
npm run test:e2e:ui       # UIモードで実行
npm run test:e2e:report   # レポート表示
```

---

### 重要なテストパターン

#### vi.mock の hoisting 問題

```typescript
// ❌ NG
const MOCK_DATA = { value: 123 };
vi.mock('@/module', () => ({ data: MOCK_DATA }));

// ✅ OK
vi.mock('@/module', () => ({ data: { value: 123 } }));
```

#### デバウンス処理のテスト

```typescript
vi.useFakeTimers();

await act(async () => {
  await debouncedFunction();
});

await act(async () => {
  vi.advanceTimersByTime(1000); // デバウンス時間
  await vi.runAllTimersAsync();
});
```

#### モックパスの完全一致

```typescript
// 実際のimportパス
import { fsrs } from '@/lib/coffee-quiz/fsrs';

// モックパス（完全一致必須）
vi.mock('@/lib/coffee-quiz/fsrs', () => ({
  fsrs: vi.fn(),
}));
```

詳細は `C:\Users\kensa\.claude\projects\D--Dev-roastplus\memory\MEMORY.md` 参照

---

### テスト実行コマンド

```bash
# すべてのテスト実行
npm run test

# カバレッジ付き
npm run test -- --coverage

# 特定ファイルのみ
npm run test -- gamification.test.ts

# ウォッチモード
npm run test -- --watch
```

---

## Git運用

### ブランチ戦略

- **mainブランチ**: 本番反映ブランチ
- **トピックブランチ**: `fix/#123-xxx`, `feat/#123-xxx`
- **⚠️ mainへの直接コミット禁止**

---

### コミットメッセージ（コンベンショナルコミット）

```
<type>(<scope>): <日本語で50文字以内の説明>

<body: 変更点を箇条書き>

Closes #123

Co-Authored-By: Claude <noreply@anthropic.com>
```

#### タイプ

| タイプ | 用途 | 例 |
|--------|------|-----|
| `feat` | 新機能 | feat(auth): ログイン機能を追加 |
| `fix` | バグ修正 | fix(timer): タイマー停止問題を修正 |
| `refactor` | リファクタリング | refactor(utils): ヘルパー関数を整理 |
| `docs` | ドキュメント | docs(readme): セットアップ手順を追加 |
| `style` | コードスタイル | style: フォーマットを統一 |
| `perf` | パフォーマンス | perf(render): 描画速度を最適化 |
| `test` | テスト | test(api): APIテストを追加 |
| `chore` | ビルド・設定 | chore(deps): 依存関係を更新 |
| `ci` | CI/CD | ci(github): ワークフローを追加 |

#### スコープ例
- コンポーネント名: `header`, `modal`
- 機能名: `auth`, `timer`, `quiz`
- レイヤー名: `api`, `ui`

---

### PR作成

```bash
# 1. コミット（git-workflowスキル使用推奨）
git add .
git commit -m "feat(quiz): FSRS機能を追加"

# 2. プッシュ
git push -u origin fix/#123-xxx

# 3. PR作成
cat > /tmp/pr-body.md <<'EOF'
## 概要
Issue #123 を解決。

## 変更内容
- 変更点1
- 変更点2

## テスト
- [x] lint / build / test 通過
- [ ] 実機動作確認

Closes #123
EOF

gh pr create --base main --title "[Issue #123] タイトル" --body-file /tmp/pr-body.md
```

---

### セマンティックバージョニング

`MAJOR.MINOR.PATCH` — package.jsonの`version`フィールドを更新。

| 変更種別 | バージョン | コマンド |
|----------|-----------|---------|
| 破壊的変更 | MAJOR | `npm version major` |
| 新機能 | MINOR | `npm version minor` |
| バグ修正 | PATCH | `npm version patch` |

---

## ドキュメント運用

### Steering Documents（永続化ドキュメント）

**場所**: `docs/steering/`

| ドキュメント | 更新タイミング |
|-------------|--------------|
| PRODUCT.md | プロダクト方針変更時 |
| FEATURES.md | 新機能追加時 |
| TECH_SPEC.md | 技術スタック変更時 |
| REPOSITORY.md | リポジトリ構造変更時 |
| GUIDELINES.md | 実装パターン変更時（本ファイル） |
| UBIQUITOUS_LANGUAGE.md | 新規用語追加時 |

**更新方法**:
1. PR完了後、AIがドラフト生成（fix-issue Phase 11）
2. ユーザーが確認・承認
3. Gitコミット

---

### Working Documents（作業用ドキュメント）

**場所**: `docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/`

| ファイル | 役割 |
|---------|------|
| requirement.md | 要件定義 |
| design.md | 設計書 |
| tasklist.md | タスクリスト |
| testing.md | テスト計画 |

**生成**: `/create-spec` スキルで自動生成（AIが80%ドラフト、ユーザーが修正）
**更新**: 実装中に逐次更新
**保管**: PR完了後もGit保管（削除しない）

---

### EnterPlanModeとの使い分け

| 項目 | Working Documents | EnterPlanMode |
|-----|-------------------|---------------|
| **永続性** | Git保管（永続的） | 一時的 |
| **スコープ** | Issue単位 | 複雑な実装の詳細計画 |
| **生成** | /create-spec で自動 | 手動で実行 |
| **用途** | 設計メモ、コンテキスト保持 | 実装前の詳細検討 |

**併用推奨**: Working生成後、複雑な実装は EnterPlanMode で詳細計画

---

## メンテナンス

### 定期実行タスク

- **週次**: `project-maintenance` スキル実行（複雑度・セキュリティ・デッドコード監査）
- **PR作成前**: 必ず統合監査実行
- **リリース前**: 総合チェック
- **月次**: Steering Documents レビュー

---

### リファクタリング優先順位

1. **セキュリティ問題**（最優先）
   - シークレット漏洩
   - Critical/High脆弱性

2. **複雑度が極めて高い関数（CCN 51+）**
   - 即座に分割すべき

3. **複雑度が高い関数（CCN 26-50）**
   - 計画的にリファクタリング

4. **デッドコード（中優先度）**
   - 未使用依存関係・ファイル

5. **デッドコード（低優先度）**
   - 未使用エクスポート（バレルファイル経由の可能性あり）

---

### 現在のリファクタリング対象（2026-02-05）

| ファイル | 関数名 | CCN | NLOC | 優先度 |
|---------|--------|-----|------|--------|
| `assignment-table/DesktopTableView.tsx` | `DesktopTableView` | 125 | 289 | 最優先 |
| `assignment-table/TableModals.tsx` | `TableModals` | 117 | 414 | 最優先 |
| `coffee-trivia/stats/page.tsx` | `(anonymous)` | 97 | 193 | 高 |

---

### リファクタリング手法

#### 複雑度削減の手法

1. **ガード節の導入** - 早期リターンでネストを削減
2. **関数の抽出** - 一つの責務に分割
3. **ストラテジーパターン** - 条件分岐をポリモーフィズムで置換
4. **テーブル駆動** - switch/if-else チェーンをマップに変換
5. **コンポーネント分割** - 巨大なReactコンポーネントを子コンポーネントに分離

#### セキュリティ問題の対応

- **シークレット漏洩**: `.env.local` に移動、`.gitignore` に追加、Git履歴から削除
- **脆弱性**: `npm audit fix` で修正、必要に応じて手動更新

#### デッドコードの削除

- **未使用依存関係**: `npm uninstall <package>`
- **未使用ファイル**: 確認後に削除
- **未使用エクスポート**: バレルファイル経由でないか確認後に削除

---

## 参照

- **プロダクトビジョン**: `docs/steering/PRODUCT.md`
- **リポジトリ構造**: `docs/steering/REPOSITORY.md`
- **技術仕様**: `docs/steering/TECH_SPEC.md`
- **ユビキタス言語**: `docs/steering/UBIQUITOUS_LANGUAGE.md`
- **機能一覧**: `docs/steering/FEATURES.md`
- **ADR**: `docs/memory.md`
- **テスト実装の学び**: `C:\Users\kensa\.claude\projects\D--Dev-roastplus\memory\MEMORY.md`
