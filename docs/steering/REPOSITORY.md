# Repository Structure

**最終更新**: 2026-02-08

---

## ディレクトリ構成

```
roastplus/
├── app/                    # Next.js App Router ページ
├── components/             # UIコンポーネント
├── lib/                    # ビジネスロジック・ユーティリティ
├── hooks/                  # カスタムReactフック
├── types/                  # TypeScript型定義
├── docs/                   # ドキュメント
├── scripts/                # 自動化スクリプト
├── .claude/                # Claude Code設定・スキル
└── public/                 # 静的ファイル
```

---

## `/app` - Next.js App Router ページ

機能単位でディレクトリを分割。各ディレクトリに `page.tsx` を配置。

| ディレクトリ | 機能 |
|------------|------|
| `assignment/` | 担当表（デスクトップテーブル、モーダル） |
| `drip-guide/` | ドリップガイド（レシピ一覧、実行画面） |
| `coffee-trivia/` | コーヒークイズ（FSRS間隔反復学習） |
| `roast-timer/` | 焙煎タイマー |
| `tasting/` | テイスティングセッション |
| `schedule/` | スケジュール管理（OCR対応） |
| `page.tsx` | ホーム画面 |
| `layout.tsx` | ルートレイアウト |

---

## `/components` - UIコンポーネント

再利用可能なUIコンポーネントを配置。機能別にサブディレクトリを作成。

### `components/ui/` - 共通UIコンポーネント

**最重要**: プロジェクト全体で使用する基本コンポーネント。**必ず使用すること。**

| コンポーネント | 用途 |
|--------------|------|
| **ボタン系** | Button, IconButton |
| **フォーム系** | Input, NumberInput, InlineInput, Textarea, Select, Checkbox, Switch |
| **コンテナ系** | Card, Modal, Dialog |
| **表示系** | Badge, Tabs, Accordion, ProgressBar, EmptyState |

**registry.tsx**: UIカタログ（`/ui-test`ページで表示）。新規コンポーネント追加時は必ず登録。

### 機能別コンポーネント

| ディレクトリ | 機能 |
|------------|------|
| `drip-guide/` | ドリップガイド専用コンポーネント |
| `roast-timer/` | 焙煎タイマー専用コンポーネント |
| `assignment-table/` | 担当表専用コンポーネント |
| `coffee-quiz/` | クイズ専用コンポーネント |

---

## `/lib` - ビジネスロジック・ユーティリティ

データ操作、計算ロジック、外部サービス設定を配置。**UIロジックと分離。**

### 機能別ロジック

| ディレクトリ | 内容 |
|------------|------|
| `firestore/` | Firestore CRUD操作 |
| `coffee-quiz/` | クイズロジック、FSRS計算、ゲーミフィケーション |
| `drip-guide/` | レシピ計算ロジック |
| `roasting/` | 焙煎プロファイル管理 |

### 外部サービス設定

| ファイル | 役割 |
|---------|------|
| `firebase.ts` | Firebase初期化 |
| `openai.ts` | OpenAI API設定（OCR、AI分析） |

---

## `/hooks` - カスタムReactフック

状態管理、副作用処理のカスタムフックを配置。

| ディレクトリ/ファイル | 内容 |
|-------------------|------|
| `drip-guide/` | ドリップガイド関連フック |
| `roast-timer/` | 焙煎タイマー関連フック |
| `useChristmasMode.ts` | クリスマスモード状態管理 |

---

## `/types` - TypeScript型定義

グローバルな型定義を配置。機能別にファイルを分割。

| ファイル | 内容 |
|---------|------|
| `drip-guide.ts` | ドリップガイド型定義 |
| `coffee-quiz.ts` | クイズ型定義 |
| `assignment.ts` | 担当表型定義 |

---

## `/docs` - ドキュメント

プロジェクトドキュメントを配置。

### `docs/steering/` - Steering Documents（永続化ドキュメント）

