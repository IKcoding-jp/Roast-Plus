# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

コーヒー焙煎・抽出業務支援PWAアプリ。8名のチームで毎日使われている現場発の業務効率化ツール。

**Tech Stack**: Next.js 16 (App Router) / React 19 / TypeScript 5 / Tailwind CSS v4 / Framer Motion / Firebase (Auth, Firestore, Storage, Cloud Functions) / OpenAI GPT-4o (Cloud Functions経由)

## Architecture

```
クライアント（PWA, 静的エクスポート）
  Next.js 16 + React 19 + TypeScript 5
  ├── Tailwind CSS v4 + Framer Motion（UI/アニメーション）
  ├── Firebase SDK（Auth, Firestore, Storage）
  └── httpsCallable → Cloud Functions（AI処理）
        ↓
Firebase（BaaS）
  ├── Authentication（Google, Email/Password）
  ├── Firestore（NoSQL, リアルタイム同期, オフラインキャッシュ）
  ├── Storage（画像ファイル）
  ├── Cloud Functions v2（サーバーレスAI処理）
  │     ├── ocrScheduleFromImage（GPT-4o Vision OCR）
  │     └── analyzeTastingSession（GPT-4o テキスト分析）
  │     └── OPENAI_API_KEY: Firebase Secret Manager管理
  └── Hosting / Vercel（デプロイ先）
```

### 重要なアーキテクチャ特性

- **静的エクスポート**: 本番ビルドは `output: 'export'`。Next.js API Routesは使用不可
- **AI処理はCloud Functions経由**: AI機能（OCR、テイスティング分析）はFirebase Cloud Functions v2経由でOpenAI GPT-4oを呼び出す。クライアントにAPIキーを持たない
- **テーマシステム**: `next-themes` + CSS変数（`data-theme`属性）で6テーマ対応。コンポーネント側でのテーマ判定は不要
- **モジュール境界**: `types/ → lib/ → hooks/ → components/ → app/`（循環依存禁止）
- **状態管理**: React useState のみ（Zustand/Redux不使用）
- **カスタムService Worker**: `public/sw.js` に手書き実装（next-pwa不使用）。Network First戦略

### 主要機能

| 機能 | パス | 概要 |
|------|------|------|
| 担当表 | `app/assignment/` | 作業分担の自動割り当て（シャッフルロジック） |
| 焙煎タイマー | `app/roast-timer/` | 焙煎時間計測、温度記録OCR |
| ドリップガイド | `app/drip-guide/` | レシピガイド（4:6メソッド等）、音声案内 |
| コーヒークイズ | `app/coffee-trivia/` | FSRS間隔反復学習、XP・ストリーク |
| テイスティング | `app/tasting/` | フレーバーホイール5軸評価、AI分析 |
| スケジュール | `app/schedule/` | 業務予定のOCR読み取り |

## Commands

```bash
# 開発
npm run dev                    # 開発サーバー（localhost:3000）
npm run build                  # プロダクションビルド（静的エクスポート）
npm run lint                   # ESLint実行

# テスト
npm run test                   # Vitest ウォッチモード（TDD向け）
npm run test:run               # Vitest 1回実行（CI向け）
npm run test:coverage          # カバレッジレポート生成
npx vitest run path/to/file.test.ts  # 特定ファイルのみ実行

# E2Eテスト（Playwright）
npm run test:e2e               # E2Eテスト実行
npm run test:e2e:ui            # UIモード
npm run test:e2e:report        # レポート表示

# 品質チェック
npm run security               # npm audit（脆弱性検出）
npm run complexity             # Lizard（循環的複雑度チェック、CCN 15超 / 50行超を検出）
npm run deadcode               # Knip（デッドコード検出）
npm run skill:validate         # UIスキルとソースコードの整合性検証
npm run maintenance            # 上記4つを統合実行

# デプロイ
npm run deploy:prod            # 本番デプロイ（firebase use default → build → deploy）
npm run deploy:dev             # 開発環境デプロイ

# その他
npm run generate:sound-list    # 音声ファイルリスト自動生成（dev/buildで自動実行）
npm run remotion:studio        # Remotion Studio起動
```

### 検証コマンド（実装完了時に必ず実行）

```bash
npm run lint && npm run build && npm run test:run
```

## Workflows

**コード変更はTDDが基本。** SDD（仕様駆動）でコンテキスト保持、TDD（テスト駆動）で品質保証。

### 1. SDD × TDD型（コード変更のデフォルト）
Working Documents参照 → テスト設計 → 🔴Red → 🟢Green → 🔵Refactor → 検証 → PR
詳細は `superpowers:test-driven-development` スキル参照

### 2. ビジュアル反復型（UI調整のみ）
Playwright MCPまたはChrome DevTools MCPでスクショ確認しながらUI改善

