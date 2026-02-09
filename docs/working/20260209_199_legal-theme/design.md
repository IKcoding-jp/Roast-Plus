# 設計書

## 実装方針

### 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `app/terms/page.tsx` | ハードコード色 → CSS変数、Card/Button置換検討 |
| `app/privacy-policy/page.tsx` | ハードコード色 → CSS変数、Card/Button置換検討 |
| `app/contact/page.tsx` | ハードコード色 → CSS変数、Button置換検討 |
| `app/consent/page.tsx` | ハードコード色 → CSS変数、チェックボックス・ボタンのテーマ対応 |
| `components/contact/ContactFormFields.tsx` | フォームフィールドのハードコード色 → CSS変数 |
| `components/contact/ContactSuccessScreen.tsx` | 完了画面のハードコード色 → CSS変数 |

### 新規作成ファイル

なし

## 色の対応表

| Before | After | 用途 |
|--------|-------|------|
| `style={{ backgroundColor: '#F7F7F5' }}` | `className="bg-page"` | ページ背景 |
| `bg-white` | `bg-surface` | カード背景 |
| `text-gray-800` | `text-ink` | メインテキスト |
| `text-gray-600`, `text-gray-700` | `text-ink-sub` | サブテキスト |
| `text-gray-500`, `text-gray-400` | `text-ink-muted` | 控えめテキスト |
| `text-gray-900` | `text-ink` | 入力テキスト |
| `border-gray-200`, `border-gray-300` | `border-edge` | ボーダー |
| `hover:bg-gray-100` | `hover:bg-ground` | ホバー背景 |
| `bg-orange-500` | `bg-spot` | アクセントボタン背景 |
| `hover:bg-orange-600` | `hover:bg-spot-hover` | ホバー時ボタン |
| `text-orange-500`, `text-orange-600` | `text-spot` | アクセントテキスト |
| `focus:ring-orange-500` | `focus:ring-spot` | フォーカスリング |
| `text-red-500`, `text-red-600`, `text-red-800` | `text-danger` | エラーテキスト |
| `bg-red-50` | `bg-danger-subtle` | エラー背景 |
| `border-red-200`, `border-red-500` | `border-danger` | エラーボーダー |

## 影響範囲

- 法的情報4ページの見た目が変わる（クリスマスモード対応追加）
- 通常モードでは見た目の変化は最小限（CSS変数のデフォルト値が同じ色のため）

## 禁止事項チェック

- ❌ 独自CSS生成しない → CSS変数を使用
- ❌ 設計方針を変更しない → テーマ対応の追加のみ
- ❌ ページ構造の変更不要 → スタイルの置換のみ
