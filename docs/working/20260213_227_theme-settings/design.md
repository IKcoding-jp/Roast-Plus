# 設計書

**Issue**: #227
**作成日**: 2026-02-13

## 実装方針

### アーキテクチャ概要

既存の `next-themes` + CSS変数ベースのテーマシステムを拡張する。新しいテーマは `globals.css` にCSS変数セットを追加するだけで実装可能。

```
ThemeProvider (next-themes)
    ↓ data-theme="dark-roast" 属性設定
globals.css [data-theme="dark-roast"] { CSS変数上書き }
    ↓ CSS変数自動適用
Tailwindクラス (bg-surface, text-ink等) → 全UI自動反映
```

### テーマシステム拡張

#### 1. ThemeProvider拡張

`components/ThemeProvider.tsx` のテーマリストを拡張:

```typescript
const THEME_LIST = ['default', 'dark-roast', 'light-roast', 'matcha', 'caramel', 'christmas'];
```

#### 2. テーマ定数定義

`lib/theme.ts` を新規作成。テーマメタデータを集約:

```typescript
export interface ThemePreset {
  id: string;
  name: string;          // 表示名
  description: string;   // 説明
  type: 'light' | 'dark';
  previewColors: {       // プレビュー用カラー
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [...];
```

#### 3. 汎用テーマhook

`hooks/useAppTheme.ts` を新規作成:

```typescript
export function useAppTheme() {
  const { resolvedTheme, setTheme, themes } = useTheme();

  return {
    currentTheme: resolvedTheme,  // 'default' | 'dark-roast' | ...
    setTheme,                     // テーマ切替
    themes,                       // テーマID一覧
    isDarkTheme: isDark(resolvedTheme),  // ダーク系かどうか
    isChristmasTheme: resolvedTheme === 'christmas',
  };
}
```

#### 4. useChristmasMode 後方互換性

既存の `useChristmasMode` hookは**維持**する。内部実装を `useAppTheme` に委譲:

```typescript
// hooks/useChristmasMode.ts（変更不要）
// 既に useTheme() を使用しているため、ThemeProviderのテーマ追加だけで動作する
```

→ 既存の呼び出し箇所は一切変更不要。

### 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `app/globals.css` | 4テーマのCSS変数セット追加 |
| `components/ThemeProvider.tsx` | テーマリスト拡張 |
| `lib/theme.ts` | **新規** テーマ定数・型定義 |
| `hooks/useAppTheme.ts` | **新規** 汎用テーマhook |
| `app/settings/page.tsx` | テーマ設定UIセクション追加、クリスマスモードSwitch削除 |

### 新規作成ファイル

| ファイル | 役割 |
|---------|------|
| `lib/theme.ts` | テーマプリセット定数、ThemePreset型 |
| `hooks/useAppTheme.ts` | 汎用テーマhook |
| `components/settings/ThemeSelector.tsx` | テーマ選択カードグリッドコンポーネント |

### 設定画面UIデザイン

```
設定画面 "その他"
├── テーマ設定 セクション（NEW）
│   ├── タイトル: "テーマ設定"
│   ├── 説明: "アプリの配色テーマを選択できます"
│   └── カードグリッド (2列)
│       ├── [デフォルト] ✓選択中
│       ├── [ダークロースト]
│       ├── [ライトロースト]
│       ├── [抹茶ラテ]
│       ├── [キャラメルマキアート]
│       └── [クリスマス]
│
├── 開発者モード セクション（既存）
├── ...（以下既存セクション）
```

#### テーマプレビューカード構成

```
┌─────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← プレビューエリア（テーマカラー3色表現）
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
├─────────────────────┤
│ テーマ名        ✓   │  ← 選択中はチェックマーク
│ 簡潔な説明文        │
└─────────────────────┘
```

## CSS変数設計（各テーマ）

### ダークロースト (dark-roast)

コンセプト: 深煎りエスプレッソの高級感。漆黒+琥珀&ゴールド。

| 変数カテゴリ | 設計方針 |
|------------|---------|
| 背景系 | 漆黒〜ダークブラウン（#0d0b09, #1a1614） |
| テキスト | アイボリー〜ゴールド（#f5f0e8, #c4b69c） |
| アクセント | 琥珀ゴールド（#c8a050, #dab86c） |
| ボーダー | ダークブラウン（#2a231d, #3d3329） |
| シャドウ | ゴールドグロー効果 |

### ライトロースト (light-roast)

コンセプト: 浅煎りの朝。アイボリー+ハニーイエロー。

| 変数カテゴリ | 設計方針 |
|------------|---------|
| 背景系 | 温かいアイボリー〜クリーム（#faf6ef, #fff9f0） |
| テキスト | ウォームグレー〜ブラウン（#3d3229, #6b5d4f） |
| アクセント | ハニーイエロー（#d4a535, #c69320） |
| ボーダー | 薄いベージュ（#ede5d8, #ddd3c3） |
| シャドウ | ソフトウォームシャドウ |

### 抹茶ラテ (matcha)

コンセプト: 和カフェの落ち着き。深い抹茶グリーン+クリーム。

| 変数カテゴリ | 設計方針 |
|------------|---------|
| 背景系 | 深い抹茶グリーン（#0f1f15, #1a3025） |
| テキスト | クリームホワイト〜薄緑（#f0ebe0, #b8c5a8） |
| アクセント | 明るい抹茶（#7db358, #95c774） |
| ボーダー | 深緑（#253d2e, #345a40） |
| シャドウ | グリーングロー効果 |

### キャラメルマキアート (caramel)

コンセプト: 秋の収穫祭。チョコレートブラウン+キャラメルゴールド。

| 変数カテゴリ | 設計方針 |
|------------|---------|
| 背景系 | チョコレートブラウン（#1a120d, #2a1f17） |
| テキスト | クリーム〜ベージュ（#f5ebe0, #c9b9a5） |
| アクセント | キャラメルゴールド（#d4923a, #e5a54d） |
| ボーダー | ダークブラウン（#3a2d22, #4d3d30） |
| シャドウ | ウォームオレンジグロー |

## 影響範囲

### 影響を受けるコンポーネント

- 全共通UIコンポーネント（CSS変数経由で自動対応 → **変更不要**）
- `app/settings/page.tsx` - テーマ設定UI追加、クリスマスSwitch削除
- `components/ThemeProvider.tsx` - テーマリスト拡張

### 影響を受けないもの

- `useChristmasMode` hook呼び出し箇所（後方互換維持）
- 各機能ページのコンポーネント（CSS変数で自動適用）
- Firestore関連ロジック

## 禁止事項チェック

- ❌ 独自CSSでボタン/カード/入力を作成しない → 共通コンポーネント使用
- ❌ コンポーネント内でテーマ判定の条件分岐を追加しない → CSS変数で自動対応
- ❌ 既存の `useChristmasMode` hookを削除しない → 後方互換性維持
- ❌ ハードコードされたカラー値を新たに追加しない → CSS変数を使用
- ❌ `bg-surface` をモーダル背景に使用しない → `bg-overlay` を使用
