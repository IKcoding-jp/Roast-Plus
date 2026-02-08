# 要件定義: コーヒークイズページの共通UI化とテーマシステム対応

## Issue
- **番号**: #139
- **タイトル**: refactor(quiz): コーヒークイズページの共通UI化とテーマシステム対応

## 概要
コーヒークイズページ（`app/coffee-trivia/`）の独自UI要素を共通UIコンポーネントに置換し、CSS変数ベースのテーマシステム対応を追加する。

## ユーザーストーリー
- ユーザーとして、クリスマスモードに切り替えた際にコーヒークイズページも統一されたテーマで表示されること
- 開発者として、共通UIコンポーネントを使用して保守性を向上させること

## 現状分析

### 共通UIコンポーネント使用状況（5%）
| ファイル | 使用中 | 未使用 |
|---------|--------|--------|
| app/coffee-trivia/page.tsx | - | 全ボタン独自実装 |
| app/coffee-trivia/quiz/page.tsx | - | 全ボタン・カード独自実装 |
| app/coffee-trivia/review/page.tsx | - | 全ボタン・カード独自実装 |
| app/coffee-trivia/stats/page.tsx | Dialog | ボタン類・カード独自実装 |
| app/coffee-trivia/badges/page.tsx | - | 全ボタン・カード独自実装 |
| CategoryPageContent.tsx | - | 全ボタン・カード独自実装 |
| QuizCard.tsx | - | カード・解説表示独自実装 |
| QuizResult.tsx | - | 全ボタン・カード独自実装 |
| QuizDashboard.tsx | - | 全ボタン・カード独自実装 |

### テーマ対応状況（0%）
- `useChristmasMode`: 未使用
- CSS変数: 未使用
- 背景色: `bg-gray-50`, `bg-[#F7F7F5]`, `bg-white` がハードコード
- テキスト色: `text-[#211714]`, `text-[#3A2F2B]`, `text-[#EF8A00]` がハードコード

## 受け入れ基準
1. 独自`<button>` / `<a>` → `<Button>` / `<IconButton>` に置換
2. 独自カード要素 → テーマ対応CSS変数に変更
3. ページ背景 `bg-gray-50` / `#F7F7F5` → CSS変数 `bg-page` に変更
4. カード/セクション背景 `bg-white` → `bg-surface` に変更
5. テキスト色 → CSS変数（`text-ink`, `text-ink-sub`, `text-ink-muted`）に変更
6. ボーダー色 → CSS変数（`border-edge`）に変更
7. アクセント色 `#EF8A00` → `text-spot` / `bg-spot-subtle` に変更
8. lint / build / test 通過
9. 通常モード・クリスマスモード両方で正常表示

## 対象外
- page-new.tsx ファイル（quiz/page-new.tsx, review/page-new.tsx, stats/page-new.tsx）は未使用のため対象外
- インラインSVGアイコン定義は維持（共通化は別Issue）
- 難易度別の色分け（emerald/amber/rose）は意味色のため維持
- 成功/失敗の状態色（green/red系）は意味色のため維持
