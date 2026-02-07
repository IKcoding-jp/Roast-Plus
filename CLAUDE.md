# RoastPlus - Project Rules

## Overview
コーヒー焙煎・抽出業務支援アプリ（Next.js PWA）

## Tech Stack
- Next.js 16 (App Router) / React 19 / TypeScript 5
- Tailwind CSS v4 / Framer Motion / Lottie
- Firebase (Auth, Firestore, Storage)

## Workflows

3つの基本ワークフローがあります。詳細は「## 理想のワークフロー（SDD運用時）」を参照。

### 1. 探索→計画→コード→コミット型（標準）
ファイル読み込み → 計画立案 → 実装・検証 → PR作成

### 2. TDD型
テスト作成 → 実装 → テスト合格まで反復 → コミット

### 3. ビジュアル反復型
Chrome DevTools MCPでスクショ確認しながらUI改善

## Documentation Policy

### Steering Documents（永続化ドキュメント）

**場所**: `docs/steering/`

プロジェクト全体の設計指針を定義する6種類のドキュメント:

| ドキュメント | 内容 | 参照タイミング |
|-------------|------|---------------|
| **PRODUCT.md** | プロダクトビジョン、コアバリュー、スコープ | Issue理解時 |
| **FEATURES.md** | 全機能の詳細仕様、UI実装ルール、禁止事項 | 機能実装時（最重要） |
| **TECH_SPEC.md** | 技術スタック、アーキテクチャ、ADR参照 | 技術選定時 |
| **REPOSITORY.md** | ディレクトリ構造、ファイル命名規則 | ファイル配置時 |
| **GUIDELINES.md** | 実装ガイドライン、コーディング規約 | コード作成時 |
| **UBIQUITOUS_LANGUAGE.md** | ドメイン用語定義、命名規則 | 命名時 |

**重要**: AIは `/clear` 後もSteering Documentsを参照することで、プロジェクトの設計を完全に理解できる。

### Working Documents（作業用ドキュメント）

**場所**: `docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/`

Issue単位の仕様書。4ファイル固定:

| ファイル | 内容 |
|---------|------|
| **requirement.md** | 要件定義、ユーザーストーリー、受け入れ基準 |
| **design.md** | 設計書、変更対象ファイル、禁止事項チェック |
| **tasklist.md** | タスク分割、依存関係、見積もり |
| **testing.md** | テスト計画、テストケース、カバレッジ目標 |

**生成**: `/create-spec` スキルで自動生成（AIが80%ドラフト、ユーザーが確認・修正）
**更新**: 実装中に逐次更新（設計変更、タスク完了時）
**保管**: PR完了後もGit保管（削除しない、過去の設計判断の記録）

### EnterPlanModeとの使い分け

| 項目 | Working Documents | EnterPlanMode |
|------|------------------|---------------|
| 永続性 | ✅ Git保管 | ❌ 一時的 |
| スコープ | Issue単位 | 実装の詳細計画 |
| 用途 | 永続的な設計メモ | 複雑な実装の事前検討 |

**併用推奨**: Working生成後、複雑な実装はEnterPlanModeで詳細計画を立案。

## Thinking Keywords
| キーワード | 用途 |
|-----------|------|
| `think` | 通常の推論 |
| `think hard` | 複雑な問題、設計判断 |
| `ultrathink` | 最も困難なアーキテクチャ決定 |

## Tool Usage Policy

### Serena MCP（探索専用）
**探索のみ使用。編集にはClaude Code標準ツールを使う。**

| 用途 | 使用可否 | ツール |
|------|----------|--------|
| シンボル構造の把握 | ✅ | `get_symbols_overview`, `find_symbol` |
| 参照箇所の追跡 | ✅ | `find_referencing_symbols` |
| パターン検索 | ✅ | `search_for_pattern` |
| コード編集 | ❌ | `replace_symbol_body`, `insert_*`, `rename_symbol` |

**理由**: 編集はClaude Codeのネイティブツール（Edit/Write）の方が安定・高速。MCP依存を減らすことでトラブルシューティングも容易。

**例外**: 大規模リファクタリングでシンボル名の一括リネームが必要な場合のみ `rename_symbol` を検討可。

### Context7 MCP（実装時）
`resolve-library-id` → `query-docs` で最新ドキュメント参照

