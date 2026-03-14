# Repository Structure

**最終更新**: 2026-02-21

---

## ディレクトリ構成

```
roastplus/
├── app/                    # Next.js App Router ページ
├── components/             # UIコンポーネント（共通UI + 機能別）
├── lib/                    # ビジネスロジック・ユーティリティ
├── hooks/                  # カスタムReactフック
├── types/                  # TypeScript型定義
├── functions/              # Firebase Cloud Functions（サーバーレスAI処理）
├── __tests__/              # ユニットテスト（Node環境が必要なスクリプト等）
│   └── scripts/            # GitHub Actionsスクリプトのテスト
├── docs/                   # ドキュメント（Steering / Working）
├── eslint-rules/           # ESLintカスタムルール（no-raw-button等）
├── e2e/                    # Playwright E2Eテスト
├── .claude/                # Claude Code設定・スキル
├── .github/                # GitHub設定
│   ├── workflows/          # GitHub Actionsワークフロー
│   └── scripts/            # Actions内で実行するスクリプト（.mjs）
├── public/                 # 静的ファイル（SW, マニフェスト, 画像, 音声）
├── scripts/                # 自動化スクリプト
├── remotion/               # 動画生成（Remotion）
├── vitest.config.ts        # Vitestテスト設定
├── playwright.config.ts    # Playwright E2E設定
├── next.config.ts          # Next.js設定（static export）
├── tailwind.config.ts      # Tailwind CSS v4設定
├── tsconfig.json           # TypeScript設定（strict, @/ alias）
├── firebase.json           # Firebase設定
├── firestore.rules         # Firestoreセキュリティルール
├── package.json            # 依存関係・スクリプト
└── CLAUDE.md               # Claude Codeプロジェクトルール
```

---

## `/app` - Next.js App Router ページ

機能単位でディレクトリを分割。各ディレクトリに `page.tsx` を配置。

### メイン機能

| ディレクトリ | 機能 | 備考 |
|------------|------|------|
| `page.tsx` | ホーム画面 | ダッシュボード |
| `layout.tsx` | ルートレイアウト | テーマプロバイダー、認証ラッパー |
| `schedule/` | スケジュール管理 | OCR対応（画像→テキスト） |
| `roast-timer/` | 焙煎タイマー | リアルタイム計測、記録 |
| `tasting/` | テイスティングセッション | AI分析連携 |
| `drip-guide/` | ドリップガイド | レシピ計算、ステップ実行 |
| `coffee-trivia/` | コーヒークイズ | FSRS間隔反復学習 |
| `assignment/` | 担当表 | チーム管理、シャッフル |
| `roast-record/` | 焙煎記録 | 焙煎データ一覧 |
| `defect-beans/` | 欠点豆 | 欠点豆の記録・管理 |
| `progress/` | 作業進捗 | 日次進捗管理 |
| `brewing/` | 抽出管理 | 抽出記録 |

### サブ機能

| ディレクトリ | 機能 | 備考 |
|------------|------|------|
| `settings/` | 設定 | ユーザー設定、テーマ切替 |
| `notifications/` | 通知 | 通知一覧 |
| `changelog/` | 変更履歴 | アプリ更新履歴 |
| `clock/` | 時計 | 業務用時計表示 |
| `contact/` | お問い合わせ | EmailJS連携 |
| `login/` | ログイン | Firebase Auth |
| `consent/` | 同意 | 利用規約同意 |
| `terms/` | 利用規約 | 法的文書 |
| `privacy-policy/` | プライバシーポリシー | 法的文書 |
| `dev-stories/` | 開発ストーリー | 開発者向け |
| `ui-test/` | UIテストページ | 共通コンポーネントカタログ |

### 開発者向け

| ディレクトリ | 機能 | 備考 |
|------------|------|------|
| `dev/design-lab/` | デザインラボ | UIプロトタイピング |

---

## `/components` - UIコンポーネント

再利用可能なUIコンポーネントを配置。共通UI（`ui/`）と機能別コンポーネントに分離。

### `components/ui/` - 共通UIコンポーネント（最重要）

