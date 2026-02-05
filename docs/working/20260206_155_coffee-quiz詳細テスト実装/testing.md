# テスト計画

## テスト戦略

### ユニットテスト（Vitest）

#### 1. fsrs.test.ts（新規）

**テスト対象**: FSRS間隔反復学習アルゴリズム

```typescript
describe('fsrs', () => {
  describe('createQuizCard', () => {
    it('should create a new card with initial state');
    it('should set questionId correctly');
  });

  describe('reviewCard', () => {
    it('should increase interval for rating=4 (Easy)');
    it('should decrease interval for rating=1 (Again)');
    it('should increment lapses for rating=1');
    it('should transition state from New to Learning');
  });

  describe('determineRating', () => {
    it('should return rating=4 for 100% correct');
    it('should return rating=1 for 0% correct');
    it('should handle boundary values (50%, 80%)');
  });

  describe('getDueCards', () => {
    it('should return only due cards');
    it('should exclude future cards');
    it('should handle empty array');
  });

  describe('sortCardsByPriority', () => {
    it('should sort by due date ascending');
  });

  describe('getCardMastery', () => {
    it('should calculate retrievability (0-1)');
  });

  describe('isCardMastered', () => {
    it('should return true for retrievability >= 0.9');
    it('should return false for retrievability < 0.9');
  });
});
```

**モック戦略**:
- `date-fns` をモック（日付計算の制御）
- `ts-fsrs` は実際に使用（アルゴリズムの正確性確保）

**カバレッジ目標**: 90%以上

---

#### 2. gamification.test.ts（拡張）

**テスト対象**: XP、レベル、ストリーク、バッジ

```typescript
describe('gamification', () => {
  describe('calculateXP', () => {
    it('should calculate base XP by difficulty (easy=10, medium=20, hard=30)');
    it('should add streak bonus (+5, +10)');
    it('should add perfect bonus (+10)');
    it('should combine bonuses correctly');
  });

  describe('addXP', () => {
    it('should level up when reaching threshold');
    it('should not exceed max level (100)');
    it('should update totalXP correctly');
  });

  describe('updateStreak', () => {
    it('should increment streak for consecutive days');
    it('should reset streak for gap > 1 day');
    it('should not change streak for same day');
    it('should update longestStreak');
    it('should set isAtRisk for 2-day gap');
  });

  describe('updateStats', () => {
    it('should calculate accuracy percentage');
    it('should update category stats');
    it('should update difficulty stats');
  });

  describe('updateDailyGoal', () => {
    it('should calculate progress (answered / target)');
    it('should mark as achieved when 100%');
  });

  describe('checkNewBadges', () => {
    it('should return new badges only');
    it('should handle multiple badge conditions');
    it('should exclude already earned badges');
  });

  describe('earnBadges', () => {
    it('should set earnedAt date');
    it('should add to badges array');
  });

  // エッジケース
  describe('edge cases', () => {
    it('should handle max level (100)');
    it('should handle max streak (365+)');
    it('should handle XP overflow');
  });
});
```

**モック戦略**:
- 最小限（date-fnsのみ）
- バッジ判定は実際のロジックを使用

**カバレッジ目標**: 85%以上（現在27.73% → +57%）

---

#### 3. questions.test.ts（新規）

**テスト対象**: 問題データ管理

```typescript
describe('questions', () => {
  describe('loadAllQuestions', () => {
    it('should load questions from JSON files');
    it('should cache loaded questions');
    it('should return cached questions on second call');
    it('should load at least 50 questions');
  });

  describe('clearQuestionsCache', () => {
    it('should clear cache and reload on next call');
  });

  describe('getQuestionById', () => {
    it('should return question for valid ID');
    it('should return undefined for invalid ID');
  });

  describe('getQuestionsByCategory', () => {
    it('should filter by category (basics, roasting, extraction, origin)');
    it('should return empty array for no matches');
  });

  describe('getQuestionsByDifficulty', () => {
    it('should filter by difficulty (easy, medium, hard)');
  });

  describe('getRandomQuestions', () => {
    it('should return random subset');
    it('should not include duplicates');
    it('should respect count parameter');
  });

  describe('getDailyQuestions', () => {
    it('should return consistent questions for same day');
    it('should respect debug mode date offset');
  });

  describe('getQuestionsStats', () => {
    it('should calculate total count');
    it('should group by category');
    it('should group by difficulty');
  });

  describe('shuffleArray', () => {
    it('should shuffle elements');
    it('should preserve array length');
  });

  describe('shuffleOptions', () => {
    it('should shuffle options array');
    it('should update correctAnswer index');
  });

  // エラーハンドリング
  describe('error handling', () => {
    it('should handle file read errors gracefully');
    it('should handle empty JSON array');
    it('should handle malformed JSON');
  });
});
```

