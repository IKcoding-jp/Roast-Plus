# タスクリスト: コーヒークイズページの共通UI化とテーマシステム対応

**ステータス**: ✅ 完了

## Phase 1: ページ層のテーマ対応（6ファイル）
- [x] `app/coffee-trivia/page.tsx` - 背景→`bg-page`、ヘッダー→`bg-surface`、テキスト色テーマ対応
- [x] `app/coffee-trivia/quiz/page.tsx` - 背景→`bg-page`、ヘッダー→`bg-surface`、ボタンテーマ対応
- [x] `app/coffee-trivia/review/page.tsx` - 背景→`bg-page`、ヘッダー→`bg-surface`、テーマ対応
- [x] `app/coffee-trivia/stats/page.tsx` - 背景→`bg-page`、ヘッダー→`bg-surface`、テーマ対応
- [x] `app/coffee-trivia/badges/page.tsx` - 背景→`bg-page`、ヘッダー→`bg-surface`、テーマ対応
- [x] `app/coffee-trivia/category/[category]/CategoryPageContent.tsx` - 背景→`bg-page`、テーマ対応

## Phase 2: 主要コンポーネントの共通UI化（6ファイル）
- [x] `components/coffee-quiz/QuizDashboard.tsx` - カード背景→`bg-surface`、テーマ対応
- [x] `components/coffee-quiz/QuizCard.tsx` - カード背景→`bg-surface`、ヘッダー→CSS変数グラデーション
- [x] `components/coffee-quiz/QuizResult.tsx` - カード背景→`bg-surface`、ヘッダー→CSS変数グラデーション
- [x] `components/coffee-quiz/QuizOption.tsx` - 選択肢テーマ対応、フィードバック色CSS変数化
- [x] `components/coffee-quiz/CategoryQuestionList.tsx` - テーマ対応
- [x] `components/coffee-quiz/CategorySelector.tsx` - テーマ対応

## Phase 3: その他コンポーネントのテーマ対応
- [x] `components/coffee-quiz/LevelDisplay.tsx` - レベルバッジ→`bg-spot`、テーマ対応
- [x] `components/coffee-quiz/StreakCounter.tsx` - テーマ対応
- [x] `components/coffee-quiz/QuizProgress.tsx` - 確認済み（white/30は両モードで適切）
- [x] `components/coffee-quiz/HelpGuideModal.tsx` - テーマ対応
- [x] `components/coffee-quiz/LevelUpModal.tsx` - テーマ対応
- [x] `components/coffee-quiz/DailyGoalProgress.tsx` - emerald hex→Tailwind名前付きクラス
- [x] `components/coffee-quiz/DataManagement.tsx` - テーマ対応
- [x] `components/coffee-quiz/DataManagementSection.tsx` - テーマ対応
- [x] `components/coffee-quiz/StatsOverview.tsx` - テーマ対応
- [x] `components/coffee-quiz/QuizCompletionScreen.tsx` - テーマ対応
- [x] `components/coffee-quiz/ReviewEmptyState.tsx` - テーマ対応
- [x] `components/coffee-quiz/QuestionListItem.tsx` - 難易度色→半透明化
- [x] `components/coffee-quiz/XPGainAnimation.tsx` - テーマ対応
- [x] `components/coffee-quiz/QuizNavigationButtons.tsx` - テーマ対応
- [x] `components/coffee-quiz/CategoryStatsSection.tsx` - テーマ対応
- [x] `components/coffee-quiz/DifficultyStatsSection.tsx` - テーマ対応

## Phase 4: CSS変数追加
- [x] `--edge-subtle` 追加（通常: `#f3f4f6`、クリスマス: `rgba(255,255,255,0.12)`）
- [x] `--card-header-from/via/to` 追加（ヘッダーグラデーション/ソリッド色）
- [x] `--feedback-correct/incorrect` 追加（フィードバックテキスト色）
- [x] `spot-dark` → `spot-hover` 全置換（23ファイル）

## Phase 5: 検証
- [x] lint通過
- [x] build通過
- [x] test通過（750テスト全合格）
- [x] 通常モードで正常表示確認
- [x] クリスマスモードで正常表示確認（ユーザー承認済み）