プロジェクト全体で使用する基本コンポーネント。**新規UI作成時は必ずこれらを使用すること。**

| カテゴリ | コンポーネント |
|---------|--------------|
| **ボタン系** | `Button`, `IconButton` |
| **フォーム系** | `Input`, `NumberInput`, `InlineInput`, `Textarea`, `Select`, `Checkbox`, `Switch` |
| **コンテナ系** | `Card`, `Modal`, `Dialog` |
| **表示系** | `Badge`, `Tabs`（TabsList, TabsTrigger, TabsContent）, `Accordion`（AccordionItem, AccordionTrigger, AccordionContent）, `ProgressBar`, `EmptyState` |
| **ナビゲーション系** | `BackLink` |
| **ドメイン特化** | `RoastLevelBadge` |

**重要ファイル**:
- `index.ts` - 全コンポーネントのバレルエクスポート
- `registry.tsx` - UIカタログ登録（`/ui-test` ページで自動表示）

### 機能別コンポーネント

| ディレクトリ | 機能 | 主なコンポーネント |
|------------|------|------------------|
| `home/` | ホーム画面 | ダッシュボードカード等 |
| `roast-timer/` | 焙煎タイマー | TimerDisplay（リング）、TimerControls（操作）、SetupPanel（重量カード） |
| `roast-scheduler/` | 焙煎スケジュール | スケジュール表示・編集 |
| `roast-record-list/` | 焙煎記録一覧 | 記録リスト表示 |
| `drip-guide/` | ドリップガイド | レシピ表示、ステップ実行 |
| `coffee-quiz/` | コーヒークイズ | クイズカード、結果表示 |
| `today-schedule/` | 本日のスケジュール | スケジュール一覧 |
| `settings/` | 設定画面 | 設定フォーム |
| `work-progress/` | 作業進捗 | 進捗表示・入力 |
| `defect-beans/` | 欠点豆 | 欠点豆リスト |
| `defect-bean-form/` | 欠点豆フォーム | 入力フォーム |
| `camera-capture/` | カメラキャプチャ | 画像撮影UI |
| `ocr-confirm/` | OCR確認 | OCR結果確認・編集 |
| `ocr-time-label-editor/` | OCR時間ラベル編集 | ラベル修正UI |
| `date-picker/` | 日付選択 | カレンダーUI |
| `notifications/` | 通知 | 通知リスト |
| `changelog/` | 変更履歴 | 変更ログ表示 |
| `clock/` | 時計 | 時計表示 |
| `contact/` | お問い合わせ | 問い合わせフォーム |
| `dev-stories/` | 開発ストーリー | ストーリー表示 |

---

## `/lib` - ビジネスロジック・ユーティリティ

データ操作、計算ロジック、外部サービス設定を配置。**UIロジックと分離。**

### 機能別ロジック（サブディレクトリ）

| ディレクトリ | 内容 | 主なファイル |
|------------|------|------------|
| `firestore/` | Firestore CRUD操作 | `common.ts`, `defectBeans.ts`, `index.ts`, `userData/`, `workProgress/` |
| `coffee-quiz/` | クイズロジック全般 | `questions.ts`, `fsrs.ts`, `gamification.ts`, `badge.ts`, `level.ts`, `xp.ts`, `streak.ts`, `daily-goal.ts`, `stats.ts`, `debug.ts`, `sounds.ts` |
| `drip-guide/` | ドリップレシピ計算 | `recipe46.ts`, `recipeCalculator.ts`, `formatTime.ts`, `useRecipes.ts` |

### 単体ファイル

