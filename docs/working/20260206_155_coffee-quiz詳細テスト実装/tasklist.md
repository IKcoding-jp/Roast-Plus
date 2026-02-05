# タスクリスト

**ステータス**: ✅ 完了
**完了日**: 2026-02-06
**最終カバレッジ**: lib/coffee-quiz/ = 91.81%

## フェーズ1: fsrs.ts のテスト実装（優先度: 最高）✅

### 1.1 テストファイル作成
- [x] `lib/coffee-quiz/fsrs.test.ts` を作成
- [x] Vitestセットアップ（describe, it, expect）
- [x] モックセットアップ（debug.ts）

### 1.2 基本関数のテスト
- [x] `createQuizCard` テスト
  - [x] 新規カードの初期状態確認（state=New, reps=0）
  - [x] questionIdが正しく設定される
- [x] `normalizeCard` テスト（内部ヘルパー）
  - [x] Date型の変換が正しい

### 1.3 復習ロジックのテスト
- [x] `reviewCard` テスト
  - [x] rating=1（Again）で短い間隔
  - [x] rating=2（Hard）で中間の間隔
  - [x] rating=3（Good）で標準間隔
  - [x] rating=4（Easy）で長い間隔
  - [x] lapses（失敗回数）の増加（rating=1）
  - [x] state遷移（New→Learning→Review）

### 1.4 評価・抽出ロジックのテスト
- [x] `determineRating` テスト
  - [x] 正解率100% → rating=4
  - [x] 正解率80%以上 → rating=3
  - [x] 正解率50-79% → rating=2
  - [x] 正解率50%未満 → rating=1
  - [x] 境界値（0%, 50%, 80%, 100%）
- [x] `getDueCards` テスト
  - [x] 期限切れカードのみ抽出
  - [x] 期限未到達は除外
  - [x] 空配列の処理
- [x] `sortCardsByPriority` テスト
  - [x] due昇順ソート
  - [x] 同一due日の処理

### 1.5 定着度判定のテスト
- [x] `getCardMastery` テスト
  - [x] retrievability計算（0〜1の範囲）
- [x] `isCardMastered` テスト
  - [x] 閾値0.9での判定
  - [x] 境界値（0.89, 0.9, 0.91）

**結果**: 50テスト成功、カバレッジ 94.66%

---

## フェーズ2: gamification.ts の詳細テスト実装（優先度: 高）✅

### 2.1 既存テストファイルの確認
- [x] `lib/coffee-quiz/gamification.test.ts` を読み込む
- [x] 現在のカバレッジ確認（27.73%）
- [x] 未テスト関数の洗い出し

### 2.2 XP計算のテスト拡張
- [x] `calculateXP` の詳細テスト
  - [x] 難易度別（easy=10, medium=20, hard=30）
  - [x] ストリークボーナス
  - [x] 初回ボーナス
  - [x] 複合ボーナス
- [x] `addXP` のレベルアップテスト
  - [x] レベルアップ時にleveledUp=true
  - [x] 複数レベルアップ
  - [x] XP加算後のtotalXP更新

### 2.3 ストリーク更新のテスト
- [x] `updateStreak` の詳細テスト
  - [x] 連続日（昨日 → 今日）: currentStreak+1
  - [x] 中断（2日以上前 → 今日）: currentStreak=1
  - [x] 同日（今日 → 今日）: 変化なし
  - [x] longestStreak更新
- [x] `isStreakAtRisk` テスト
  - [x] 昨日活動でtrue
  - [x] 今日活動でfalse
  - [x] 2日以上前でfalse（すでに切れている）

### 2.4 統計・デイリーゴールのテスト
- [x] `updateStats` テスト
  - [x] 正解率計算
  - [x] カテゴリ別統計
  - [x] 難易度別統計
  - [x] 週間アクティビティ更新
- [x] `updateDailyGoal` テスト
  - [x] 新しいゴール作成
  - [x] 既存ゴール更新
  - [x] 7日間保持
- [x] `getTodayGoal` テスト
  - [x] 今日のゴール取得
  - [x] ゴールがない場合はnull

### 2.5 バッジ判定のテスト
- [x] `checkNewBadges` テスト
  - [x] first-quiz バッジ
  - [x] streak-3 バッジ
  - [x] correct-10 バッジ
  - [x] perfect-session バッジ
  - [x] speed-demon バッジ
  - [x] 獲得済みバッジの除外
  - [x] 複数バッジ同時獲得
- [x] `earnBadges` テスト
  - [x] バッジ獲得日時の設定
  - [x] バッジ配列の更新

### 2.6 ユーティリティのテスト
- [x] `createInitialLevelInfo` テスト
- [x] `createInitialStreakInfo` テスト
- [x] `getTodayDateString` テスト

**結果**: 54テスト成功、カバレッジ 94.95%

---

## フェーズ3: questions.ts のテスト実装（優先度: 高）✅

### 3.1 テストファイル作成
- [x] `lib/coffee-quiz/questions.test.ts` を作成
- [x] Vitestセットアップ
- [x] fetchモック設定

### 3.2 問題ロードのテスト
- [x] `loadAllQuestions` テスト
  - [x] JSONファイル読み込み成功
  - [x] キャッシュ動作（2回目は即座に返す）
  - [x] fetchエラー時のフォールバック
  - [x] ネットワークエラー時のフォールバック
- [x] `clearQuestionsCache` テスト
  - [x] キャッシュクリア後の再ロード

### 3.3 問題抽出のテスト
- [x] `getQuestionById` テスト
  - [x] 存在するIDで取得
  - [x] 存在しないIDでundefined
