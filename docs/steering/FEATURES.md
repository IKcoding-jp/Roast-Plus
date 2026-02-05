# Features

**最終更新**: 2026-02-05

---

## 目次

1. [担当表（Assignment）](#1-担当表assignment)
2. [焙煎タイマー（Roast Timer）](#2-焙煎タイマーroast-timer)
3. [ドリップガイド（Drip Guide）](#3-ドリップガイドdrip-guide)
4. [コーヒークイズ（Coffee Quiz）](#4-コーヒークイズcoffee-quiz)
5. [テイスティング（Tasting）](#5-テイスティングtasting)
6. [スケジュール管理（Schedule）](#6-スケジュール管理schedule)
7. [共通UI（UI Components）](#7-共通uiui-components)
8. [その他機能](#8-その他機能)

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

#### クリスマスモード対応
- ✅ **必須**: 全コンポーネントに `isChristmasMode` propを渡す

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/assignment/page.tsx` |
| **コンポーネント** | `components/assignment-table/DesktopTableView.tsx` (CCN: 125 ← リファクタリング対象)<br>`components/assignment-table/TableModals.tsx` (CCN: 117 ← リファクタリング対象) |
| **Firestore** | `assignments` コレクション |
| **状態管理** | React state（Zustand未使用） |

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

### 関連Issue
- Issue #101〜#103: リファクタリング（モジュール分割）
- Issue #150: コードレビュー修正

### 過去の意思決定
- [ADR-010] 機能別モジュール分割パターン（`docs/memory.md` 参照）

---

## 2. 焙煎タイマー（Roast Timer）

### 目的
焙煎時間の正確な計測、温度記録のOCR読み取り

### 主要ユースケース
1. タイマー開始/停止/リセット
2. 温度ラベルOCR（OpenAI GPT-4o Vision）
3. 焙煎記録の保存（Firestore）
4. 焙煎履歴の閲覧

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Input` を使用
- ❌ **禁止**: 独自のタイマー表示コンポーネント作成（既存の`TimerDisplay`を使用）

#### クリスマスモード対応
- ✅ **必須**: `isChristmasMode` prop

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/roast-timer/page.tsx` |
| **コンポーネント** | `components/roast-timer/`（サブモジュール分割済み）<br>`TimerDisplay.tsx`, `PhaseButtons.tsx` |
| **フック** | `hooks/roast-timer/useRoastTimer.ts` |
| **OCR** | OpenAI Vision API（`/api/ocr-roast-label`） |
| **Firestore** | `roastRecords` コレクション |

### 設計方針

#### 状態管理
- **ツール**: React useState（軽量なため）
- **理由**: タイマーはページローカルの状態、グローバル状態不要

#### OCR処理
- **ツール**: OpenAI GPT-4o Vision
- **理由**: [ADR-004] Google Vision API → OpenAI統一

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
1. ❌ Redux等の新しい状態管理ライブラリの導入
2. ❌ サードパーティのタイマーライブラリの追加（独自実装を維持）
3. ❌ タイマーロジックの根本的変更（バグ修正のみ）

### 関連Issue
- Issue #xxx: OCR機能追加

### 過去の意思決定
- [ADR-004] OCR処理のOpenAI統一（`docs/memory.md` 参照）
- [ADR-010] サブモジュール分割（`docs/memory.md` 参照）

---

## 3. ドリップガイド（Drip Guide）

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

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/drip-guide/page.tsx`（レシピ一覧）<br>`app/drip-guide/run/page.tsx`（ガイド実行） |
| **コンポーネント** | `components/drip-guide/RecipeCard.tsx`<br>`components/drip-guide/MethodDialog.tsx` |
| **ロジック** | `lib/drip-guide/recipe.ts`（レシピ計算）<br>`lib/drip-guide/46method.ts`（4:6メソッド計算） |
| **フック** | `hooks/drip-guide/useRecipeGuide.ts` |
| **Firestore** | `dripRecipes` コレクション |

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

### 関連Working Documents例
- `docs/drip-guide-46*.md`（9ファイル） ← 4:6メソッド実装時の作業用ドキュメント

### 過去の意思決定
- [ADR-010] サブモジュール分割（`docs/memory.md` 参照）

---

## 4. コーヒークイズ（Coffee Quiz）

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

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/coffee-trivia/page.tsx`（クイズ実行）<br>`app/coffee-trivia/stats/page.tsx` (CCN: 97 ← リファクタリング対象) |
| **コンポーネント** | `components/coffee-quiz/QuizCard.tsx`<br>`components/coffee-quiz/QuizOption.tsx` |
| **ロジック** | `lib/coffee-quiz/gamification.ts`（XP計算）<br>`lib/coffee-quiz/fsrs.ts`（FSRS計算） |
| **Firestore** | `quizProgress` コレクション<br>`userStats` コレクション |

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

### 関連Issue
- Issue #xxx: FSRS実装

### 過去の意思決定
- [ADR-xxx] FSRS採用（将来的に追記予定）

---

## 5. テイスティング（Tasting）

### 目的
コーヒーの味わい評価、AI分析

### 主要ユースケース
1. テイスティングセッション作成
2. フレーバーホイール評価（5軸: aroma, acidity, sweetness, body, aftertaste）
3. AI分析（OpenAI GPT-4o）自動実行
4. 他ユーザーの感想閲覧

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Textarea` を使用
- ❌ **禁止**: 独自のフレーバーホイールコンポーネント作成（既存の`FlavorWheel`を使用）

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/tasting/page.tsx` |
| **コンポーネント** | `components/tasting/FlavorWheel.tsx`<br>`components/tasting/TastingCard.tsx` |
| **AI** | OpenAI GPT-4o（`/api/analyze-tasting`） |
| **Firestore** | `tastingSessions` コレクション |

### 設計方針

#### フレーバーホイール評価
- **5軸評価**: aroma（香り）, acidity（酸味）, sweetness（甘み）, body（ボディ）, aftertaste（余韻）
- **スコア**: 1〜5の5段階評価

#### AI分析
- **自動実行**: フレーバーホイール評価後、自動的にAI分析を実行
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

### 関連Issue
- Issue #xxx: AI分析機能追加

### 過去の意思決定
- [ADR-005] AI分析を自動実行パターンに変更（`docs/memory.md` 参照）

---

## 6. スケジュール管理（Schedule）

### 目的
業務予定のOCR読み取り、一覧表示

### 主要ユースケース
1. スケジュール画像のOCR（OpenAI Vision API）
2. スケジュール一覧・編集
3. 今日の予定表示

### UI実装ルール

#### 共通コンポーネント使用
- ✅ **必須**: `Button`, `Card`, `Input` を使用

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ページ** | `app/schedule/page.tsx` |
| **OCR** | OpenAI Vision API（`/api/ocr-schedule`） |
| **Firestore** | `schedules` コレクション |

### 設計方針

#### OCR処理
- **ツール**: OpenAI GPT-4o Vision
- **理由**: [ADR-004] Google Vision API → OpenAI統一

### 禁止事項
1. ❌ OCR処理のGoogle Vision API への戻し（OpenAI統一を維持）

### 関連Issue
- Issue #xxx: OCR統一化

### 過去の意思決定
- [ADR-004] OCR処理のOpenAI統一（`docs/memory.md` 参照）

---

## 7. 共通UI（UI Components）

### 目的
デザイン統一、クリスマスモード対応

### コンポーネント一覧

#### ボタン系
- **Button**: 基本ボタン（variant: primary, secondary, ghost）
- **IconButton**: アイコンボタン

#### フォーム系
- **Input**: テキスト入力
- **NumberInput**: 数値入力
- **InlineInput**: インライン編集可能入力
- **Textarea**: 複数行テキスト入力
- **Select**: セレクトボックス
- **Checkbox**: チェックボックス
- **Switch**: トグルスイッチ

#### コンテナ系
- **Card**: カード（variant: default, table, feature）
- **Modal**: モーダルダイアログ
- **Dialog**: ダイアログ

#### 表示系
- **Badge**: バッジ
- **Tabs**: タブ
- **Accordion**: アコーディオン
- **ProgressBar**: プログレスバー
- **EmptyState**: 空状態表示

### 技術要素

| 要素 | 内容 |
|-----|------|
| **ディレクトリ** | `components/ui/` |
| **コンポーネント数** | 27個 |
| **レジストリ** | `components/ui/registry.tsx`（UIカタログ） |
| **テストページ** | `/ui-test`（開発者モードで表示） |

### UI実装ルール（重要：全機能共通）

#### 1. 共通コンポーネント使用必須
- ✅ **必須**: `@/components/ui` のコンポーネントを使用
- ❌ **禁止**: 生のTailwindでボタン/カード/入力を作成

#### 2. クリスマスモード対応必須
- ✅ **必須**: 全コンポーネントに `isChristmasMode` propを渡す
- **取得方法**: `const { isChristmasMode } = useChristmasMode();`

#### 3. 配色参照
- ✅ **参照**: `.claude/skills/roastplus-ui/references/color-schemes.md`

#### 4. 新規コンポーネント追加時のレジストリ登録
新しい共通UIコンポーネントを作成した場合、**必ず以下の手順で登録すること**：

1. `components/ui/NewComponent.tsx` を作成
2. `components/ui/index.ts` にエクスポートを追加
3. `components/ui/registry.tsx` に以下を追加：
   - デモコンポーネント（`NewComponentDemo`関数）
   - `componentRegistry`配列にエントリを追加（name, description, category, Demo）

```typescript
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

### クリスマスモード実装パターン

```tsx
const { isChristmasMode } = useChristmasMode();

<Button variant="primary" isChristmasMode={isChristmasMode}>保存</Button>
<Card variant="table" isChristmasMode={isChristmasMode}>...</Card>
<Input label="名前" isChristmasMode={isChristmasMode} />
```

### クリスマスモード仕様

#### 視覚効果
- **雪の結晶アニメーション**: SVG、Framer Motion
- **配色変更**: 赤・緑・金（`.claude/skills/roastplus-ui/references/color-schemes.md` 参照）

#### 技術要素
- **状態管理**: `useChristmasMode` フック
- **切り替え**: 設定画面からON/OFF可能

### 禁止事項
1. ❌ 共通コンポーネントの重複作成（既存コンポーネントを必ず確認）
2. ❌ 生のTailwindでのボタン/カード/入力作成
3. ❌ クリスマスモード対応の省略

### 関連Issue
- Issue #153: 雪の結晶デザイン改善

### 過去の意思決定
- [ADR-008] ロゴを画像からテキストベースに変更（`docs/memory.md` 参照）

---

## 8. その他機能

### 通知（Notifications）
- **目的**: バージョン更新通知
- **技術**: トースト通知（`toast()`）

### 設定（Settings）
- **目的**: 開発者モード、テーマ切替
- **技術**: localStorage

### 変更履歴（Changelog）
- **目的**: リリースノート表示
- **技術**: マークダウンファイル読み込み

### 欠点豆図鑑（Defect Beans）
- **目的**: 欠点豆の種類・写真・説明
- **技術**: 静的コンテンツ（`public/images/`）

---

## 共通禁止事項（全機能共通）

### 1. UI実装
- ❌ 独自のCSS作成（共通コンポーネント使用必須）
- ❌ `@/components/ui` を使わずにボタン/カード/入力を作成
- ❌ クリスマスモード対応の省略

### 2. 状態管理
- ❌ Redux等の新しい状態管理ライブラリの導入（Zustand、React stateで統一）
- ❌ グローバル状態の乱用（ページローカル状態を優先）

### 3. 設計変更
- ❌ 既存の設計方針を変更する（変更が必要な場合は相談）
- ❌ Firestoreスキーマの根本的変更（互換性維持）

### 4. セキュリティ
- ❌ APIキー・シークレットのコミット（`.env.local` に配置）
- ❌ Firestore Security Rules の緩和（認証必須を維持）

---

## 機能追加時のチェックリスト

新機能追加時は、以下を確認すること：

- [ ] `@/components/ui` の共通コンポーネントを使用
- [ ] `isChristmasMode` prop を渡している
- [ ] `docs/steering/UBIQUITOUS_LANGUAGE.md` に新規用語を追加
- [ ] `docs/steering/FEATURES.md` に機能を追記（本ファイル）
- [ ] Firestore Security Rules を更新（必要な場合）
- [ ] テストを作成（Vitest）

---

## 参照

- **プロダクトビジョン**: `docs/steering/PRODUCT.md`
- **技術仕様**: `docs/steering/TECH_SPEC.md`
- **ユビキタス言語**: `docs/steering/UBIQUITOUS_LANGUAGE.md`
- **実装ガイドライン**: `docs/steering/GUIDELINES.md`
- **ADR**: `docs/memory.md`