| ファイル | 役割 |
|---------|------|
| `firebase.ts` | Firebase初期化（Auth, Firestore, Storage, Functions） |
| `auth.ts` | 認証ヘルパー |
| `theme.ts` | テーマ関連ユーティリティ |
| `tastingAnalysis.ts` | テイスティングAI分析（Cloud Functions呼び出し） |
| `scheduleOCR.ts` | スケジュールOCR（Cloud Functions呼び出し） |
| `emailjs.ts` | EmailJS設定（お問い合わせ） |
| `sounds.ts` | サウンド再生ユーティリティ |
| `soundFiles.ts` | サウンドファイル定義 |
| `storage.ts` | Firebase Storage操作 |
| `notifications.ts` | 通知管理 |
| `utils.ts` | 汎用ユーティリティ（`cn()` 等） |
| `constants.ts` | 定数定義 |
| `dateUtils.ts` | 日付操作ヘルパー |
| `firestoreUtils.ts` | Firestoreユーティリティ |
| `localStorage.ts` | localStorage操作 |
| `beanConfig.ts` | 豆の設定データ |
| `clockSettings.ts` | 時計設定 |
| `consent.ts` | 同意管理 |
| `roastScheduleColors.ts` | 焙煎スケジュールの色設定 |
| `roastTimerRecords.ts` | タイマー記録操作 |
| `roastTimerSettings.ts` | タイマー設定 |
| `roastTimerUtils.ts` | タイマーユーティリティ |
| `timeSync.ts` | 時刻同期 |
| `version.ts` | バージョン管理 |

---

## `/hooks` - カスタムReactフック

状態管理、副作用処理のカスタムフックを配置。

### 機能別フック（サブディレクトリ）

| ディレクトリ | 内容 |
|------------|------|
| `drip-guide/` | ドリップガイド関連フック |
| `roast-timer/` | 焙煎タイマー関連フック |

### 単体フック

| ファイル | 役割 |
|---------|------|
| `useAppData.ts` | アプリ全体のデータ管理 |
| `useAppTheme.ts` | テーマ管理（7テーマ切替） |
| `useAppLifecycle.ts` | アプリライフサイクル管理 |
| `useAppVersion.ts` | バージョン情報 |
| `useChristmasMode.ts` | クリスマステーマ切替・判定 |
| `useScheduleOCR.ts` | スケジュールOCR操作 |
| `useTastingAIAnalysis.ts` | テイスティングAI分析操作 |
| `useScheduleDateNavigation.ts` | スケジュール日付ナビゲーション |
| `useScheduleImageProcessing.ts` | スケジュール画像処理 |
| `useMediaQuery.ts` | メディアクエリ判定（レスポンシブ対応） |
| `useRoastTimer.ts` | 焙煎タイマー操作 |
| `useCameraCapture.ts` | カメラキャプチャ操作 |
| `useDefectBeans.ts` | 欠点豆データ管理 |
| `useDefectBeanSettings.ts` | 欠点豆設定 |
| `useClockSettings.ts` | 時計設定管理 |
| `useDeveloperMode.ts` | 開発者モード切替 |
| `useMembers.ts` | メンバー管理 |
| `useNotifications.ts` | 通知管理 |
| `useQuizData.ts` | クイズデータ取得 |
| `useQuizSession.ts` | クイズセッション管理 |
| `useQuizSound.ts` | クイズサウンド管理 |
| `useTastingFilters.ts` | テイスティングフィルター |
| `useToast.ts` | トースト通知 |
| `useTodayScheduleSync.ts` | 本日のスケジュール同期 |
| `useWorkProgressActions.ts` | 作業進捗アクション |

---

## `/types` - TypeScript型定義

グローバルな型定義を配置。機能別にファイルを分割。

| ファイル | 内容 |
|---------|------|
| `index.ts` | 共通型のバレルエクスポート |
| `common.ts` | 共通型定義 |
| `schedule.ts` | スケジュール型 |
| `tasting.ts` | テイスティング型 |
| `timer.ts` | タイマー型 |
| `team.ts` | チーム・担当表型 |
| `settings.ts` | 設定型 |
| `notification.ts` | 通知型 |
| `work-progress.ts` | 作業進捗型 |
| `defect-beans.ts` | 欠点豆型 |
| `changelog.ts` | 変更履歴型 |
| `global.d.ts` | グローバル型宣言 |

---

## `/functions` - Firebase Cloud Functions

Cloud Functions v2によるサーバーレスAI処理。OpenAI GPT-4oを使用。