### Chrome DevTools MCP（動作確認）
`navigate_page` → `take_snapshot` → 操作 → `take_screenshot`

## Steering Documents参照ルール

実装前に必ず以下のSteering Documentsを参照すること:

### Issue取得時（fix-issue Phase 1）
- **FEATURES.md** - 関連機能の確認

### Working Documents生成時（/create-spec）
- **PRODUCT.md** - プロダクトビジョン
- **FEATURES.md** - 関連機能の仕様
- **UBIQUITOUS_LANGUAGE.md** - 用語統一
- **GUIDELINES.md** - 実装パターン

### 実装時（fix-issue Phase 5）
- **TECH_SPEC.md** - 技術仕様
- **REPOSITORY.md** - ファイル配置
- **GUIDELINES.md** - コーディング規約

### PR完了時（fix-issue Phase 11.5）
- **全Steering Documents** - 更新が必要か判断

**コンテキスト喪失防止**: `/clear` 実行後も、Steering Documentsを参照することでプロジェクトの全体像を理解できる。

## Code Style
- ディレクトリ: `app/`, `components/`, `lib/`, `hooks/`, `types/`
- 命名: PascalCase（コンポーネント）, camelCase（関数）, UPPER_SNAKE_CASE（定数）
- 型定義: interface優先、ユニオン型はtype
- 詳細は `docs/coding-standards.md` 参照

## UI Component Rules（重要）

**UI作成・編集時は必ず `@/components/ui` の共通コンポーネントを使用すること。**

### 共通コンポーネント一覧
```tsx
import {
  Button, IconButton,           // ボタン系
  Input, NumberInput, InlineInput, Textarea, Select, Checkbox, Switch,  // フォーム系
  Card, Modal, Dialog,          // コンテナ系
  Badge, Tabs, Accordion, ProgressBar, EmptyState  // その他
} from '@/components/ui';
```

### ルール
1. **生のTailwindでボタン/カード/入力を作らない** → 共通コンポーネントを使用
2. **テーマ対応はCSS変数で自動** → `isChristmasMode` propは不要（`data-theme`属性で自動切替）
3. **配色** → `.claude/skills/roastplus-ui/references/color-schemes.md` 参照
4. **既存で対応不可の場合** → `components/ui/` に新規共通コンポーネントを作成
5. **共通コンポーネントの重複禁止** → 作成前に既存コンポーネントを必ず確認
6. **モーダル背景は `bg-overlay`** → `bg-surface` はクリスマスモードで透過するため使用禁止

### 新規コンポーネント追加時（レジストリ方式）
新しい共通UIコンポーネントを作成した場合、**必ず以下の手順で登録すること**：

1. `components/ui/NewComponent.tsx` を作成
2. `components/ui/index.ts` にエクスポートを追加
3. `components/ui/registry.tsx` に以下を追加：
   - デモコンポーネント（`NewComponentDemo`関数）
   - `componentRegistry`配列にエントリを追加（name, description, category, Demo）

```tsx
// registry.tsx への追加例
function NewComponentDemo() {
  return <NewComponent />;
}

// componentRegistry配列に追加
{
  name: 'NewComponent',
  description: 'コンポーネントの説明',
  category: 'button' | 'form' | 'container' | 'display' | 'feedback',
  Demo: NewComponentDemo,
}
```

→ UIテストページ（`/ui-test`）に自動表示される

### テーマ対応（CSS変数方式）
テーマ切替は `data-theme` 属性 + CSS変数で自動適用。コンポーネント側でのテーマ判定は不要。
```tsx
// テーマは自動適用。propは不要
<Button variant="primary">保存</Button>
<Card variant="table">...</Card>
<Input label="名前" />
```

### CSS変数の使い分け（重要）
| 変数 | 通常モード | クリスマスモード | 用途 |
|------|-----------|----------------|------|
| `bg-surface` | `#FFFFFF` | `rgba(255,255,255,0.05)` | カード・セクション（半透明OK） |
| `bg-overlay` | `#FFFFFF` | `#0a2f1a` | モーダル・ダイアログ（不透明必須） |
| `bg-ground` | `#F3F4F6` | `rgba(255,255,255,0.08)` | ページ背景・テーブルヘッダー |