**モック戦略**:
- ファイル読み込みはモックしない（実際のJSONを使用）
- エラーハンドリングテストのみモック使用

**カバレッジ目標**: 85%以上

---

#### 4. debug.test.ts（新規）

**テスト対象**: デバッグユーティリティ

```typescript
describe('debug', () => {
  beforeEach(() => {
    resetDebugState(); // 各テスト前にリセット
  });

  describe('setDebugMode / isDebugMode', () => {
    it('should default to false');
    it('should enable debug mode');
    it('should disable debug mode');
  });

  describe('setDebugDateOffset / getDebugDateOffset', () => {
    it('should default to 0');
    it('should set positive offset (+7 days)');
    it('should set negative offset (-7 days)');
  });

  describe('getCurrentDate', () => {
    it('should return current date when debug mode off');
    it('should return offset date when debug mode on');
  });

  describe('getDebugTodayDateString', () => {
    it('should return YYYY-MM-DD format');
    it('should reflect date offset');
  });

  describe('resetDebugState', () => {
    it('should reset mode to false');
    it('should reset offset to 0');
  });
});
```

**モック戦略**:
- なし（グローバル変数のテストのみ）

**カバレッジ目標**: 70%以上

---

## テストケース詳細

### fsrs.test.ts テストケース

| テストケース | 入力 | 期待出力 |
|-------------|-----|---------|
| **createQuizCard** | questionId='q1' | state=New, reps=0, lapses=0 |
| **reviewCard (rating=1)** | card={reps:0}, rating=1 | lapses+1, interval短縮 |
| **reviewCard (rating=4)** | card={reps:0}, rating=4 | lapses変化なし, interval延長 |
| **determineRating (100%)** | total=10, correct=10 | rating=4 |
| **determineRating (0%)** | total=10, correct=0 | rating=1 |
| **determineRating (50%)** | total=10, correct=5 | rating=2 |
| **getDueCards (過去)** | due=昨日, now=今日 | カードを含む |
| **getDueCards (未来)** | due=明日, now=今日 | 空配列 |
| **getCardMastery** | retrievability=0.95 | 0.95 |
| **isCardMastered (境界)** | retrievability=0.9 | true |
| **isCardMastered (未満)** | retrievability=0.89 | false |

---

### gamification.test.ts テストケース

| テストケース | 入力 | 期待出力 |
|-------------|-----|---------|
| **calculateXP (easy)** | difficulty='easy', streak=0 | 10 |
| **calculateXP (hard+streak)** | difficulty='hard', streak=3 | 30+5=35 |
| **calculateXP (perfect)** | isPerfect=true | base+10 |
| **addXP (レベルアップ)** | currentXP=95, addXP=10 | level+1, xp=5 |
| **addXP (上限)** | level=100, addXP=100 | level=100（変化なし） |
| **updateStreak (連続)** | lastDate=昨日 | currentStreak+1 |
| **updateStreak (中断)** | lastDate=3日前 | currentStreak=1 |
| **updateStreak (リスク)** | lastDate=2日前 | isAtRisk=true |
| **checkNewBadges** | totalXP=1000, earned=[] | "XP Master"バッジ |
| **updateStats** | total=10, correct=8 | accuracy=80% |

---

### questions.test.ts テストケース

| テストケース | 入力 | 期待出力 |
|-------------|-----|---------|
| **loadAllQuestions** | - | 50問以上のQuizQuestion[] |
| **getQuestionById** | id='q1' | QuizQuestion |
| **getQuestionById (無効)** | id='invalid' | undefined |
| **getQuestionsByCategory** | category='basics' | basics問題のみ |
| **getQuestionsByDifficulty** | difficulty='hard' | hard問題のみ |
| **getRandomQuestions** | count=5 | 5問（ランダム、重複なし） |
| **getDailyQuestions** | today='2026-02-06', count=10 | 10問（一貫性） |
| **getQuestionsStats** | - | {total, byCategory, byDifficulty} |
| **shuffleArray** | [1,2,3,4,5] | [3,1,4,2,5]（順序変化） |
| **shuffleOptions** | question | options順序変化、correctAnswer更新 |

---

### debug.test.ts テストケース

| テストケース | 入力 | 期待出力 |
|-------------|-----|---------|
| **isDebugMode (初期)** | - | false |
| **setDebugMode** | true | isDebugMode()=true |
| **getDebugDateOffset (初期)** | - | 0 |
| **setDebugDateOffset** | days=7 | getDebugDateOffset()=7 |
| **getCurrentDate (OFF)** | debugMode=false | 実際の現在日時 |
| **getCurrentDate (ON)** | debugMode=true, offset=7 | 7日後の日時 |
| **getDebugTodayDateString** | offset=7 | "2026-02-13" |
| **resetDebugState** | - | mode=false, offset=0 |