```
functions/
├── src/
│   ├── index.ts              # エントリポイント（関数エクスポート）
│   ├── ocr-schedule.ts       # ocrScheduleFromImage（GPT-4o Vision OCR）
│   ├── tasting-analysis.ts   # analyzeTastingSession（GPT-4o テキスト分析）
│   ├── helpers.ts            # 共通ヘルパー関数
│   └── types.ts              # Cloud Functions用型定義
├── package.json              # Cloud Functions用依存関係（openai等）
└── tsconfig.json             # Cloud Functions用TypeScript設定
```

**重要**: `OPENAI_API_KEY` はFirebase Secret Managerで管理。クライアントには公開しない。

---

## `/docs` - ドキュメント

### `docs/steering/` - Steering Documents（永続化ドキュメント）

プロジェクト設計指針。AIが必ず参照する。

| ファイル | 内容 | 参照タイミング |
|---------|------|---------------|
| `PRODUCT.md` | プロダクトビジョン、コアバリュー | Issue理解時 |
| `FEATURES.md` | 全機能の詳細仕様、禁止事項 | 機能実装時（最重要） |
| `TECH_SPEC.md` | 技術スタック、ADR | 技術選定時 |
| `REPOSITORY.md` | リポジトリ構造（本ファイル） | ファイル配置時 |
| `GUIDELINES.md` | 実装ガイドライン | コード作成時 |
| `UBIQUITOUS_LANGUAGE.md` | ドメイン用語定義 | 命名時 |

### `docs/working/` - Working Documents（作業用ドキュメント）

Issue単位の仕様書。`{YYYYMMDD}_{Issue番号}_{タイトル}/` 形式で作成。PR完了後もGit保管（削除しない）。

最大4ファイル（タスク複雑度により調整）:
- `requirement.md` - 要件定義（**必須**）
- `tasklist.md` - タスクリスト（**必須**）
- `design.md` - 設計書（複雑なタスクのみ）
- `testing.md` - テスト計画（複雑なタスクのみ）

### その他

| ファイル | 内容 |
|---------|------|
| `testing-strategy.md` | テスト戦略・ガイドライン |
| `screenshots/` | スクリーンショット |

---

## `/e2e` - Playwright E2Eテスト

```
e2e/
├── fixtures/              # テストフィクスチャ
│   ├── test-base.ts       # mockFirebase（Firebase モック）
│   └── test-data.ts       # ビューポート、閾値等のテストデータ
├── pages/                 # ページ単位のテスト
│   ├── home.spec.ts
│   ├── quiz.spec.ts
│   ├── roast-timer.spec.ts
│   ├── schedule.spec.ts
│   └── tasting.spec.ts
├── flows/                 # ユーザーフロー統合テスト
│   ├── data-management-flow.spec.ts
│   ├── quiz-flow.spec.ts
│   └── roast-timer-flow.spec.ts
├── responsive/            # レスポンシブテスト
│   └── responsive.spec.ts
├── accessibility/         # アクセシビリティテスト（axe-core）
│   └── a11y.spec.ts
└── performance/           # パフォーマンステスト
    └── performance.spec.ts
```

---

## `/.claude` - Claude Code設定・スキル

### `.claude/skills/` - Claude Codeスキル

各スキルは独立したディレクトリに `SKILL.md` を配置。

| スキル | 内容 | 用途 |
|--------|------|------|
| `create-spec/` | Working Documents自動生成 | Issue仕様書の作成 |
| `fix-issue/` | Issue解決ワークフロー | Working読込→実装→レビュー→PR |
| `git-workflow/` | コミット・リリース | Workingからスコープ自動抽出 |
| `issue-creator/` | Issue作成 | 調査→Issue→Working生成 |
| `project-maintenance/` | メンテナンス監査 | リファクタリングIssue自動生成 |
| `nano-banana-pro/` | 画像生成 | Gemini画像生成 |
| `nextjs-firestore/` | Firebaseパターン参照 | 型定義、CRUD、Auth等 |
| `roastplus-ui/` | UIデザインシステム | 配色・コンポーネント・レイアウト |
| `remotion-best-practices/` | Remotionベストプラクティス | 動画生成のパターン |
| `vercel-react-best-practices/` | Vercel/Reactベストプラクティス | フロントエンド実装 |

---

## `/public` - 静的ファイル

