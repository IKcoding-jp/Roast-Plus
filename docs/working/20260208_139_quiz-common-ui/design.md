# 設計書: コーヒークイズページの共通UI化とテーマシステム対応

## 変更対象ファイル

### ページ層（6ファイル）
| ファイル | 変更内容 |
|---------|---------|
| `app/coffee-trivia/page.tsx` | 背景`bg-[#F7F7F5]`→`bg-page`、ヘッダー・テキスト色テーマ対応 |
| `app/coffee-trivia/quiz/page.tsx` | 背景`bg-gray-50`→`bg-page`、ボタン→Button、テーマ対応 |
| `app/coffee-trivia/review/page.tsx` | 背景`bg-gray-50`→`bg-page`、ボタン→Button、テーマ対応 |
| `app/coffee-trivia/stats/page.tsx` | 背景`bg-[#F7F7F5]`→`bg-page`、テーマ対応 |
| `app/coffee-trivia/badges/page.tsx` | 背景`bg-gray-50`→`bg-page`、テーマ対応 |
| `app/coffee-trivia/category/[category]/CategoryPageContent.tsx` | 背景`bg-gray-50`→`bg-page`、テーマ対応 |

### コンポーネント層（主要6ファイル）
| ファイル | 変更内容 |
|---------|---------|
| `components/coffee-quiz/QuizDashboard.tsx` | ボタン→Button、カード背景テーマ対応 |
| `components/coffee-quiz/QuizCard.tsx` | カード背景・テキスト色テーマ対応 |
| `components/coffee-quiz/QuizResult.tsx` | ボタン→Button、カード背景テーマ対応 |
| `components/coffee-quiz/QuizOption.tsx` | 選択肢ボタンのテーマ対応 |
| `components/coffee-quiz/CategoryQuestionList.tsx` | テーマ対応 |
| `components/coffee-quiz/CategorySelector.tsx` | テーマ対応 |

### その他コンポーネント層
| ファイル | 変更内容 |
|---------|---------|
| `components/coffee-quiz/LevelDisplay.tsx` | テーマ対応 |
| `components/coffee-quiz/StreakCounter.tsx` | テーマ対応 |
| `components/coffee-quiz/QuizProgress.tsx` | テーマ対応 |
| その他 coffee-quiz コンポーネント | ハードコード色→CSS変数 |

## 設計方針

### 1. CSS変数マッピング（#138準拠）
| 現状 | 変更後 | 用途 |
|------|--------|------|
| `bg-[#F7F7F5]`, `bg-gray-50` | `bg-page` | ページ背景 |
| `bg-white` | `bg-surface` | カード・セクション背景 |
| `bg-gray-50`（内部） | `bg-ground` | グラウンド背景 |
| `text-[#211714]` | `text-ink` | メインテキスト |
| `text-[#3A2F2B]` | `text-ink-sub` | サブテキスト |
| `text-[#3A2F2B]/60` | `text-ink-muted` | 薄いテキスト |
| `border-[#211714]/5` | `border-edge` | ボーダー |
| `border-[#211714]/10` | `border-edge-strong` | 濃いボーダー |
| `text-[#EF8A00]` | `text-spot` | アクセント色 |
| `bg-[#EF8A00]`, `hover:bg-[#D67A00]` | Button variant="primary" | プライマリーボタン |
| `bg-[#FDF8F0]` | `bg-spot-subtle` | アクセント背景 |
| `bg-[#211714]/5` | `bg-edge-subtle` | 薄い背景 |

### 2. ボタンの共通UI化方針
- プライマリーボタン（`bg-[#EF8A00]`）→ `<Button variant="primary">`
- セカンダリーボタン（`bg-[#211714]/5`）→ `<Button variant="secondary">`
- リンクボタン → `<Button>` + `onClick` で `router.push()` または `<Link>` のまま + CSS変数化
- アイコンのみボタン → `<IconButton>`

### 3. 意味色の扱い
- 難易度色（emerald/amber/rose）: そのまま維持（意味的な色分け）
- 成功/失敗色（green/red）: そのまま維持（意味的な色分け）
- ゴールド色（`#d4af37`）: パーフェクト表示、そのまま維持

### 4. グラデーションの扱い
- `from-[#EF8A00] to-[#D67A00]` → `from-spot to-spot-dark`（CSS変数が定義済みの場合）
- CSS変数でグラデーションが未対応の場合 → ハードコード維持（テーマシステム拡張時に対応）

## 禁止事項チェック
- [ ] 生のTailwindでボタンを作らない → Button使用
- [ ] `isChristmasMode` propは不要 → CSS変数で自動対応
- [ ] モーダル背景は `bg-overlay` → `bg-surface` は禁止