### 3. フロントエンドデザイン生成時
**UIページ・コンポーネントのデザインを新規生成する際は、必ず `/frontend-design` スキルを使用すること。**
- 汎用的な「AIっぽい」デザイン（Inter/Roboto、紫グラデーション等）を避ける
- 大胆で独自性のあるデザイン方向性を選択する

## Documentation Policy

### Steering Documents（永続化ドキュメント）

**場所**: `docs/steering/`　— `/clear` 後のコンテキスト回復の起点

| ドキュメント | 内容 | 参照タイミング |
|-------------|------|---------------|
| **PRODUCT.md** | プロダクトビジョン、コアバリュー、スコープ | Issue理解時 |
| **FEATURES.md** | 全機能の詳細仕様、UI実装ルール、禁止事項 | 機能実装時（最重要） |
| **TECH_SPEC.md** | 技術スタック、アーキテクチャ、ADR | 技術選定時 |
| **REPOSITORY.md** | ディレクトリ構造、ファイル命名規則 | ファイル配置時 |
| **GUIDELINES.md** | 実装ガイドライン、コーディング規約 | コード作成時 |
| **UBIQUITOUS_LANGUAGE.md** | ドメイン用語定義、命名規則 | 命名時 |

### Working Documents（作業用ドキュメント）

**場所**: `docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/`

Issue単位の仕様書。最大4ファイル:
- **requirement.md**（必須） — 要件定義、受け入れ基準
- **tasklist.md**（必須） — タスク分割、依存関係
- **design.md**（複雑なタスク） — 設計書、変更対象ファイル
- **testing.md**（複雑なタスク） — テスト計画、カバレッジ目標

**生成**: `/create-spec` スキル or `/issue-creator` で自動生成
**保管**: PR完了後もGit保管（削除しない）

### EnterPlanModeとの使い分け

Working Documentsは永続的な設計メモ（Git保管）。EnterPlanModeは一時的な詳細計画。
**併用推奨**: Working生成後、複雑な実装はEnterPlanModeで詳細計画を立案。

## Plugins & MCP

### プラグイン一覧

| プラグイン | 用途 | 使用タイミング |
|-----------|------|---------------|
| **context7** | ライブラリ最新ドキュメント参照 | `resolve-library-id` → `query-docs` |
| **serena** | コード解析・シンボル探索（**探索のみ、編集禁止**） | `get_symbols_overview`, `find_symbol`, `find_referencing_symbols` |
| **superpowers** | TDD・デバッグ・レビュー・プラン | 下記参照 |
| **playwright** | ブラウザ自動操作・スクリーンショット | UI検証・E2Eテスト |
| **firebase** | Firebase実操作（Auth, Firestore, Functions等） | Firebase管理操作・デプロイ時 |
| **frontend-design** | UIデザイン生成 | 新規UI作成時 |

### superpowers（主要スキル）

| スキル | 用途 |
|--------|------|
| `superpowers:test-driven-development` | TDDサイクル（Red→Green→Refactor） |
| `superpowers:systematic-debugging` | 仮説→検証→修正の体系的デバッグ |
| `superpowers:writing-plans` | 実装計画の策定 |
| `superpowers:requesting-code-review` | 完了時のレビュー依頼（fix-issue Phase 9） |
| `superpowers:verification-before-completion` | 完了宣言前の検証（コミット・PR前に必ず実行） |

### Serena利用制限

| 用途 | 可否 |
|------|------|
| シンボル探索・参照追跡 | ✅ |
| パターン検索 | ✅ |
| **コード編集** | ❌（Claude Code標準ツールEdit/Writeを使用） |

## Steering Documents参照ルール

実装前に必ず以下のSteering Documentsを参照すること:

| タイミング | 参照ドキュメント |
|-----------|----------------|
| Issue取得時 | FEATURES.md |
| Working生成時 | PRODUCT.md, FEATURES.md, UBIQUITOUS_LANGUAGE.md, GUIDELINES.md |
| 実装時 | TECH_SPEC.md, REPOSITORY.md, GUIDELINES.md |
| PR完了時（Phase 10） | **全6 Steering Documents 必須レビュー**（変更なしにも理由明記） |

## UI Component Rules（重要）

**UI作成・編集時は必ず `@/components/ui` の共通コンポーネントを使用すること。**

```tsx
import {
  Button, IconButton,           // ボタン系
  Input, NumberInput, InlineInput, Textarea, Select, Checkbox, Switch,  // フォーム系
  Card, Modal, Dialog,          // コンテナ系
  Badge, Tabs, Accordion, ProgressBar, EmptyState  // その他
} from '@/components/ui';
```

### 必須ルール
1. **生のTailwindでボタン/カード/入力を作らない** → 共通コンポーネントを使用
2. **テーマ対応はCSS変数で自動** → テーマ関連のpropは不要（`data-theme`属性で6テーマ自動切替）
3. **モーダル背景は `bg-overlay`** → `bg-surface` はダークテーマで半透明のため使用禁止
4. **共通コンポーネントの重複禁止** → 作成前に既存コンポーネントを必ず確認
5. **配色** → `.claude/skills/roastplus-ui/references/design-tokens.md` 参照