| ファイル/ディレクトリ | 内容 |
|---------------------|------|
| `sw.js` | カスタムService Worker（手書き、next-pwa不使用） |
| `site.webmanifest` | PWAマニフェスト |
| `sounds/` | 音声ファイル（タイマー音、クイズ音等） |
| `animations/` | アニメーションファイル |
| `images/` | 画像ファイル |
| `avatars/` | アバター画像 |
| `coffee-trivia/` | コーヒークイズ用画像 |
| `dev-stories/` | 開発ストーリー用画像 |
| `favicon.ico`, `favicon-*.png` | ファビコン各サイズ |
| `android-chrome-*.png` | Android用アイコン各サイズ |
| `apple-touch-icon.png` | iOS用アイコン |
| `logo.png` | ロゴ画像 |

---

## `/scripts` - 自動化スクリプト

| スクリプト | 内容 |
|-----------|------|
| `update-version.ts` | バージョン番号更新 |
| `generate-sound-list.ts` | サウンドファイルリスト自動生成 |
| `setup-worktrees.sh` | Git worktreeセットアップ |
| `cleanup-worktrees.sh` | Git worktreeクリーンアップ |

---

## `/remotion` - 動画生成（Remotion）

Remotionを使用した動画生成機能。

```
remotion/
├── index.ts               # エントリポイント
├── Root.tsx                # ルートコンポーネント
├── RoastPlusIntro.tsx      # イントロ動画
├── TestComposition.tsx     # テスト用コンポジション
└── scenes/                 # シーン定義
```

---

## 重要な規約

### ブランチ戦略

- **mainブランチ**: 本番反映ブランチ（直接コミット禁止）
- **トピックブランチ**: `feat/#123-xxx`, `fix/#123-xxx`
- **PRフロー**: トピックブランチ → PR → レビュー → mainマージ

### ファイル命名規則

| 種類 | 規則 | 例 |
|-----|------|-----|
| コンポーネント | PascalCase | `QuizCard.tsx`, `RoastLevelBadge.tsx` |
| ユーティリティ | camelCase | `gamification.ts`, `dateUtils.ts` |
| フック | camelCase（`use`プレフィックス） | `useAppTheme.ts`, `useRoastTimer.ts` |
| 型定義 | camelCase（ケバブケースも可） | `common.ts`, `work-progress.ts` |
| テスト | 対象ファイル名 + `.test` | `gamification.test.ts` |
| ページ | `page.tsx`, `layout.tsx` | App Router標準 |
| 定数 | UPPER_SNAKE_CASE（ファイル内） | `MAX_RETRY_COUNT` |

### インポートパスエイリアス

```typescript
// @/ = プロジェクトルート（tsconfig.jsonで設定）
import { Button } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { TastingSession } from '@/types/tasting';
```

### 依存方向（循環依存禁止）

```
types/ → lib/ → hooks/ → components/ → app/
  ^                                      |
  └──────── 循環依存禁止 ────────────────┘
```

| レイヤー | 依存可能な対象 |
|---------|--------------|
| `types/` | 他のディレクトリに依存しない |
| `lib/` | `types/` のみ |
| `hooks/` | `types/`, `lib/` |
| `components/` | `types/`, `lib/`, `hooks/` |
| `app/` | すべてに依存可能 |

---

## 禁止事項

1. **mainブランチへの直接コミット**: 必ずトピックブランチ経由でPR
2. **node_modules/ の編集**: 依存関係は `package.json` で管理
3. **生のTailwindでボタン/カード作成**: `@/components/ui` を使用
4. **機能横断的なディレクトリ構造**: 機能単位でディレクトリ分割を維持
5. **循環依存**: 上記の依存方向に違反するインポート

---

## 新規機能追加時の実装順序

依存方向に従い、以下の順序で実装:

1. **`types/`**: 型定義を作成
2. **`lib/`**: ビジネスロジックを実装（+ ユニットテスト）
3. **`hooks/`**: カスタムフックを作成（必要な場合）
4. **`components/`**: UIコンポーネントを実装（共通UIは `ui/` に登録）
5. **`app/`**: ページに統合