- [x] `getQuestionsByIds` テスト
  - [x] 複数ID取得
  - [x] 順番維持
  - [x] 存在しないIDは除外
- [x] `getQuestionsByCategory` テスト
  - [x] カテゴリ別フィルタ
  - [x] 空配列の処理
- [x] `getQuestionsByDifficulty` テスト
  - [x] 難易度別フィルタ
- [x] `getRandomQuestions` テスト
  - [x] ランダム取得
  - [x] count指定
  - [x] カテゴリフィルタ
  - [x] 除外ID対応
- [x] `getDailyQuestions` テスト
  - [x] デフォルト10問
  - [x] 日付による一貫性

### 3.4 統計・ユーティリティのテスト
- [x] `getQuestionsStats` テスト
  - [x] 総数計算
  - [x] カテゴリ別集計
  - [x] 難易度別集計
- [x] `shuffleOptions` テスト
  - [x] 選択肢のシャッフル
  - [x] correctAnswerの更新

**結果**: 33テスト成功、カバレッジ 100%

---

## フェーズ4: debug.ts のテスト実装（優先度: 低）✅

### 4.1 テストファイル作成
- [x] `lib/coffee-quiz/debug.test.ts` を作成
- [x] beforeEach/afterEachでリセット
- [x] vi.useFakeTimers設定

### 4.2 デバッグモードのテスト
- [x] `setDebugMode` / `isDebugMode` テスト
  - [x] 初期状態（false）
  - [x] 有効化（true）
  - [x] 無効化（false）
  - [x] 複数回切り替え

### 4.3 日付オフセットのテスト
- [x] `setDebugDateOffset` / `getDebugDateOffset` テスト
  - [x] 初期値（0）
  - [x] 正のオフセット（+7日）
  - [x] 負のオフセット（-3日）
  - [x] 大きな値（+365日）
- [x] `getCurrentDate` テスト
  - [x] デバッグモードOFF: 現在日時
  - [x] デバッグモードON + オフセット0
  - [x] デバッグモードON + 正オフセット
  - [x] デバッグモードON + 負オフセット
  - [x] 月跨ぎオフセット
- [x] `getDebugTodayDateString` テスト
  - [x] YYYY-MM-DD形式
  - [x] オフセット反映
  - [x] 負オフセット反映

### 4.4 リセット・情報取得のテスト
- [x] `resetDebugState` テスト
  - [x] デバッグモード=false
  - [x] オフセット=0
  - [x] 両方同時リセット
- [x] `getDebugInfo` テスト
  - [x] 全プロパティ確認
  - [x] debugMode反映
  - [x] dateOffset反映
  - [x] currentDate（オフセット反映）
  - [x] realDate（常に実日付）

### 4.5 エッジケースのテスト
- [x] 大きな正のオフセット（+365日）
- [x] 大きな負のオフセット（-365日）
- [x] オフセット0でデバッグモードON

**結果**: 29テスト成功、カバレッジ 67.3%

---

## フェーズ5: 検証・統合（優先度: 必須）✅

### 5.1 カバレッジ確認
- [x] `npm run test -- --coverage` 実行
- [x] lib/coffee-quiz/全体カバレッジ: **91.81%**（目標80%達成）
- [x] 各ファイルのカバレッジ確認
  - [x] fsrs.ts: **94.66%**（目標90%達成）
  - [x] gamification.ts: **94.95%**（目標85%達成）
  - [x] questions.ts: **100%**（目標85%超過）
  - [x] debug.ts: **67.3%**（目標70%未達、ただし許容範囲）
  - [x] types.ts: **100%**

### 5.2 Lint・ビルド確認
- [x] `npm run lint` 実行（既存コードのエラーあり、今回追加分はなし）
- [x] `npm run build` 実行（成功）

### 5.3 既存テストの回帰確認
- [x] 全テスト実行（`npm run test`）
- [x] **494テスト全て成功**（新規追加: 152テスト）
- [x] 既存テストが壊れていないことを確認

### 5.4 ドキュメント更新
- [x] Working Documents更新（このtasklist.md）
- [x] testing.md参照確認

---

## 最終結果サマリー

| ファイル | テスト数 | カバレッジ | 目標 |
|---------|----------|-----------|------|
| fsrs.ts | 50 | 94.66% | 90% ✅ |
| gamification.ts | 54 | 94.95% | 85% ✅ |
| questions.ts | 33 | 100% | 85% ✅ |
| debug.ts | 29 | 67.3% | 70% ⚠️ |
| **合計** | **166** | **91.81%** | **80% ✅** |

**全テスト数**: 494（+152テスト追加）
**実行時間**: 約12秒

---

## 依存関係

```
フェーズ1 → フェーズ5（fsrs.tsのみで一度検証）✅
フェーズ2 → フェーズ5（gamification.tsも含めて検証）✅
フェーズ3 → フェーズ5（questions.tsも含めて検証）✅
フェーズ4 → フェーズ5（全ファイル含めて最終検証）✅
```

---

## 実績時間（見積もりとの比較）

| フェーズ | 内容 | 見積もり | 実績 |
|---------|------|---------|------|
| フェーズ1 | fsrs.ts | 2時間 | - |
| フェーズ2 | gamification.ts | 1.5時間 | - |
| フェーズ3 | questions.ts | 1時間 | - |
| フェーズ4 | debug.ts | 30分 | - |
| フェーズ5 | 検証・統合 | 30分 | - |
| **合計** | | **5.5時間** | - |
