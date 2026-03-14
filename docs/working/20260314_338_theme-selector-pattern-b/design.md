# 設計書: テーマ設定画面パターンBデザイン刷新

## Issue #338

---

## 変更対象ファイル

| ファイル | 変更種別 | 概要 |
|---------|---------|------|
| `lib/theme.ts` | 修正 | 型定義・プリセットデータ更新 |
| `components/settings/ThemeSelector.tsx` | 大幅書き換え | アニメーション削除、カードをパターンBに |
| `app/settings/theme/page.tsx` | 軽微修正 | max-width変更 |
| `components/settings/ThemeSelector.test.tsx` | 修正 | テスト更新 |

## 型定義の変更

### 削除
```typescript
// 削除
export type ThemeAnimationType = 'steam' | 'flame' | 'particles' | 'leaf' | 'glow' | 'snow' | 'stars';
```

### ThemePreset 変更後
```typescript
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  type: 'light' | 'dark';
  themeColor: string;
  previewColors: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
  /** カラードット用グラデーション (CSS background プロパティ値) */
  previewGradient: string;
}
```

削除フィールド: `fontStyle`, `animationType`, `bgGradient`
追加フィールド: `previewGradient`

## コンポーネント設計

### ThemePreviewCard（新）
```
┌──────────────────────┐
│                   ✓  │  ← 選択時のみ（absolute top-right）
│                      │
│      ( ● )           │  ← 48px カラードット
│                      │
│    テーマ名           │  ← 15px bold center
│    説明テキスト        │  ← 12.5px gray center
│                      │
└──────────────────────┘
```

### ThemeSelector（新グリッド）
```
Desktop (sm+):  [card] [card] [card] [card]
                [card] [card] [card]

Mobile:         [card] [card]
                [card] [card]
                [card] [card]
                [card]
```

## CSS実装方針

プロジェクトの共通UIコンポーネント（`Button`）は引き続き使用するが、`!p-0 !min-h-0`等のオーバーライドは不要になる。カードはシンプルなbuttonベースで実装。

Tailwind CSS変数を使用:
- `bg-surface` → カード背景
- `border-edge-subtle` → ボーダー
- `border-spot` → 選択ボーダー
- `text-ink` → テーマ名
- `text-ink-sub` → 説明文

インラインstyleの使用:
- `previewGradient` → ドットのbackground（テーマごとに異なるため）

## 影響範囲

- `framer-motion`: ThemeSelectorからのimport削除。他のファイルで使用されている場合はパッケージ自体は残す
- `react-icons/tb`: ThemeSelectorからのimport削除（TbCoffee等）。他で使用されていれば残す
- `useAppTheme` / `ThemeProvider`: 変更なし
- テーマ切り替え機能: 変更なし（setTheme呼び出しは同じ）
