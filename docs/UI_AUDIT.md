# RoastPlus UI一貫性監査レポート

> 作成日: 2026-01-26
> 分析対象: 34ページ、約75コンポーネント
> UI統一度: 65%（中程度の不統一）

---

## 目次

1. [エグゼクティブサマリー](#1-エグゼクティブサマリー)
2. [発見した不統一箇所](#2-発見した不統一箇所)
3. [各ページで使われているパターン一覧](#3-各ページで使われているパターン一覧)
4. [最も多く使われているパターン（統一ベース候補）](#4-最も多く使われているパターン統一ベース候補)
5. [修正優先度ランキング](#5-修正優先度ランキング)
6. [推奨アクション](#6-推奨アクション)

---

## 1. エグゼクティブサマリー

### 重要な発見

**既存のデザインシステムが存在するが、実装に反映されていない**

| リソース | 状態 | 使用率 |
|----------|------|--------|
| `.claude/skills/roastplus-ui/components.md` | 包括的なUIパターン定義済み | 部分的 |
| `styles/tokens.ts` | デザイントークン定義済み | 0% |
| `app/globals.css` CSS変数 | 色・テーマ定義済み | 1%未満 |

### 主要な問題点

1. **入力フィールド**: 3〜4パターンが混在（最大の問題）
2. **ボタン**: 角丸・パディングが統一されていない
3. **カード**: シャドウ・ボーダーが不統一
4. **カラー指定**: CSS変数定義済みだが直接16進数指定が大多数

---

## 2. 発見した不統一箇所

### 2.1 入力フィールド

**現状（3パターン混在）:**

| パターン | 使用箇所 | スタイル |
|---------|---------|---------|
| A（シンプル） | RoastRecordForm | `rounded-md border border-gray-300 px-3 py-2` |
| B（高級感） | TastingRecordForm | `rounded-2xl border-2 border-transparent bg-gray-50 px-4 py-3.5` |
| C（中間） | RecipeForm | `rounded-lg border p-3` |

**問題の影響:**
- ユーザーがページを移動するたびに異なるUI体験
- 開発者が新しいフォームを作る際に参照するパターンが不明確

### 2.2 ボタン

**現状の混在:**

| 項目 | 使用されているバリエーション |
|------|---------------------------|
| 角丸 | `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full` |
| パディング | `px-3 py-2`, `px-4 py-2`, `px-6 py-3`, `px-8 py-3`, `px-8 py-5` |
| 最小高さ | `min-h-[44px]`（一部）, 未設定（多数） |
| ホバー効果 | `hover:bg-*`, `hover:shadow-*`, `hover:scale-*` 混在 |

**ボタンバリエーション検出:**

```
Primary系:
- bg-amber-600 text-white hover:bg-amber-700
- bg-primary text-white hover:bg-primary-dark
- bg-gradient-to-r from-amber-600 to-amber-500

Secondary系:
- bg-gray-300 text-gray-800 hover:bg-gray-400
- bg-gray-600 text-white hover:bg-gray-700
- bg-white border border-gray-300

Danger系:
- bg-red-600 text-white hover:bg-red-700
- bg-red-50 text-red-600 border border-red-200
```

### 2.3 カード

**現状の混在:**

| 項目 | バリエーション |
|------|---------------|
| 角丸 | `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl` |
| シャドウ | `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-2xl`, カスタム |
| ボーダー | なし, `border-gray-100`, `border-gray-200` |
| パディング | `p-3`, `p-4`, `p-5`, `p-6` |

### 2.4 背景色

| ページ | 使用色 | 備考 |
|--------|--------|------|
| 多数のページ | `#F7F7F5` | 最頻出 |
| ログインページ | `#F5F1EB` | 微妙に異なる |
| coffee-trivia | `#FDF8F0` | 暖色寄り |
| ホーム（クリスマス） | `#051a0e` | 特殊モード |

### 2.5 アイコンサイズ

| 使用されているサイズ | 用途 |
|---------------------|------|
| `h-5 w-5` | 小アイコン |
| `h-6 w-6` | 標準アイコン |
| `h-8 w-8` | 中アイコン |
| `h-6 w-6 sm:h-8 sm:w-8` | レスポンシブ |
| `h-8 w-8 sm:h-10 sm:w-10` | 大アイコン |

### 2.6 テキストサイズ

| 用途 | 使用されているサイズ |
|------|---------------------|
| ページタイトル | `text-xl`, `text-2xl`, `text-2xl sm:text-3xl` |
| セクション見出し | `text-lg`, `text-xl` |
| 本文 | `text-sm`, `text-base` |
| キャプション | `text-xs`, `text-sm` |

### 2.7 フォーカスリング

| パターン | 使用箇所 |
|---------|---------|
| `focus:ring-2 focus:ring-orange-500` | ログイン、設定 |
| `focus-visible:ring-2 focus-visible:ring-primary` | ホーム |
| `focus:outline-none focus:ring-2 focus:ring-amber-500` | 進捗 |
| `focus:border-amber-500 focus:ring-amber-100` | フォーム |

### 2.8 モーダル背景

| パターン | 使用箇所 |
|---------|---------|
| `bg-black/50` | 多数 |
| `bg-black bg-opacity-50` | 通知 |
| `bg-black/20` | 一部 |

---

## 3. 各ページで使われているパターン一覧

### 3.1 ホームページ (`app/page.tsx`)

| 要素 | スタイル |
|------|---------|
| 背景 | `bg-gradient-to-b from-[#F7F2EB] to-[#F3F0EA]` |
| カード | `bg-white/95 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)]` |
| ホバー | `hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]` |
| アイコン | `h-8 w-8` in `h-14 w-14 rounded-full bg-primary/10` |

### 3.2 焙煎記録 (`app/roast-record/`)

| 要素 | スタイル |
|------|---------|
| 背景 | `#F7F7F5` |
| カード | `bg-white rounded-lg shadow-md p-3 md:p-4 border border-gray-100` |
| 入力 | `rounded-md border border-gray-300 px-3 py-2` |
| ボタン（Primary） | `bg-amber-600 text-white rounded-lg hover:bg-amber-700` |
| ボタン（Secondary） | `bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400` |

### 3.3 試飲記録 (`app/tasting/`)

| 要素 | スタイル |
|------|---------|
| 背景 | `#F7F7F5` |
| カード | `bg-white rounded-3xl p-6 border border-gray-100 shadow-sm` |
| 入力 | `rounded-2xl border-2 border-transparent bg-gray-50 px-4 py-3.5` |
| ボタン（Primary） | `bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl` |
| スライダー | カスタムスタイリング（各評価項目で色分け） |

### 3.4 ドリップガイド (`app/drip-guide/`)

| 要素 | スタイル |
|------|---------|
| 背景 | `#F7F7F5` |
| カード | `bg-white rounded-lg shadow-md` |
| 入力 | `rounded-lg border p-3` |
| ボタン（Primary） | `bg-amber-600 text-white rounded-full px-8 py-3` |

### 3.5 作業進捗 (`app/progress/`)

| 要素 | スタイル |
|------|---------|
| 背景 | `#F7F7F5` |
| グループカード | `bg-white rounded-xl shadow-sm border border-gray-200` |
| アイテムカード | `bg-gray-50 rounded-lg p-3` |
| ステータスバッジ | 色分け（amber/green/gray） |

### 3.6 設定 (`app/settings/`)

| 要素 | スタイル |
|------|---------|
| 背景 | `#F7F7F5` |
| セクションカード | `bg-white rounded-lg p-4 shadow-sm` |
| トグル/チェックボックス | `w-5 h-5 text-orange-500 rounded` |
| リンクボタン | `text-gray-600 hover:text-gray-800 hover:bg-gray-50` |

### 3.7 コーヒークイズ (`app/coffee-trivia/`)

| 要素 | スタイル |
|------|---------|
| 背景 | `#FDF8F0`（他と異なる） |
| カード | `bg-white rounded-xl shadow-sm` |
| 選択肢ボタン | カスタム（正誤アニメーション付き） |
| 進捗バー | グラデーション |

---

## 4. 最も多く使われているパターン（統一ベース候補）

### 4.1 ボタン

**Primary（推奨ベース）:**
```css
px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold
hover:bg-amber-700 transition-colors min-h-[44px]
```
使用頻度: 高（RoastRecordForm, TastingRecordForm等）

**Secondary（推奨ベース）:**
```css
px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold
hover:bg-gray-700 transition-colors min-h-[44px]
```

### 4.2 入力フィールド

**推奨ベース（roastplus-uiスキル準拠）:**
```css
w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 text-lg
text-gray-900 bg-white focus:border-amber-500 focus:outline-none
focus:ring-2 focus:ring-amber-100 transition-all min-h-[44px]
```

### 4.3 カード

**リスト表示用（推奨ベース）:**
```css
bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-5
hover:shadow-md hover:border-gray-300 transition-all
```

**ホームページ用:**
```css
bg-white/95 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-5
hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all
```

### 4.4 背景色

**推奨:** `#F7F7F5`（最頻出、他のページも統一推奨）

### 4.5 カラーパレット

| 用途 | 推奨値 | Tailwind相当 |
|------|--------|-------------|
| Primary | `#EF8A00` / `amber-600` | `bg-amber-600` |
| Primary Hover | `#D67A00` / `amber-700` | `hover:bg-amber-700` |
| Text Primary | `#211714` | `text-[#211714]` |
| Text Secondary | `#3A2F2B` | `text-[#3A2F2B]` |
| Background | `#F7F7F5` | `bg-[#F7F7F5]` |

---

## 5. 修正優先度ランキング

### P0（最優先）- 入力フィールド統一

**影響範囲:** 全フォーム（~10ファイル）
**理由:** 最も目立つ不統一、ユーザー体験に直接影響

**対象ファイル:**
- `components/RoastRecordForm.tsx`
- `components/TastingRecordForm.tsx`
- `components/TastingSessionForm.tsx`
- `components/drip-guide/RecipeForm.tsx`
- `components/defect-beans/DefectBeanForm.tsx`

### P1（高優先度）- ボタン統一

**影響範囲:** 全ページ（~34ページ）
**理由:** 全体的な印象に影響、アクセシビリティ（タッチサイズ）

**対象:**
- 上記フォーム内のボタン
- `components/RoastTimerControls.tsx`
- `components/RoastTimerDialogs.tsx`
- 各ページのアクションボタン

### P2（中優先度）- カード統一

**影響範囲:** リスト表示（~15ファイル）
**理由:** 一覧画面の視覚的一貫性

**対象ファイル:**
- `components/RoastRecordList.tsx`
- `components/TastingRecordList.tsx`
- `components/TastingSessionList.tsx`
- `components/drip-guide/RecipeList.tsx`

### P3（中優先度）- ダイアログ統合

**影響範囲:** 確認ダイアログ（~8ファイル）
**理由:** 重複コードの削減、保守性向上

**対象ファイル:**
- `components/drip-guide/ConfirmDialog.tsx`
- `components/coffee-quiz/ResetConfirmDialog.tsx`
- その他確認ダイアログ

### P4（低優先度）- 背景色統一

**影響範囲:** 3ページ
**理由:** 微妙な違いで目立ちにくいが、統一すべき

**対象ファイル:**
- `app/login/page.tsx`（`#F5F1EB` → `#F7F7F5`）
- `app/coffee-trivia/page.tsx`（`#FDF8F0` → `#F7F7F5`）

### P5（低優先度）- カラーシステム整理

**影響範囲:** 全体（段階移行）
**理由:** 長期的な保守性向上、即時のUX改善は少ない

**対象:**
- `app/globals.css` のCSS変数活用
- 直接16進数指定の置換
- `styles/tokens.ts` の廃止検討

---

## 6. 推奨アクション

### 短期（1-2週間）

1. **UIコンポーネントライブラリ作成**
   ```
   components/ui/
   ├── Button.tsx
   ├── Input.tsx
   ├── Select.tsx
   ├── Textarea.tsx
   ├── Card.tsx
   ├── Dialog.tsx
   └── index.ts
   ```

2. **P0: 入力フィールド統一**
   - roastplus-uiスキルの統一パターンを適用
   - 各フォームで新Inputコンポーネントを使用

### 中期（2-4週間）

3. **P1-P2: ボタン・カード統一**
   - Button/Cardコンポーネントを各ページに適用
   - 既存インラインスタイルを置換

4. **P3: ダイアログ統合**
   - 汎用Dialogコンポーネントに統合
   - 重複ファイル削除

### 長期（1-2ヶ月）

5. **P4-P5: 背景色・カラーシステム**
   - 段階的にCSS変数/Tailwindカスタム色に移行
   - `styles/tokens.ts` 廃止または活用方法決定

---

## 付録: 既存デザインシステムリソース

| リソース | パス | 内容 |
|----------|------|------|
| UIパターン定義 | `.claude/skills/roastplus-ui/components.md` | ボタン、入力、カード、モーダル等の完全な定義 |
| カラー定義 | `.claude/skills/roastplus-ui/colors.md` | カラーパレット、クリスマスモード対応 |
| レイアウト定義 | `.claude/skills/roastplus-ui/layout.md` | グリッド、余白、レスポンシブ対応 |
| デザイントークン | `styles/tokens.ts` | TypeScript形式の色・余白定義 |
| CSS変数 | `app/globals.css` | Tailwind v4テーマ設定 |

**注意:** これらのリソースは定義済みだが、実装での使用率が低い。統一作業ではこれらを参照基準とすること。
