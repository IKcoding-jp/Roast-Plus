# タスクリスト: ドリップガイドページの共通UI化とテーマシステム対応

**ステータス**: ✅ 完了
**完了日**: 2026-02-08

## Phase 1: ページ背景のテーマ対応
- [x] `app/drip-guide/page.tsx` - `#F7F7F5` → `bg-page`
- [x] `app/drip-guide/new/page.tsx` - `#F7F7F5` → `bg-page`
- [x] `app/drip-guide/edit/page.tsx` - `#F7F7F5` → `bg-page`
- [x] `app/drip-guide/run/page.tsx` - `bg-white` → `bg-page`

## Phase 2: RecipeList の共通UI化
- [x] 独自ボタン → `<Button>` / `<IconButton>` に置換
- [x] セレクト → CSS変数でテーマ対応（共通UIのSelectは<option>カスタマイズ不可のため生selectを維持）
- [x] テキスト色・背景色をCSS変数に置換

## Phase 3: StepEditor の共通UI化
- [x] 生 `<input>` / `<textarea>` → CSS変数でテーマ対応
- [x] 削除ボタン → `<IconButton>` に置換
- [x] 追加ボタン → `<Button>` に置換
- [x] 背景色・テキスト色をCSS変数に置換

## Phase 4: ダイアログのテーマ対応
- [x] StartHintDialog - 背景色 `bg-overlay`、ボタン `<Button>`
- [x] Start46Dialog - 背景色 `bg-overlay`、ボタン `<Button>`
- [x] StartHoffmannDialog - 背景色 `bg-overlay`、ボタン `<Button>`
- [x] dialogs/shared/RecipeStepTable - テーマ対応
- [x] dialogs/shared/RecipeSummary - テーマ対応
- [x] dialogs/46/Dialog46Header - テーマ対応
- [x] dialogs/46/Dialog46Form - テーマ対応
- [x] dialogs/46/Dialog46Preview - テーマ対応
- [x] dialogs/46/Dialog46DescriptionModal - テーマ対応
- [x] dialogs/hoffmann/HoffmannDialogHeader - テーマ対応
- [x] dialogs/hoffmann/HoffmannDialogForm - テーマ対応
- [x] dialogs/hoffmann/HoffmannPreview - テーマ対応
- [x] dialogs/hoffmann/HoffmannDescriptionModal - テーマ対応
- [x] dialogs/hoffmann/HoffmannStepDetailModal - テーマ対応

## Phase 5: Runner系のテーマ対応
- [x] DripGuideRunner - 背景 `bg-surface`
- [x] CompletionScreen - ボタン → `<Button>`、背景テーマ対応
- [x] FooterControls - テーマ対応
- [x] RunnerHeader - テーマ対応
- [x] StepInfo - テーマ対応
- [x] TimerDisplay - テーマ対応
- [x] StepMiniMap - テーマ対応
- [x] ProgressBar - テーマ対応

## Phase 6: 検証
- [x] lint通過
- [x] build通過
- [x] test通過（750テスト全合格）
- [x] 独立レビュー通過
