# Features

**最終更新**: 2026-02-21

---

## 目次

1. [担当表（Assignment）](#1-担当表assignment)
2. [スケジュール（Schedule）](#2-スケジュールschedule)
3. [試飲感想記録（Tasting）](#3-試飲感想記録tasting)
4. [ローストタイマー（Roast Timer）](#4-ローストタイマーroast-timer)
5. [コーヒー豆図鑑（Defect Beans）](#5-コーヒー豆図鑑defect-beans)
6. [作業進捗（Work Progress）](#6-作業進捗work-progress)
7. [ドリップガイド（Drip Guide）](#7-ドリップガイドdrip-guide)
8. [コーヒークイズ（Coffee Quiz）](#8-コーヒークイズcoffee-quiz)
9. [開発秘話（Dev Stories）](#9-開発秘話dev-stories)
10. [その他](#10-その他)

---

## 1. 担当表（Assignment）

### 目的
作業分担の自動割り当て、過去履歴の不公平感解消

### 主要ユースケース
1. 担当表自動生成（シャッフルロジック、出欠考慮）
2. デスクトップテーブルビュー（大画面最適化）
3. モバイルビュー（カード形式）
4. 担当履歴の記録・参照

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `@/components/ui` のButton、Card、Modal等を使用
- ❌ **禁止**: Tailwindで直接ボタン/カード/入力を作成

#### テーマ対応
- テーマはCSS変数（`data-theme`属性）で自動適用。コンポーネントへのテーマprop渡しは不要
- セマンティックユーティリティ（`bg-page`, `text-ink`, `border-edge`等）を使用

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/assignment/page.tsx` |
| **コンポーネント** | `components/assignment-table/DesktopTableView.tsx` (CCN: 125 - リファクタリング対象)<br>`components/assignment-table/TableModals.tsx` (CCN: 117 - リファクタリング対象) |
| **Firestore** | `users/{userId}` ドキュメント内のフィールド + 担当データはサブコレクション |
| **状態管理** | React useState のみ |

### 設計方針

#### データモデル
```typescript
interface Assignment {
  id: string;
  date: string;
  tasks: {
    taskName: string;
    assignedTo: string;
  }[];
  createdAt: Timestamp;
}
```

#### シャッフルロジック
- 過去の担当履歴を考慮
- 出欠状況（`isPresent`）を反映
- 公平性スコアで評価

### 禁止事項
1. ❌ 独自のテーブルコンポーネント作成（既存のDesktopTableViewを使用）
2. ❌ シャッフルロジックの根本的変更（バグ修正のみ）

### 関連ADR
- [ADR-010] 機能別モジュール分割パターン（`docs/steering/TECH_SPEC.md` 参照）

---

## 2. スケジュール（Schedule）

### 目的
業務予定のOCR読み取り、一覧表示

### 主要ユースケース
1. スケジュール画像のOCR（Firebase Cloud Functions経由でGPT-4o Vision）
2. スケジュール一覧・編集
3. 今日の予定表示

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Input` を使用

#### テーマ対応
- CSS変数による自動テーマ適用

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/schedule/page.tsx` |
| **OCR** | Firebase Cloud Functions v2 `ocrScheduleFromImage`（GPT-4o Vision）<br>クライアント: `httpsCallable(functions, 'ocrScheduleFromImage')` |
| **ロジック** | `lib/scheduleOCR.ts`（Cloud Functions呼び出しラッパー） |
| **Firestore** | `users/{userId}` ドキュメント内のフィールド |

### 設計方針

#### OCR処理
- **ツール**: Firebase Cloud Functions v2 経由でOpenAI GPT-4o Vision
- **理由**: [ADR-004] Google Vision API → OpenAI統一
- **呼び出し**: `httpsCallable(functions, 'ocrScheduleFromImage')` でクライアントから呼び出し
- **シークレット管理**: OPENAI_API_KEY は Firebase Secret Manager で管理

### 禁止事項
1. ❌ OCR処理のGoogle Vision API への戻し（OpenAI統一を維持）
2. ❌ API Routeでの実装（静的エクスポートのためCloud Functionsを使用）

### 関連ADR
- [ADR-004] OCR処理のOpenAI統一（`docs/steering/TECH_SPEC.md` 参照）

---

## 3. 試飲感想記録（Tasting）

### 目的
コーヒーの味わい評価、AI分析

### 主要ユースケース
1. テイスティングセッション作成
2. フレーバーホイール評価（5軸: aroma, acidity, sweetness, body, aftertaste）
3. AI分析（Firebase Cloud Functions経由でGPT-4o）自動実行
4. 他ユーザーの感想閲覧

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Textarea` を使用
- ❌ **禁止**: 独自のフレーバーホイールコンポーネント作成（既存の`FlavorWheel`を使用）

#### テーマ対応
- CSS変数による自動テーマ適用

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/tasting/page.tsx` |
| **コンポーネント** | `components/tasting/FlavorWheel.tsx`<br>`components/tasting/TastingCard.tsx` |
| **AI** | Firebase Cloud Functions v2 `analyzeTastingSession`（GPT-4o）<br>クライアント: `httpsCallable(functions, 'analyzeTastingSession')` |
| **Firestore** | `users/{userId}` ドキュメント内のフィールド |

### 設計方針

#### フレーバーホイール評価
- **5軸評価**: aroma（香り）, acidity（酸味）, sweetness（甘み）, body（ボディ）, aftertaste（余韻）
- **スコア**: 1〜5の5段階評価

#### AI分析
- **自動実行**: フレーバーホイール評価後、自動的にAI分析を実行
- **実装**: Firebase Cloud Functions v2で`analyzeTastingSession`関数を呼び出し
- **モデル**: OpenAI GPT-4o（テキスト生成）
- **プロンプト**: 5軸スコアを元に、コーヒーの特徴を解析

#### データモデル
```typescript
interface TastingSession {
  id: string;
  userId: string;
  coffeeName: string;
  flavorWheel: {
    aroma: number;
    acidity: number;
    sweetness: number;
    body: number;
    aftertaste: number;
  };
  aiAnalysis?: string;
  createdAt: Timestamp;
}
```

### 禁止事項
1. ❌ フレーバーホイールの軸変更（互換性維持）
2. ❌ AI分析の手動実行化（自動実行を維持）

### 関連ADR
- [ADR-005] AI分析を自動実行パターンに変更（`docs/steering/TECH_SPEC.md` 参照）

---

## 4. ローストタイマー（Roast Timer）

### 目的
焙煎時間の正確な計測、温度記録のOCR読み取り

### 主要ユースケース
1. タイマー開始/停止/リセット
2. 温度ラベルOCR（Firebase Cloud Functions経由でGPT-4o Vision）
3. 焙煎記録の保存（Firestore）
4. 焙煎履歴の閲覧

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Input` を使用
- ❌ **禁止**: 独自のタイマー表示コンポーネント作成（既存の`TimerDisplay`を使用）

#### テーマ対応
- CSS変数による自動テーマ適用。ハードコード色は使用禁止

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/roast-timer/page.tsx` |
| **コンポーネント** | `components/roast-timer/`（サブモジュール分割済み）<br>`TimerDisplay.tsx`, `PhaseButtons.tsx` |
| **フック** | `hooks/roast-timer/useRoastTimer.ts` |
| **音声設定** | `lib/soundFiles.ts`（自動生成）← `scripts/generate-sound-list.ts`が`public/sounds/roasttimer/`をスキャン<br>`components/RoastTimerSettings.tsx`（音声選択UI） |
| **OCR** | Firebase Cloud Functions v2 `ocrScheduleFromImage`（GPT-4o Vision）<br>クライアント: `httpsCallable(functions, 'ocrScheduleFromImage')` |
| **Firestore** | `users/{userId}` ドキュメント内のフィールド |

### 設計方針

#### 状態管理
- **ツール**: React useState（軽量なため）
- **理由**: タイマーはページローカルの状態、グローバル状態不要

#### OCR処理
- **ツール**: Firebase Cloud Functions v2 経由でOpenAI GPT-4o Vision
- **理由**: [ADR-004] Google Vision API → OpenAI統一。静的エクスポートのためAPI Routeは使用不可
- **呼び出し方法**: `httpsCallable(functions, 'functionName')` によるCloud Functions呼び出し

#### 音声設定
- **タイマーサウンド**: `timerSoundFile`（Firestoreに保存）
- **通知サウンド**: `notificationSoundFile`（Firestoreに保存）
- **音声ファイル追加時**: `npm run generate:sound-list` を実行して`lib/soundFiles.ts`を再生成

#### データ永続化
- **ツール**: Firestore
- **スキーマ**:
```typescript
interface RoastRecord {
  id: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  phases: {
    phaseName: 'drop' | 'firstCrack' | 'secondCrack' | 'finish';
    time: number; // 秒
    temperature?: number; // ℃
  }[];
}
```

### 禁止事項
1. ❌ 新しい状態管理ライブラリの導入
2. ❌ サードパーティのタイマーライブラリの追加（独自実装を維持）
3. ❌ タイマーロジックの根本的変更（バグ修正のみ）

### 関連ADR
- [ADR-004] OCR処理のOpenAI統一（`docs/steering/TECH_SPEC.md` 参照）
- [ADR-010] サブモジュール分割（`docs/steering/TECH_SPEC.md` 参照）

---

## 5. コーヒー豆図鑑（Defect Beans）

### 目的
欠点豆の種類・特徴・写真の参照

### 主要ユースケース
1. 欠点豆一覧の閲覧（検索・ソート対応）
2. 欠点豆の詳細表示（写真・説明）
3. 設定（表示件数・ソート順）の保存

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Input` を使用
- ❌ **禁止**: 独自の検索・ソートUIを作成（既存の`SearchFilterSection`, `SortMenu`を使用）

#### テーマ対応
- CSS変数による自動テーマ適用

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/defect-beans/page.tsx`（一覧）<br>`app/defect-beans/[id]/page.tsx`（詳細） |
| **コンポーネント** | `components/defect-beans/SearchFilterSection.tsx`<br>`components/defect-beans/SortMenu.tsx`<br>`components/defect-beans/EmptyState.tsx` |
| **フック** | `hooks/useDefectBeans.ts`<br>`hooks/useDefectBeanSettings.ts` |
| **Firestore** | `defectBeans` コレクション（共有データ、全ユーザー共通） |
| **画像** | `public/images/`（静的コンテンツ） |

### 設計方針

#### データアクセス
- **共有データ**: `defectBeans` コレクションは全ユーザー共通（`users/{userId}` 配下ではない）
- **読み取り専用**: クライアントからの書き込みは禁止。Firebase Consoleまたは管理スクリプトで管理

### 禁止事項
1. ❌ クライアントからの欠点豆データ書き込み（読み取り専用）
2. ❌ 欠点豆データのユーザー個別管理（共有データを維持）

---

## 6. 作業進捗（Work Progress）

### 目的
焙煎作業・業務タスクの進捗管理、数量・状態の記録

### 主要ユースケース
1. 作業進捗の一覧表示（グループ別・アーカイブ対応）
2. 進捗作成・編集・削除
3. 進捗記録の履歴管理（日付別の数量記録）
4. クイック追加（QuickAddModal）
5. フィルタリング・ソート
6. アーカイブ機能

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Modal`, `Dialog` を使用
- ❌ **禁止**: 独自のカード・ダイアログコンポーネントの作成

#### テーマ対応
- CSS変数による自動テーマ適用

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/progress/page.tsx` |
| **ページコンポーネント** | `app/progress/components/NormalView.tsx`<br>`app/progress/components/ArchivedView.tsx`<br>`app/progress/components/ModeSelectDialog.tsx`<br>`app/progress/components/WorkProgressFormDialog.tsx`<br>`app/progress/components/GroupFormDialog.tsx`<br>`app/progress/components/FilterDialog.tsx`<br>`app/progress/components/ProgressHeader.tsx` |
| **共有コンポーネント** | `components/work-progress/WorkProgressCard.tsx`<br>`components/work-progress/QuickAddModal.tsx`<br>`components/work-progress/ProgressHistoryEditDialog.tsx` |
| **フック** | `hooks/useWorkProgressActions.ts` |
| **型定義** | `types/work-progress.ts` |
| **Firestore** | `users/{userId}` ドキュメント内の `workProgresses` フィールド |

### 設計方針

#### データモデル
```typescript
type WorkProgressStatus = 'pending' | 'in_progress' | 'completed';

interface ProgressEntry {
  id: string;
  date: string;       // ISO 8601形式
  amount: number;     // 進捗量（単位はweightフィールドから取得）
  memo?: string;
}

interface WorkProgress {
  id: string;
  groupName?: string;        // グループ名（任意）
  taskName?: string;         // 作業名（任意）
  weight?: string;           // 数量（例: "10kg", "5個"）（任意）
  status: WorkProgressStatus;
  memo?: string;
  startedAt?: string;        // ISO 8601形式
  completedAt?: string;      // ISO 8601形式
  createdAt: string;         // ISO 8601形式
  updatedAt: string;         // ISO 8601形式
  targetAmount?: number;     // 目標量
  currentAmount?: number;    // 現在の進捗量（累積）
  progressHistory?: ProgressEntry[];
  completedCount?: number;   // 完成数
  archivedAt?: string;       // ISO 8601形式
}
```

### 禁止事項
1. ❌ `targetAmount` なしの進捗管理廃止（目標量なし運用をサポート維持）
2. ❌ アーカイブ機能の削除

---

## 7. ドリップガイド（Drip Guide）

### 目的
ドリップ抽出手順の案内、レシピ管理

### 主要ユースケース
1. デフォルトレシピ（4:6メソッド）
2. カスタムレシピ作成・編集・削除
3. ガイド実行（タイマー付き、音声案内）
4. 人前（1〜8杯）のスケーリング

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Input`, `Modal` を使用
- ❌ **禁止**: 独自のレシピカードコンポーネント作成（既存の`RecipeCard`を使用）

#### テーマ対応
- CSS変数による自動テーマ適用

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/drip-guide/page.tsx`（レシピ一覧）<br>`app/drip-guide/run/page.tsx`（ガイド実行） |
| **コンポーネント** | `components/drip-guide/RecipeCard.tsx`<br>`components/drip-guide/MethodDialog.tsx` |
| **ロジック** | `lib/drip-guide/recipe.ts`（レシピ計算）<br>`lib/drip-guide/46method.ts`（4:6メソッド計算） |
| **フック** | `hooks/drip-guide/useRecipeGuide.ts` |
| **Firestore** | `users/{userId}` ドキュメント内のフィールド |

### 設計方針

#### レシピ計算
- **4:6メソッド**: `lib/drip-guide/46method.ts` で計算ロジック実装
- **スケーリング**: 人前（servings）に応じて豆量・湯量を調整

#### 音声案内
- **Web Audio API**: タイマー完了時に音声再生
- **音声ファイル**: `public/sounds/` に配置

### 禁止事項
1. ❌ レシピ計算ロジックの根本的変更（拡張は可）
2. ❌ デフォルトレシピ（4:6メソッド）の削除

### 関連ADR
- [ADR-010] サブモジュール分割（`docs/steering/TECH_SPEC.md` 参照）

---

## 8. コーヒークイズ（Coffee Quiz）

### 目的
コーヒー知識の習得、FSRS間隔反復学習

### 主要ユースケース
1. クイズ出題（カテゴリ: basics, roasting, extraction, origin）
2. 難易度別（easy, medium, hard）
3. XP獲得、ストリーク記録
4. FSRS学習スケジューリング

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Badge` を使用
- ❌ **禁止**: 独自のクイズカードコンポーネント作成（既存の`QuizCard`を使用）

#### テーマ対応
- CSS変数による自動テーマ適用

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/coffee-trivia/page.tsx`（クイズ実行）<br>`app/coffee-trivia/stats/page.tsx` (CCN: 97 - リファクタリング対象) |
| **コンポーネント** | `components/coffee-quiz/QuizCard.tsx`<br>`components/coffee-quiz/QuizOption.tsx` |
| **ロジック** | `lib/coffee-quiz/gamification.ts`（XP計算）<br>`lib/coffee-quiz/fsrs.ts`（FSRS計算） |
| **Firestore** | `users/{userId}` ドキュメント内のフィールド（クイズ進捗、ユーザー統計） |

### 設計方針

#### FSRS（間隔反復学習）
- **アルゴリズム**: Free Spaced Repetition Scheduler
- **パラメータ**: difficulty, stability, retrievability
- **復習間隔**: 次回復習日（`nextReviewDate`）を自動計算

#### ゲーミフィケーション
- **XP獲得**: 難易度に応じてXP付与（easy: 10, medium: 20, hard: 30）
- **ストリーク**: 連続日数記録、途切れるとリセット
- **レベル**: XPに応じてレベルアップ

#### データモデル
```typescript
interface QuizProgress {
  userId: string;
  questionId: string;
  difficulty: number;
  stability: number;
  nextReviewDate: Timestamp;
  lastReviewDate: Timestamp;
}

interface UserStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
}
```

### 禁止事項
1. ❌ FSRSアルゴリズムの根本的変更（パラメータ調整のみ可）
2. ❌ XP計算ロジックの変更（バランス崩壊の可能性）
3. ❌ ストリークロジックの変更（ユーザー混乱の可能性）

### 関連ADR
- FSRS採用は将来的にADRとして追記予定（`docs/steering/TECH_SPEC.md`）

---

## 9. 開発秘話（Dev Stories）

### 目的
開発チームのエピソード・開発の裏側を紹介するコンテンツページ

### 主要ユースケース
1. エピソード一覧の閲覧
2. エピソード詳細の閲覧（キャラクター対話形式）
3. エピソードの追加（静的データとして管理）

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `FloatingNav` を使用
- ❌ **禁止**: 独自のエピソードカードコンポーネント作成（既存の`EpisodeCard`を使用）

#### テーマ対応
- CSS変数による自動テーマ適用

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/dev-stories/page.tsx`（エピソード一覧）<br>`app/dev-stories/[id]/page.tsx`（エピソード詳細） |
| **コンポーネント** | `components/dev-stories/EpisodeCard.tsx`<br>`components/dev-stories/CharacterAvatar.tsx`<br>`components/dev-stories/DialogueBubble.tsx`<br>`components/dev-stories/DialogueSection.tsx`<br>`components/dev-stories/DetailSection.tsx` |
| **データ** | `data/dev-stories/episodes.ts`（エピソード一覧）<br>`data/dev-stories/episode-001.ts` 〜 `episode-006.ts`（各エピソード）<br>`data/dev-stories/characters.ts`（キャラクター定義）<br>`data/dev-stories/version-history.ts`（バージョン履歴連携） |
| **認証** | 不要（公開コンテンツ） |

### 設計方針

#### コンテンツ管理
- **静的データ**: `data/dev-stories/` に TypeScript で直接記述（Firestore不使用）
- **キャラクター対話形式**: DialogueBubble + DialogueSection で表現
- **エピソード追加**: `data/dev-stories/` に新ファイルを追加し、`episodes.ts` にエントリを追加

### 禁止事項
1. ❌ エピソードデータのFirestore移行（静的データを維持）
2. ❌ 認証必須化（公開コンテンツのまま維持）

---

## 10. その他

### 共通UI（UI Components）

#### 目的
デザイン統一、マルチテーマ対応

#### コンポーネント一覧（19エクスポート）

**ボタン系**
- **Button**: 基本ボタン（variant: primary, secondary, ghost）
- **IconButton**: アイコンボタン

**フォーム系**
- **Input**: テキスト入力
- **NumberInput**: 数値入力
- **InlineInput**: インライン編集可能入力
- **Textarea**: 複数行テキスト入力
- **Select**: セレクトボックス
- **Checkbox**: チェックボックス
- **Switch**: トグルスイッチ

**コンテナ系**
- **Card**: カード（variant: default, table, feature）
- **Modal**: モーダルダイアログ
- **Dialog**: ダイアログ

**表示系**
- **Badge**: バッジ
- **Tabs**: タブ（TabsList, TabsTrigger, TabsContent）
- **Accordion**: アコーディオン（AccordionItem, AccordionTrigger, AccordionContent）
- **ProgressBar**: プログレスバー
- **EmptyState**: 空状態表示

**ナビゲーション系**
- **BackLink**: 戻るリンク
- **RoastLevelBadge**: 焙煎度バッジ

#### 技術要素

| 要素 | 内容 |
|-----|------|
| **ディレクトリ** | `components/ui/` |
| **エクスポート数** | 19個（`components/ui/index.ts`） |
| **レジストリ** | `components/ui/registry.tsx`（UIカタログ） |
| **テストページ** | `/dev/design-lab`（Developer Design Lab、開発者モードで表示） |

#### UI実装ルール（重要：全機能共通）

**1. 共通コンポーネント使用必須**
- ✅ **必須**: `@/components/ui` のコンポーネントを使用
- ❌ **禁止**: 生のTailwindでボタン/カード/入力を作成

**2. テーマ対応はCSS変数で自動**
- テーマ切替は `data-theme` 属性 + CSS変数で自動適用（6テーマ対応）
- コンポーネント側でのテーマ判定は不要
- テーマ固有の装飾要素（snowfall等）のみ、CSS `[data-theme]` セレクタまたは `useAppTheme()` で条件レンダリング

```tsx
// ✅ テーマは自動適用。propは不要
<Button variant="primary">保存</Button>
<Card variant="table">...</Card>
<Input label="名前" />

// ✅ テーマ固有の装飾要素のみ条件レンダリング
const { isChristmasTheme } = useAppTheme();
{isChristmasTheme && <Snowfall />}

// ❌ テーマをpropで渡さない
<Button theme="christmas">保存</Button>
```

**3. 配色参照**
- ✅ **参照**: `.claude/skills/roastplus-ui/references/design-tokens.md`

**4. 新規コンポーネント追加時のレジストリ登録**
新しい共通UIコンポーネントを作成した場合、**必ず以下の手順で登録すること**：

1. `components/ui/NewComponent.tsx` を作成
2. `components/ui/index.ts` にエクスポートを追加
3. `components/ui/registry.tsx` に以下を追加：
   - デモコンポーネント（`NewComponentDemo`関数）
   - `componentRegistry`配列にエントリを追加（name, description, category, Demo）

```typescript
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

→ Developer Design Lab（`/dev/design-lab`）に自動表示される

#### テーマシステム

**アーキテクチャ**
- **テーマ管理**: `next-themes` ライブラリ（SSR対応、フラッシュ防止、タブ間同期）
- **テーマ定義**: CSS変数（`@layer theme` in `globals.css`）
- **テーマプロバイダー**: `components/ThemeProvider.tsx`（アプリ全体をラップ）
- **テーマ定数**: `lib/theme.ts`（テーマプリセット定数、ThemePreset型、isDarkTheme関数）
- **テーマ保存**: localStorage（端末ごとに独立、Firestoreには保存しない）
- **テーマ切替属性**: `data-theme` 属性（`<html>` 要素に付与）

**利用可能テーマ（6種類）**

| テーマID | 表示名 | タイプ | コンセプト |
|---------|--------|--------|-----------|
| `default` | デフォルト | ライト | 暖かいコーヒー系ライトテーマ |
| `dark-roast` | ダークロースト | ダーク | 深煎りエスプレッソの高級感 |
| `light-roast` | ライトロースト | ライト | 浅煎りの朝のハンドドリップ感 |
| `matcha` | 抹茶ラテ | ダーク | 和カフェの落ち着き |
| `caramel` | キャラメルマキアート | ダーク | 秋の収穫祭の温かさ |
| `christmas` | クリスマス | ダーク | ホリデーシーズンの特別テーマ |

**セマンティックCSS変数トークン**

| カテゴリ | トークン | 用途 |
|---------|---------|------|
| 背景 | `bg-page` | ページ全体の背景 |
| 背景 | `bg-surface` | カード・パネル背景（半透明OK） |
| 背景 | `bg-overlay` | モーダル・ダイアログ背景（不透明必須） |
| 背景 | `bg-ground` | セクション背景・テーブルヘッダー |
| 背景 | `bg-field` | 入力フィールド背景 |
| テキスト | `text-ink` | 本文テキスト |
| テキスト | `text-ink-sub` | 補足テキスト |
| テキスト | `text-ink-muted` | 薄いテキスト |
| ボーダー | `border-edge` | 通常ボーダー |
| ボーダー | `border-edge-strong` | 強調ボーダー |
| アクセント | `bg-spot` / `text-spot` | アクセントカラー |
| アクセント | `bg-spot-hover` | ホバー時アクセント |
| アクセント | `bg-spot-subtle` / `bg-spot-surface` | 薄いアクセント背景 |

**CSS変数の使い分け（重要）**

| 変数 | 通常モード | ダークテーマ | 用途 |
|------|-----------|-------------|------|
| `bg-surface` | `#FFFFFF` | `rgba(255,255,255,0.05)` | カード・セクション（半透明OK） |
| `bg-overlay` | `#FFFFFF` | 不透明な暗色 | モーダル・ダイアログ（不透明必須） |
| `bg-ground` | `#F3F4F6` | `rgba(255,255,255,0.08)` | ページ背景・テーブルヘッダー |

**テーマhook**

| hook | 用途 |
|------|------|
| **`useAppTheme()`** | 汎用テーマhook（currentTheme, setTheme, presets, isDarkTheme, isChristmasTheme） |
| **`useChristmasMode()`** | クリスマステーマ切替用（toggleChristmasMode等。Design Lab等で使用） |

**テーマ固有装飾の実装方法**
1. **CSS `[data-theme]` セレクタ（推奨）**: `[data-theme="christmas"] .my-element { display: block; }`
2. **`useAppTheme().isChristmasTheme`**: JSX内の条件レンダリングが必要な場合
3. **用途限定**: 条件レンダリングのみ。コンポーネントへのテーマprop渡しには使わない

#### 共通UIの禁止事項
1. ❌ 共通コンポーネントの重複作成（既存コンポーネントを必ず確認）
2. ❌ 生のTailwindでのボタン/カード/入力作成
3. ❌ テーマをpropとしてコンポーネントに渡す（CSS変数で自動対応）
4. ❌ ハードコード色の使用（セマンティックCSS変数を使用すること）
5. ❌ モーダル背景に `bg-surface` を使用（ダークテーマで透過するため `bg-overlay` を使用）

### 通知（Notifications）
- **目的**: バージョン更新通知
- **技術**: トースト通知（`toast()`）

### 設定（Settings）
- **目的**: 開発者モード、テーマ設定、アプリバージョン管理
- **パス**: `/settings`（設定一覧）、`/settings/theme`（テーマ設定専用ページ）
- **技術**: localStorage（テーマ）、Firestore（開発者モード）
- **テーマ設定UI**: カードグリッド形式で7テーマプリセットから選択

### Developer Design Lab
- **目的**: 開発者向けデザインモック検証ツール
- **パス**: `/dev/design-lab`（開発者モード有効時のみアクセス可）
- **セクション**: コンポーネントギャラリー、アニメーション、ページモック、カラーパレット、タイポグラフィ、バリエーション、パターン比較、レスポンシブプレビュー
- **技術**: タブ切替式サイドナビ、既存registry.tsx/splashPatterns連携
- **統合元**: `/ui-test`（リダイレクト）、`/dev/splash-preview`（リダイレクト）

### 変更履歴（Changelog）
- **目的**: リリースノート表示
- **技術**: マークダウンファイル読み込み

### デジタル時計（Clock）
- **目的**: 遠距離視認性に優れた大型デジタル時計表示
- **パス**: `/clock`
- **技術**: localStorage（表示設定）

### 関連ADR
- [ADR-008] ロゴを画像からテキストベースに変更（`docs/steering/TECH_SPEC.md` 参照）
- [ADR-011] next-themes + Tailwind v4 CSS変数によるテーマシステム（`docs/steering/TECH_SPEC.md` 参照）

---

## Firestoreデータモデル概要

本アプリのデータは主に `users/{userId}` ドキュメント内のフィールドとして格納される。独立したトップレベルコレクションではない点に注意。

| データ種別 | 格納場所 | 備考 |
|-----------|---------|------|
| ユーザー情報 | `users/{userId}` ドキュメント | プロファイル、設定等 |
| 焙煎記録 | `users/{userId}` のフィールド | |
| ドリップレシピ | `users/{userId}` のフィールド | |
| クイズ進捗 | `users/{userId}` のフィールド | |
| テイスティング | `users/{userId}` のフィールド | |
| スケジュール | `users/{userId}` のフィールド | |
| 作業進捗 | `users/{userId}` の `workProgresses` フィールド | 配列 |
| 担当表 | サブコレクション | Assignment固有のデータ構造 |
| 欠点豆 | `defectBeans` コレクション | 共有データ（全ユーザー共通） |
| メタデータ | `_meta` コレクション | システム管理用 |

---

## AI機能概要

本アプリではOpenAI GPT-4oをFirebase Cloud Functions v2経由で使用する。API Routeは使用しない（静的エクスポートのため）。

| 機能 | Cloud Function名 | AIモデル | 用途 |
|------|-----------------|---------|------|
| スケジュールOCR | `ocrScheduleFromImage` | GPT-4o（Vision） | 画像からスケジュール情報を抽出 |
| テイスティング分析 | `analyzeTastingSession` | GPT-4o（テキスト） | フレーバー評価のAI分析 |

**呼び出し方法**: クライアント側で `httpsCallable(functions, 'functionName')` を使用
**シークレット管理**: OPENAI_API_KEY は Firebase Secret Manager で管理
**Cloud Functions配置**: `functions/src/` ディレクトリ

---

## 共通禁止事項（全機能共通）

### 1. UI実装
- ❌ 独自のCSS作成（共通コンポーネント使用必須）
- ❌ `@/components/ui` を使わずにボタン/カード/入力を作成
- ❌ ハードコード色の使用（CSS変数テーマを使用すること）
- ❌ テーマをpropとしてコンポーネントに渡す

### 2. 状態管理
- ❌ 新しい状態管理ライブラリの導入（React useStateで統一）
- ❌ グローバル状態の乱用（ページローカル状態を優先）

### 3. API・バックエンド
- ❌ API Routeの作成（静的エクスポートのためCloud Functionsを使用）
- ❌ クライアント側でのOpenAI API直接呼び出し（Cloud Functions経由必須）

### 4. 設計変更
- ❌ 既存の設計方針を変更する（変更が必要な場合は相談）
- ❌ Firestoreスキーマの根本的変更（互換性維持）

### 5. セキュリティ
- ❌ APIキー・シークレットのコミット（`.env.local` に配置）
- ❌ Firestore Security Rules の緩和（認証必須を維持）

### 6. ドキュメント参照
- ❌ `docs/memory.md` への参照（ADRは `docs/steering/TECH_SPEC.md` に記載）

---

## 機能追加時のチェックリスト

新機能追加時は、以下を確認すること：

- [ ] `@/components/ui` の共通コンポーネントを使用
- [ ] CSS変数テーマが正しく適用されている（ハードコード色なし）
- [ ] 全6テーマで表示確認（特にライト系/ダーク系の切替）
- [ ] `docs/steering/UBIQUITOUS_LANGUAGE.md` に新規用語を追加
- [ ] `docs/steering/FEATURES.md` に機能を追記（本ファイル）
- [ ] Firestore Security Rules を更新（必要な場合）
- [ ] テストを作成（Vitest）
- [ ] Developer Design Lab（`/dev/design-lab`）で表示確認

---

## 参照

- **プロダクトビジョン**: `docs/steering/PRODUCT.md`
- **技術仕様・ADR**: `docs/steering/TECH_SPEC.md`
- **ユビキタス言語**: `docs/steering/UBIQUITOUS_LANGUAGE.md`
- **実装ガイドライン**: `docs/steering/GUIDELINES.md`
- **リポジトリ構造**: `docs/steering/REPOSITORY.md`