## Testing
- **推奨**: Vitest
- テストファイル: `*.test.ts`, `*.test.tsx`
- 詳細は `docs/testing-strategy.md` 参照

## Commands
```bash
npm run dev      # 開発サーバー
npm run build    # ビルド
npm run lint     # Lint
npm run test     # テスト（Vitest導入後）
```

## 理想のワークフロー（SDD運用時）

### 新機能開発の流れ

```
1. /issue-creator（ハイブリッド型）
   - 規模判定 → 規模に応じた調査 → Issue作成
   - AIが規模に応じてWorking Documents生成を判断
   ↓
2. /fix-issue（11フェーズ・確認ポイント3つ）
   - Phase 1: Working読み込み
   - Phase 3: Issue説明（エンジニア初心者向け、コードなし）🔹①
   - Phase 4: 計画（毎回ユーザー承認）🔹②
   - Phase 5: 実装
   - Phase 6: 要件確認（承認ループ）🔹③
   - Phase 7: 検証（自動）
   - Phase 8: 動作確認（手動/自動選択）
   - Phase 9: 独立レビュー（別AIエージェント）
   - Phase 10: Steering更新
   - Phase 11: コミット→PR→自動マージ（全自動）
```

### セッション途中の引き継ぎ

新しいセッション開始時、以下を参照してコンテキストを回復:

1. **`docs/steering/`** - プロジェクト全体の理解
2. **`docs/working/{最新}/`** - 進行中のIssueの設計
3. **`git log`** - 最新のコミット履歴

**コンテキストを忘れない仕組み = SDD（仕様駆動開発）**

### スキル連携フロー

| スキル | タイミング | 役割 |
|--------|-----------|------|
| **/issue-creator** | 作業開始時 | Issue作成 + 規模に応じてWorking生成 |
| **/create-spec** | 手動実行時 | 既存IssueへのWorking Documents生成 |
| **/fix-issue** | 実装開始時 | Working読込→実装→独立レビュー→PR→自動マージ |
| **/git-workflow** | コミット時 | Workingからスコープ自動抽出 |
| **/project-maintenance** | 定期実行時 | リファクタリングIssue + Working自動生成 |

## Development Flow
1. **Issue作成** → 機能追加・修正の起点（Claudeが作成）
2. **ブランチ作成** → `feat/#123-xxx`、`fix/#123-xxx`
3. **実装 → 要件確認（承認ループ）**
4. **検証（自動） → 動作確認（選択式） → 独立レビュー**
5. **コミット → PR作成 → 自動マージ（CI通過後）**

⚠️ **mainブランチへの直接コミット禁止**

## Git & GitHub CLI
- **ベースブランチ**: `main`
- Issue/PR作成時は `--body-file` で一時ファイルを使用（バッククォート問題回避）

## Shortcuts
| キー | 機能 |
|-----|------|
| `Escape` | 現在の生成を中断 |
| `Ctrl+Esc` | 全応答を中止、履歴遡行 |
| `/clear` | コンテキストリセット |
| `/compact` | 長いセッションを圧縮 |

## Project Memory

### Steering Documents（最優先）

プロジェクトの永続的な設計記録:

- **`docs/steering/PRODUCT.md`** - プロダクトビジョン
- **`docs/steering/FEATURES.md`** - 全機能の詳細仕様
- **`docs/steering/TECH_SPEC.md`** - 技術仕様、ADR参照
- **`docs/steering/REPOSITORY.md`** - リポジトリ構造
- **`docs/steering/GUIDELINES.md`** - 実装ガイドライン
- **`docs/steering/UBIQUITOUS_LANGUAGE.md`** - ドメイン用語定義

### 過去の設計記録

- **`docs/memory.md`** - ADR参照リンク（Steering Documentsへの移行済み）
- **`docs/coding-standards.md`** - 参照リンク（GUIDELINES.mdへの移行済み）

### Working Documents

- **`docs/working/`** - 過去のIssue仕様書（Git保管、削除しない）

**重要な設計判断を行った際**:
1. 該当するSteering Documentを更新（FEATURES.md, TECH_SPEC.md等）
2. PR作成前、fix-issue Phase 10で更新ドラフトを生成
3. ユーザー承認後にコミット

## Ignored Directories
`node_modules/`, `.next/`, `out/`, `.git/`, `coverage/`, `public/sounds/`, `public/lottie/`