### 新規コンポーネント追加時（レジストリ方式）
1. `components/ui/NewComponent.tsx` を作成
2. `components/ui/index.ts` にエクスポートを追加
3. `components/ui/registry.tsx` にデモコンポーネントとエントリを追加
→ Developer Design Lab（`/dev/design-lab`）に自動表示

### テーマ対応CSS変数

テーマ切替は `data-theme` 属性 + CSS変数で自動適用。セマンティックユーティリティを使用:
- 背景: `bg-page`, `bg-surface`, `bg-overlay`, `bg-ground`, `bg-field`
- テキスト: `text-ink`, `text-ink-sub`, `text-ink-muted`
- ボーダー: `border-edge`, `border-edge-strong`
- アクセント: `bg-spot`, `text-spot`

⚠️ **ハードコード色（`bg-white`, `text-gray-800`等）はテーマ切替で色が変わらないため非推奨**

## Quality Gates（技術的負債防止）

### 実装時の必須チェック
1. **Lintエラー・warningは常にゼロを維持** — 発見次第すべて修正
2. **新規コード変更にはテストを書く**（TDD必須: lib/, hooks/, components/のロジック部分）
3. **型チェック通過** — `strict: true` を維持
4. **コミット前に `npm run lint && npm run build && npm run test:run` を実行**

### カバレッジ目標
| 対象 | 目標 |
|------|------|
| 全体 | 75%以上 |
| lib/ | 90%以上 |
| hooks/ | 85%以上 |

### セキュリティ
- **APIキー・シークレットのコミット禁止** — `.env.local` に配置、`.gitignore` に含まれていることを確認
- **Firebase設定（`NEXT_PUBLIC_*`）はクライアントに公開される** — Firestore Security Rulesで保護
- **Firestore Security Rules変更時は慎重に** — 認証必須、ユーザースコープを維持
- **依存関係の脆弱性** — `npm run security` で定期チェック

### リファクタリング優先順位
1. セキュリティ問題（最優先）
2. 循環的複雑度 CCN 51+（即座に分割）
3. 循環的複雑度 CCN 26-50（計画的リファクタリング）
4. デッドコード

## Development Flow

1. **Issue作成** → `/issue-creator`（規模に応じてWorking Documents自動生成）
2. **ブランチ作成** → `feat/#123-xxx`、`fix/#123-xxx`
3. **実装** → TDDサイクル（Red→Green→Refactor）
4. **検証** → lint / build / test
5. **独立レビュー** → 別AIエージェントによるコードレビュー
6. **Steering更新** → 設計変更があれば該当ドキュメントを更新
7. **コミット → PR作成 → 自動マージ**

⚠️ **mainブランチへの直接コミット禁止**

### Git運用
- **ベースブランチ**: `main`
- **コミットメッセージ**: コンベンショナルコミット形式（日本語）
- **PR作成時**: `--body-file` で一時ファイルを使用（バッククォート問題回避）
- **pre-commit hook**: Husky + lint-staged（ESLint自動修正）

## SDD ワークフロー（スキル連携）

| スキル | タイミング | 役割 |
|--------|-----------|------|
| **/issue-creator** | 作業開始時 | Issue作成 + Working生成 |
| **/create-spec** | 手動実行時 | 既存IssueへのWorking生成 |
| **/fix-issue** | 実装開始時 | Working読込→実装→レビュー→PR→自動マージ |
| **/roastplus-ui** | UI実装時 | デザインシステム参照 |
| **/nextjs-firestore** | Firebase実装時 | CRUD・Auth・リアルタイムパターン |

### セッション途中の引き継ぎ（`/clear` 後）

1. **`docs/steering/`** — プロジェクト全体の理解
2. **`docs/working/{最新}/`** — 進行中のIssueの設計
3. **`git log`** — 最新のコミット履歴

## Thinking Keywords

| キーワード | 用途 |
|-----------|------|
| `think` | 通常の推論 |
| `think hard` | 複雑な問題、設計判断 |
| `ultrathink` | 最も困難なアーキテクチャ決定 |

## Code Style

- ディレクトリ: `app/`, `components/`, `lib/`, `hooks/`, `types/`
- 命名: PascalCase（コンポーネント）, camelCase（関数）, UPPER_SNAKE_CASE（定数）
- 型定義: interface優先、ユニオン型はtype
- インポート: 外部 → ローカル → `import type` → 定数
- 詳細は `docs/steering/GUIDELINES.md` 参照

## Ignored Directories

`node_modules/`, `.next/`, `out/`, `.git/`, `coverage/`, `public/sounds/`, `public/lottie/`, `remotion/`
