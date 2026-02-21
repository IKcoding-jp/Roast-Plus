# design.md — Pure Neutral Dark テーマ設計詳細

**Issue**: #246

---

## 変更対象ファイル

| ファイル | 変更種別 | 変更内容 |
|---------|---------|---------|
| `lib/theme.ts` | 追加 | `THEME_PRESETS` 末尾に `dark` プリセット |
| `app/globals.css` | 追加 | `[data-theme="dark"]` ブロック（337行目の `}` 直前） |
| `components/ThemeProvider.test.tsx` | 追加 | `dark` テーマのテストケース |

## 変更不要なファイル（自動対応）

| ファイル | 理由 |
|---------|------|
| `components/ThemeProvider.tsx` | `THEME_IDS = THEME_PRESETS.map(t => t.id)` で自動反映 |
| `components/settings/ThemeSelector.tsx` | `THEME_PRESETS` をマップして描画するため自動表示 |
| `hooks/useAppTheme.ts` | `isDarkTheme()` は `type: 'dark'` を参照するため自動動作 |

---

## CSS変数の完全定義

```css
[data-theme="dark"] {
  /* ヘッダー */
  --header-bg: #0f0f0f;
  --header-text: #e8e8e8;
  --header-accent: #d97706;
  --header-btn-hover: rgba(217, 119, 6, 0.2);
  /* 背景 */
  --page: #0f0f0f;
  --surface: #1a1a1a;
  --overlay: #1f1f1f;
  --ground: rgba(255, 255, 255, 0.03);
  --field: rgba(255, 255, 255, 0.07);
  /* テキスト */
  --ink: #e8e8e8;
  --ink-sub: #a0a0a0;
  --ink-muted: rgba(160, 160, 160, 0.6);
  /* ボーダー */
  --edge: rgba(255, 255, 255, 0.10);
  --edge-strong: rgba(255, 255, 255, 0.18);
  --edge-subtle: rgba(255, 255, 255, 0.06);
  /* アクセント（既存オレンジ維持） */
  --spot: #d97706;
  --spot-hover: #b45309;
  --spot-subtle: rgba(217, 119, 6, 0.15);
  --spot-surface: rgba(217, 119, 6, 0.05);
  /* ボタン */
  --btn-primary: #d97706;
  --btn-primary-hover: #b45309;
  /* ステータスカラー */
  --danger: #ef4444;
  --danger-subtle: rgba(239, 68, 68, 0.15);
  --success: #22c55e;
  --success-subtle: rgba(34, 197, 94, 0.15);
  --warning: #eab308;
  --warning-subtle: rgba(234, 179, 8, 0.15);
  --info: #06b6d4;
  --info-hover: #22d3ee;
  /* エラー */
  --error: #f87171;
  --error-ring: rgba(248, 113, 113, 0.2);
  /* カードヘッダー */
  --card-header-from: #1a1a1a;
  --card-header-via: #2a2a2a;
  --card-header-to: #1a1a1a;
  /* フィードバックテキスト */
  --feedback-correct: #4ade80;
  --feedback-incorrect: #fb7185;
  /* シャドウ */
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  --card-shadow-hover: 0 8px 24px rgba(217, 119, 6, 0.1);
  --card-glow: 0 20px 50px rgba(0, 0, 0, 0.4);
}
```

---

## 配色の根拠

### 背景

| トークン | 値 | コントラスト比（vs #e8e8e8） | 根拠 |
|---------|-----|--------------------------|------|
| `--page` | `#0f0f0f` | 14.5:1 | ほぼ黒、最深層 |
| `--surface` | `#1a1a1a` | 12.6:1 | カード/パネル（page+10） |
| `--overlay` | `#1f1f1f` | 11.8:1 | モーダル背景（surface+5） |

### アクセント

- `#d97706`（既存デフォルトテーマと同一）を維持
- コーヒーブランドカラーを保ちつつ、汎用ダークテーマとして機能

### ステータスカラー

- dark-roast テーマと同一の値を採用（暗背景での視認性が検証済み）
- 赤/緑/黄/青の基本色を維持し、rgba 透明度で subtle バリアント

---

## `globals.css` への挿入箇所

```
@layer theme {
  :root { ... }         ← デフォルト
  [data-theme="christmas"] { ... }
  [data-theme="dark-roast"] { ... }
  [data-theme="light-roast"] { ... }
  [data-theme="matcha"] { ... }
  [data-theme="caramel"] { ... }
  ↑ ここ（337行目 `}` の直前）に [data-theme="dark"] を追加
}
```

---

## `lib/theme.ts` への挿入箇所

```typescript
export const THEME_PRESETS: ThemePreset[] = [
  { id: 'default', ... },
  { id: 'dark-roast', ... },
  { id: 'light-roast', ... },
  { id: 'matcha', ... },
  { id: 'caramel', ... },
  { id: 'christmas', ... },
  { id: 'dark', ... },   ← 末尾に追加（100行目付近）
];
```
