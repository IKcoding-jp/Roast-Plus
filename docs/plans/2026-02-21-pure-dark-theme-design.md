# Pure Neutral Dark テーマ設計書

**日付**: 2026-02-21
**概要**: 目の疲れ防止・ブルーライト軽減を目的とした実用的ダークテーマの追加

---

## 背景と動機

RoastPlusには既に6テーマ（default, dark-roast, light-roast, matcha, caramel, christmas）が存在するが、
これらはコーヒーブランディング的な審美テーマである。
ユーザーが求めているのは VSCode / GitHub のような「実用的なダークモード」—
目の疲れ防止・ブルーライト軽減に特化したニュートラルな配色。

---

## アーキテクチャ

既存のテーマシステムに完全準拠し、最小コストで7番目のテーマとして追加する。

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `lib/theme.ts` | `THEME_PRESETS` 配列に新プリセット追加 |
| `app/globals.css` | `[data-theme="dark"]` CSS変数ブロック追加 |
| `components/ThemeProvider.test.tsx` | 新テーマのテスト追加 |

※ `ThemeProvider.tsx` は `THEME_IDS = THEME_PRESETS.map(t => t.id)` で自動更新されるため変更不要
※ `ThemeSelector.tsx` も `THEME_PRESETS` をマップするため変更不要（自動表示）

---

## テーマプリセット定義

```typescript
{
  id: 'dark',
  name: 'ダークモード',
  description: '目の疲れを抑える汎用ダークテーマ',
  type: 'dark',
  themeColor: '#0f0f0f',
  previewColors: {
    bg: '#0f0f0f',
    surface: '#1a1a1a',
    accent: '#d97706',
    text: '#e8e8e8',
  },
}
```

---

## CSS変数設計

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

## 設計の根拠

- **純粋なグレースケール背景**: コーヒーカラーを排除し、目の疲れに最適化
- **アクセントカラー継承**: 既存オレンジ `#d97706` を維持しブランド一貫性を保つ
- **ステータスカラー統一**: dark-roast と同一（暗背景での視認性確保済み）
- **WCAG AA基準**: `#e8e8e8` on `#0f0f0f` = コントラスト比 約14.5:1（基準4.5:1を大幅上回る）
