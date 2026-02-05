# 設計書

## アーキテクチャ概要

```
lib/coffee-quiz/
├── fsrs.ts           ← FSRS間隔反復学習アルゴリズム
├── gamification.ts   ← XP、レベル、ストリーク、バッジ
├── questions.ts      ← 問題データ管理、キャッシュ
├── debug.ts          ← デバッグユーティリティ
└── types.ts          ← 型定義（テスト済み）

テスト実装:
├── fsrs.test.ts      ← 新規作成（優先度: 最高）
├── gamification.test.ts ← 拡張（現在27.73%）
├── questions.test.ts ← 新規作成（優先度: 高）
└── debug.test.ts     ← 新規作成（優先度: 低）
```

## 実装方針

### 新規作成ファイル

#### 1. `lib/coffee-quiz/fsrs.test.ts`（新規、優先度: 最高）

**テスト対象関数**:
- `createQuizCard(questionId: string): QuizCard`
- `reviewCard(card: QuizCard, rating: Rating, now?: Date): QuizCard`
- `determineRating(totalAnswers: number, correctAnswers: number): Rating`
- `getDueCards(cards: QuizCard[], now?: Date): QuizCard[]`
- `sortCardsByPriority(cards: QuizCard[]): QuizCard[]`
- `getCardMastery(card: QuizCard): number`
- `isCardMastered(card: QuizCard): boolean`

**テスト戦略**:
- vi.mockでdate-fnsをモック（日付計算の制御）
- 実際のFSRS

ライブラリを使用（ts-fsrsをモックしない）
- 境界値テスト: rating=1〜4の全パターン
- 日付計算: 過去・未来・同日のテスト

#### 2. `lib/coffee-quiz/questions.test.ts`（新規、優先度: 高）

**テスト対象関数**:
- `loadAllQuestions(): Promise<QuizQuestion[]>`
- `getQuestionById(id: string): QuizQuestion | undefined`
- `getQuestionsByCategory(category: QuizCategory): QuizQuestion[]`
- `getQuestionsByDifficulty(difficulty: QuizDifficulty): QuizQuestion[]`
- `getDailyQuestions(count: number, today: string): QuizQuestion[]`
- `getQuestionsStats(): QuestionStats`
- `shuffleArray<T>(array: T[]): T[]`
- `shuffleOptions(question: QuizQuestion): QuizQuestion`

**テスト戦略**:
- モック不要（JSONファイルを実際に読み込む）
- キャッシュの動作確認（`questionsCache`）
- デバッグモード対応（debug.tsとの連携）

#### 3. `lib/coffee-quiz/debug.test.ts`（新規、優先度: 低）

**テスト対象関数**:
- `setDebugMode(enabled: boolean): void`
- `isDebugMode(): boolean`
- `setDebugDateOffset(days: number): void`
- `getDebugDateOffset(): number`
- `getCurrentDate(): Date`
- `getDebugTodayDateString(): string`
- `resetDebugState(): void`

**テスト戦略**:
- グローバル変数の状態管理テスト
- beforeEach/afterEachでリセット

### 変更対象ファイル

#### 4. `lib/coffee-quiz/gamification.test.ts`（既存、拡張）

**現状**: 27.73%カバレッジ（基礎テストのみ）

**追加テスト**:
- `addXP` のレベルアップパターン
- `updateStreak` の連続・中断・リスク判定
- `updateStats` のカテゴリ別統計
- `updateDailyGoal` の進捗計算
- `checkNewBadges` の全バッジパターン（10種類以上）
- エッジケース（最大レベル100、XP上限）

## データモデル

### FSRS関連

```typescript
interface QuizCard {
  questionId: string;
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: State; // New | Learning | Review | Relearning
  lastReview?: Date;
}

type Rating = 1 | 2 | 3 | 4; // Again | Hard | Good | Easy
```

### ゲーミフィケーション関連

```typescript
interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  xpForNextLevel: number;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  isAtRisk: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  condition: (context: BadgeCheckContext) => boolean;
  earnedAt?: string;
}
```

## テスト設計

### ユニットテスト構成

```
describe('fsrs', () => {
  describe('createQuizCard', () => {
    it('新規カードの初期状態を正しく生成する');
    it('state=New, reps=0を持つ');
  });

  describe('reviewCard', () => {
    it('rating=1（Again）で復習間隔が短くなる');
    it('rating=4（Easy）で復習間隔が長くなる');
    it('lapses（失敗回数）が増加する（rating=1の場合）');
    it('state遷移が正しい（New→Learning→Review）');
  });

  describe('determineRating', () => {
    it('正解率100%でrating=4を返す');
    it('正解率0%でrating=1を返す');
    it('境界値（50%, 80%）で正しいratingを返す');
  });

  // ... 他の関数も同様
});
```

### モック戦略

#### モックする対象
- **date-fns**: `addDays`, `differenceInDays`（日付計算の制御）
- **debug.ts**: `getCurrentDate`（日付オフセット制御）

#### モックしない対象
- **ts-fsrs**: 実際のFSRSアルゴリズムを使用（正確性確保）
- **JSON問題データ**: 実際のファイルを読み込む（統合性確保）

### 境界値テスト

| 対象 | 境界値 | 期待結果 |
|------|--------|---------|
| determineRating | totalAnswers=0 | rating=1 |
| getDueCards | now=due（同日） | カードを含む |
| getCardMastery | retrievability=0.9 | 定着判定境界 |
| addXP | XP=レベルアップ閾値 | レベル+1 |
| updateStreak | lastActivityDate=昨日 | currentStreak+1 |

## 依存関係

### 外部依存
- **ts-fsrs**: FSRSアルゴリズム実装
- **date-fns**: 日付計算

### 内部依存
- `lib/coffee-quiz/types.ts`: 型定義
- `lib/coffee-quiz/debug.ts`: デバッグモード（questions.tsで使用）

### 影響範囲
- **影響なし**: テストコードのみ、既存実装には変更なし
- **既存テストへの影響**: なし（新規追加のみ）

## 禁止事項チェック

- ❌ **実装コードの修正禁止**: テストのみ実装、既存ロジックは変更しない
- ❌ **モックの乱用禁止**: FSRSアルゴリズムは実際に動作させる
- ❌ **テストの複雑化禁止**: 1テスト=1アサーション原則
- ❌ **カバレッジ至上主義禁止**: 80%達成後は無理に100%を目指さない

## UI実装ルール確認

**該当なし**（テスト実装のため、UI変更なし）

## ADR（この設計の決定事項）

### Decision-001: FSRSアルゴリズムをモックしない

**理由**:
- FSRSの正確性がクイズ機能の根幹
- モックすると、アルゴリズムの回帰を検出できない
- ts-fsrsは安定しており、モックの必要性が低い

**影響**:
- テスト実行時間がやや増加（+1秒程度）
- FSRSライブラリの更新時にテストが壊れる可能性

### Decision-002: 問題データ（JSON）を実際にロードする

**理由**:
- ファイル読み込みロジックの正確性確保
- 問題データ形式の検証（JSONスキーマ）
- モックでは発見できないパス問題を検出

**影響**:
- テストが遅くなる（ファイルI/O）
- 問題データが変更されるとテストが壊れる可能性

### Decision-003: カバレッジ目標を80%に設定

**理由**:
- 100%は非現実的（エラーハンドリングの一部はモック困難）
- 80%でコアロジックは十分カバー
- 残り20%は実運用でのテストで補完

**影響**:
- 一部の条件分岐が未テスト（デバッグログ等）
- 将来のリファクタリング時に追加テストが必要
