# 設計書: ドリップガイドページの共通UI化とテーマシステム対応

## 変更対象ファイル

### ページ層（背景色のテーマ対応）
| ファイル | 変更内容 |
|---------|---------|
| `app/drip-guide/page.tsx` | `backgroundColor: '#F7F7F5'` → `bg-page` |
| `app/drip-guide/new/page.tsx` | `backgroundColor: '#F7F7F5'` → `bg-page` |
| `app/drip-guide/edit/page.tsx` | `backgroundColor: '#F7F7F5'` → `bg-page` |
| `app/drip-guide/run/page.tsx` | `bg-white` → `bg-page` / テーマ対応 |

### コンポーネント層（共通UI化 + テーマ対応）
| ファイル | 変更内容 |
|---------|---------|
| `components/drip-guide/RecipeList.tsx` | 独自ボタン → Button、テキスト色テーマ対応 |
| `components/drip-guide/StepEditor.tsx` | 生HTML input/textarea → Input/Textarea |
| `components/drip-guide/StartHintDialog.tsx` | 独自ダイアログ → Modal使用、テーマ対応 |
| `components/drip-guide/Start46Dialog.tsx` | テーマ対応（bg-white → bg-overlay） |
| `components/drip-guide/StartHoffmannDialog.tsx` | テーマ対応（bg-white → bg-overlay） |
| `components/drip-guide/DripGuideRunner.tsx` | テーマ対応（背景色） |
| `components/drip-guide/runner/CompletionScreen.tsx` | 独自ボタン → Button |
| `components/drip-guide/runner/FooterControls.tsx` | テーマ対応 |
| `components/drip-guide/runner/RunnerHeader.tsx` | テーマ対応（テキスト色） |
| `components/drip-guide/runner/StepInfo.tsx` | テーマ対応（テキスト色） |

### ダイアログサブコンポーネント
| ファイル | 変更内容 |
|---------|---------|
| `components/drip-guide/dialogs/shared/DialogOverlay.tsx` | テーマ対応 |
| `components/drip-guide/dialogs/shared/RecipeStepTable.tsx` | テーマ対応 |
| `components/drip-guide/dialogs/shared/RecipeSummary.tsx` | テーマ対応 |
| `components/drip-guide/dialogs/46/*.tsx` | テーマ対応 |
| `components/drip-guide/dialogs/hoffmann/*.tsx` | テーマ対応 |

## 設計方針

### 1. CSS変数マッピング（#136準拠）
| 現状 | 変更後 | 用途 |
|------|--------|------|
| `backgroundColor: '#F7F7F5'` | `bg-page` | ページ背景 |
| `bg-white` | `bg-surface` | カード・セクション背景 |
| `bg-white`（モーダル） | `bg-overlay` | モーダル背景（不透明） |
| `bg-gray-50`, `bg-gray-100` | `bg-ground` | グラウンド背景 |
| `text-gray-900` | `text-ink` | メインテキスト |
| `text-gray-600`, `text-gray-500` | `text-ink-sub` | サブテキスト |
| `text-gray-400` | `text-ink-muted` | 薄いテキスト |
| `border-gray-200`, `border-gray-300` | `border-edge` | ボーダー |
| `border-gray-400` | `border-edge-strong` | 濃いボーダー |
| `bg-amber-*` | `bg-spot` / `bg-spot-subtle` | アクセント色 |

### 2. ダイアログの共通UI化方針
- **StartHintDialog**: 独自div → `<Modal>` コンポーネント使用
- **Start46Dialog / StartHoffmannDialog**: 独自のフレーム構造を持つため、`<Modal>` は使用せず背景色のみテーマ対応
- **DialogOverlay**: 共通オーバーレイ → テーマ対応

### 3. Runner系コンポーネントの方針
- タイマー・ステップ表示等の専用UIは共通コンポーネント化しない
- 背景色・テキスト色のみCSS変数に置換

## 禁止事項チェック
- [ ] 生のTailwindでボタンを作らない → Button使用
- [ ] `isChristmasMode` propは不要 → CSS変数で自動対応
- [ ] モーダル背景は `bg-overlay` → `bg-surface` は禁止
