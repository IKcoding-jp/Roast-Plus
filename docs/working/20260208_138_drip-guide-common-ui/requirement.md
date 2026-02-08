# 要件定義: ドリップガイドページの共通UI化とテーマシステム対応

## Issue
- **番号**: #138
- **タイトル**: refactor(drip-guide): ドリップガイドページの共通UI化とテーマシステム対応

## 概要
ドリップガイドページ（`app/drip-guide/`）の独自UI要素を共通UIコンポーネントに置換し、CSS変数ベースのテーマシステム対応を追加する。

## ユーザーストーリー
- ユーザーとして、クリスマスモードに切り替えた際にドリップガイドページも統一されたテーマで表示されること
- 開発者として、共通UIコンポーネントを使用して保守性を向上させること

## 現状分析

### 共通UIコンポーネント使用状況（30%）
| ファイル | 使用中 | 未使用 |
|---------|--------|--------|
| RecipeList.tsx | Card, Dialog | ボタン類（独自実装） |
| RecipeForm.tsx | Input, Textarea, Button | - |
| StepEditor.tsx | - | input, textarea（生HTML） |
| StartHintDialog.tsx | - | ダイアログ全体（独自） |
| Start46Dialog.tsx | - | ダイアログ全体（独自） |
| StartHoffmannDialog.tsx | - | ダイアログ全体（独自） |
| FooterControls.tsx | - | ボタン群（独自） |
| CompletionScreen.tsx | - | ボタン（独自） |
| runner/* | - | 各種（専用UI） |

### テーマ対応状況（0%）
- `isChristmasMode`: 未使用
- CSS変数: 未使用
- 背景色: `#F7F7F5`, `white`, `bg-gray-*` がハードコード

## 受け入れ基準
1. 独自`<button>` → `<Button>` / `<IconButton>` に置換
2. 独自カード要素 → `<Card>` に置換（該当箇所）
3. 生HTML `<input>` / `<textarea>` → `<Input>` / `<Textarea>` に置換
4. ページ背景 `#F7F7F5` → CSS変数 `bg-page` に変更
5. カード/セクション背景 `white` → `bg-surface` に変更
6. モーダル/ダイアログ背景 → `bg-overlay` に変更
7. テキスト色 → CSS変数（`text-ink`, `text-ink-sub`, `text-ink-muted`）に変更
8. ボーダー色 → CSS変数（`border-edge`）に変更
9. lint / build / test 通過
10. 通常モード・クリスマスモード両方で正常表示

## 対象外
- DripGuideRunner内のタイマー・ステップ表示等の専用UI（機能に密結合）
- ProgressBar（runner用の独自実装、共通UIのProgressBarとは用途が異なる）
- TimerDisplay（専用表示）
- StepMiniMap（専用表示）