**最重要**: プロジェクト設計指針。AIが必ず参照する。

| ファイル | 内容 |
|---------|------|
| `PRODUCT.md` | プロダクトビジョン |
| `REPOSITORY.md` | リポジトリ構造（本ファイル） |
| `TECH_SPEC.md` | 技術仕様 |
| `UBIQUITOUS_LANGUAGE.md` | ドメイン用語 |
| `FEATURES.md` | 機能一覧 |
| `GUIDELINES.md` | 実装ガイドライン |

### `docs/working/` - Working Documents（作業用ドキュメント）

Issue単位の仕様書。`{YYYYMMDD}_{Issue番号}_{タイトル}/` 形式で作成。

| ファイル | 内容 |
|---------|------|
| `requirement.md` | 要件定義 |
| `design.md` | 設計書 |
| `tasklist.md` | タスクリスト |
| `testing.md` | テスト計画 |

### その他ドキュメント

| ファイル | 内容 |
|---------|------|
| `testing-strategy.md` | テスト戦略・ガイドライン |

---

## `/scripts` - 自動化スクリプト

Python/Shellスクリプトを配置。

| スクリプト | 内容 |
|-----------|------|
| `generate-release-notes.py` | リリースノート自動生成 |
| `run-project-maintenance.py` | 統合監査（複雑度・セキュリティ・デッドコード） |

---

## `/.claude` - Claude Code設定・スキル

### `.claude/skills/` - Claude Codeスキル

各スキルは独立したディレクトリに `SKILL.md` を配置。

| スキル | 内容 |
|--------|------|
| `fix-issue/` | Issue解決ワークフロー |
| `git-workflow/` | コミット・リリース |
| `issue-creator/` | Issue作成 |
| `project-maintenance/` | メンテナンス監査 |
| `debugging-helper/` | 自律的デバッグ |
| `create-spec/` | Working Documents自動生成（新規） |

---

## `/public` - 静的ファイル

画像、音声、Lottieアニメーションを配置。

| ディレクトリ | 内容 |
|------------|------|
| `sounds/` | 音声ファイル（タイマー音等） |
| `lottie/` | Lottieアニメーション |

---

## 重要な規約

### ブランチ戦略

- **mainブランチ**: 本番反映ブランチ
- **トピックブランチ**: `fix/#123-xxx`, `feat/#123-xxx`
- **⚠️ mainへの直接コミット禁止**

### ファイル命名規則

| 種類 | 規則 | 例 |
|-----|------|-----|
| コンポーネント | PascalCase | `QuizCard.tsx` |
| ユーティリティ | camelCase | `gamification.ts` |
| ページ | `page.tsx`, `layout.tsx` | App Router標準 |

### インポートパスエイリアス

- `@/` - プロジェクトルート（`tsconfig.json`で設定）
- 例: `import { Button } from '@/components/ui'`

---

## 禁止事項

1. **mainブランチへの直接コミット**: 必ずトピックブランチ経由でPR
2. **node_modules/ の編集**: 依存関係は `package.json` で管理
3. **生のTailwindでボタン/カード作成**: `@/components/ui` を使用
4. **機能横断的なディレクトリ**: 機能単位でディレクトリ分割を維持

---

## ディレクトリの依存方向

```
types/ → lib/ → hooks/ → components/ → app/
  ↑                                      ↓
  └─────────── 循環依存禁止 ───────────────┘
```

- **types/**: 他のディレクトリに依存しない
- **lib/**: types/ のみ依存
- **hooks/**: types/, lib/ に依存
- **components/**: types/, lib/, hooks/ に依存
- **app/**: すべてに依存可能

---

## 次のステップ

新規機能追加時は、以下の順序で実装:

1. **types/**: 型定義
2. **lib/**: ビジネスロジック
3. **hooks/**: カスタムフック（必要な場合）
4. **components/**: UIコンポーネント
5. **app/**: ページ統合