---

## カバレッジ目標

### ファイル別カバレッジ

| ファイル | 現在 | 目標 | 増分 |
|---------|-----|------|------|
| **fsrs.ts** | 0% | 90% | +90% |
| **gamification.ts** | 27.73% | 85% | +57.27% |
| **questions.ts** | 0% | 85% | +85% |
| **debug.ts** | 3.84% | 70% | +66.16% |
| **types.ts** | 100% | 100% | 0% |

### lib/coffee-quiz/ 全体カバレッジ

- **現在**: 24.44%
- **目標**: 80%以上
- **増分**: +55.56%

### 全体カバレッジへの影響

- **プロジェクト全体（現在）**: 76.19%
- **プロジェクト全体（目標）**: 80-82%
- **増分**: +3.81-5.81%

---

## テスト実行コマンド

### 全テスト実行
```bash
npm run test
```

### カバレッジ付き実行
```bash
npm run test -- --coverage
```

### 特定ファイルのみテスト
```bash
npm run test -- lib/coffee-quiz/fsrs.test.ts
```

### ウォッチモード（開発中）
```bash
npm run test -- --watch
```

---

## 非機能テスト

### パフォーマンステスト

| テスト項目 | 目標 | 測定方法 |
|-----------|------|---------|
| 全テスト実行時間 | 5秒以内 | `npm run test` の実行時間 |
| loadAllQuestions | 500ms以内 | `performance.now()` で測定 |
| FSRS計算（1000カード） | 1秒以内 | ループでreviewCard実行 |

### メモリ使用量

- 問題データキャッシュ: 1MB以内（想定）
- テスト実行時のメモリリーク: なし

### エッジケーステスト

| エッジケース | テスト内容 |
|------------|-----------|
| 空配列処理 | `getDueCards([])` が空配列を返す |
| null/undefined | `getQuestionById(null)` が undefined を返す |
| 最大値 | level=100, XP=999999 でオーバーフローしない |
| 負数 | rating=-1, offset=-9999 で正しくエラーハンドリング |

---

## テスト実装の優先順位

1. **最優先**: fsrs.test.ts（カバレッジ+90%、コアロジック）
2. **高優先度**: gamification.test.ts拡張（カバレッジ+57%）
3. **高優先度**: questions.test.ts（カバレッジ+85%）
4. **低優先度**: debug.test.ts（カバレッジ+66%、ユーティリティ）

---

## テスト実装のベストプラクティス

### 1. AAA（Arrange-Act-Assert）パターン

```typescript
it('should increment streak for consecutive days', () => {
  // Arrange
  const streakInfo = { currentStreak: 5, lastActivityDate: '2026-02-05' };

  // Act
  const result = updateStreak(streakInfo, '2026-02-06');

  // Assert
  expect(result.currentStreak).toBe(6);
});
```

### 2. 1テスト=1アサーション原則

```typescript
// ✅ Good
it('should return rating=4 for 100% correct', () => {
  expect(determineRating(10, 10)).toBe(4);
});

// ❌ Bad
it('should calculate rating correctly', () => {
  expect(determineRating(10, 10)).toBe(4);
  expect(determineRating(10, 5)).toBe(2);
  expect(determineRating(10, 0)).toBe(1);
});
```

### 3. describeでグルーピング

```typescript
describe('fsrs', () => {
  describe('createQuizCard', () => {
    // createQuizCardのテスト
  });

  describe('reviewCard', () => {
    // reviewCardのテスト
  });
});
```

### 4. beforeEach/afterEachでセットアップ

```typescript
describe('debug', () => {
  beforeEach(() => {
    resetDebugState(); // 各テスト前にリセット
  });

  it('should ...', () => {
    // テスト
  });
});
```

---

## テスト失敗時の対応

### 1. カバレッジ未達成（<80%）

- 未テスト関数を洗い出し
- 境界値テストを追加
- エラーハンドリングテストを追加

### 2. テスト実行時間超過（>5秒）

- モックの見直し（不要な実処理を削減）
- 非同期処理の最適化
- 並列実行の検討

### 3. 回帰テスト失敗

- 既存テストの修正（実装変更がない場合）
- 実装バグの修正（意図しない挙動変更）

---

## 完了基準

- [ ] 全テストが合格（npm run test）
- [ ] lib/coffee-quiz/ カバレッジ: 80%以上
- [ ] Lintエラーなし（npm run lint）
- [ ] ビルド成功（npm run build）
- [ ] 既存テストが壊れていない
- [ ] Working Documents更新（tasklist.mdチェック完了）
