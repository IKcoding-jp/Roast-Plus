# 要件定義

**Issue**: #155
**作成日**: 2026-02-06
**ラベル**: test

## ユーザーストーリー

開発者「lib/coffee-quiz/のテストカバレッジが24.44%と低い。コアロジック（FSRS、ゲーミフィケーション）の信頼性を確保したい」
アプリ「詳細なユニットテストを実装し、カバレッジを80%以上に向上させる」

## 要件一覧

### 必須要件

#### 1. fsrs.ts のテスト実装（優先度: 最高）
- [ ] `createQuizCard` - 新規カード作成のテスト
- [ ] `reviewCard` - カード復習ロジックのテスト（4評価パターン）
- [ ] `determineRating` - 正解率から評価を決定するロジック
- [ ] `getDueCards` - 期限切れカード取得（日付計算）
- [ ] `sortCardsByPriority` - 優先度ソート（due date順）
- [ ] `getCardMastery` - 定着度計算（retrievability基準）
- [ ] `isCardMastered` - 定着判定（閾値0.9）

#### 2. gamification.ts の詳細テスト実装（優先度: 高）
- [ ] `calculateXP` - XP計算（難易度別、ボーナス考慮）
- [ ] `addXP` - レベルアップロジック（XP加算→レベル計算）
- [ ] `updateStreak` - ストリーク更新（連続日数、リスク判定）
- [ ] `updateStats` - 統計更新（正解率、カテゴリ別統計）
- [ ] `updateDailyGoal` - デイリーゴール進捗
- [ ] `checkNewBadges` - バッジ判定（全パターン網羅）
- [ ] `earnBadges` - バッジ獲得処理
- [ ] エッジケース（最大レベル、連続ストリーク上限等）

#### 3. questions.ts のテスト実装（優先度: 高）
- [ ] `loadAllQuestions` - 非同期問題ロード（JSONファイル読み込み）
- [ ] `getQuestionById` - ID検索
- [ ] `getQuestionsByCategory` - カテゴリ別取得
- [ ] `getQuestionsByDifficulty` - 難易度別取得
- [ ] `getDailyQuestions` - 日次問題取得（デバッグモード考慮）
- [ ] `getQuestionsStats` - 統計計算（総数、カテゴリ別、難易度別）
- [ ] `shuffleArray` - シャッフルロジック
- [ ] `shuffleOptions` - 選択肢シャッフル
- [ ] エラーハンドリング（ファイル読み込み失敗、キャッシュクリア）

#### 4. debug.ts のテスト実装（優先度: 低）
- [ ] `setDebugMode` / `isDebugMode` - デバッグモード切り替え
- [ ] `setDebugDateOffset` / `getDebugDateOffset` - 日付オフセット設定
- [ ] `getCurrentDate` - デバッグモード時の日付取得
- [ ] `getDebugTodayDateString` - 日付文字列取得
- [ ] `resetDebugState` - デバッグ状態リセット

### オプション要件
- [ ] 統合テスト: fsrs.ts + gamification.ts の連携（カード復習→XP獲得→レベルアップ）
- [ ] パフォーマンステスト: 大量問題データ（1000件）でのloadAllQuestions

## 非機能要件

### パフォーマンス
- テスト実行時間: 全テスト5秒以内
- questions.tsのloadAllQuestions: 500ms以内

### カバレッジ目標
- **lib/coffee-quiz/全体**: 24.44% → **80%以上**（+55.56%）
- **fsrs.ts**: 0% → 90%以上
- **gamification.ts**: 27.73% → 85%以上
- **questions.ts**: 0% → 85%以上
- **debug.ts**: 3.84% → 70%以上

### テストの信頼性
- モックの最小化（実際のFSRSアルゴリズムを使用）
- 境界値テスト（0, 負数, 最大値）
- 異常系テスト（null, undefined, 不正な入力）

## 受け入れ基準

- [ ] 全テストが合格（npm run test）
- [ ] カバレッジが80%以上（npm run test -- --coverage）
- [ ] Lintエラーなし（npm run lint）
- [ ] 既存テストが壊れていない（回帰テスト）
- [ ] テストコードがGUIDELINES.mdのテスト戦略に準拠

## 参照

- **関連Issue**: なし（カバレッジ向上の継続タスク）
- **Steering Documents**:
  - FEATURES.md「コーヒークイズ（Coffee Quiz）」
  - GUIDELINES.md「テスト戦略」
  - UBIQUITOUS_LANGUAGE.md「FSRS」「ゲーミフィケーション」
- **既存テスト**:
  - `lib/coffee-quiz/gamification.test.ts`（基礎テストのみ）
  - `lib/coffee-quiz/types.test.ts`（型定義テスト）

## 期待効果

- **全体カバレッジ向上**: 76.19% → 約80-82%
- **コアロジックの信頼性確保**: FSRS、ゲーミフィケーションの回帰防止
- **リファクタリングの安全性**: 将来のリファクタリング時のセーフティネット
