# tasklist.md — Pure Neutral Dark テーマ追加

**Issue**: #246
**ブランチ**: `feat/#246-pure-neutral-dark-theme`

---

## フェーズ 1: 準備

- [ ] `feat/#246-pure-neutral-dark-theme` ブランチを作成

## フェーズ 2: 実装

### 2-1. テーマプリセット追加（`lib/theme.ts`）

- [ ] `THEME_PRESETS` 配列の末尾に `dark` プリセットを追加:
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
- [ ] `THEME_IDS` は `THEME_PRESETS.map(t => t.id)` で自動更新（変更不要）

### 2-2. CSS変数ブロック追加（`app/globals.css`）

`@layer theme { }` 内（caramel ブロックの直後）に追加:

- [ ] ヘッダー変数（`--header-bg`, `--header-text`, `--header-accent`, `--header-btn-hover`）
- [ ] 背景変数（`--page`, `--surface`, `--overlay`, `--ground`, `--field`）
- [ ] テキスト変数（`--ink`, `--ink-sub`, `--ink-muted`）
- [ ] ボーダー変数（`--edge`, `--edge-strong`, `--edge-subtle`）
- [ ] アクセント変数（`--spot`, `--spot-hover`, `--spot-subtle`, `--spot-surface`）
- [ ] ボタン変数（`--btn-primary`, `--btn-primary-hover`）
- [ ] ステータス変数（`--danger`, `--success`, `--warning`, `--info` と各 `-subtle`/`-hover`）
- [ ] エラー変数（`--error`, `--error-ring`）
- [ ] カードヘッダー変数（`--card-header-from/via/to`）
- [ ] フィードバック変数（`--feedback-correct`, `--feedback-incorrect`）
- [ ] シャドウ変数（`--card-shadow`, `--card-shadow-hover`, `--card-glow`）

## フェーズ 3: テスト

- [ ] `components/ThemeProvider.test.tsx` に `dark` テーマを追加
  - `isDarkTheme('dark')` が `true` を返すこと
  - テーマプリセットに `id: 'dark'` が存在すること

## フェーズ 4: 検証

- [ ] `npm run lint` — エラー・警告ゼロ
- [ ] `npm run build` — ビルド成功
- [ ] `npm run test:run` — テスト全通過
- [ ] ブラウザで `/settings/theme` を開き「ダークモード」カードが表示されること
- [ ] テーマ切り替えで全ページが正常に表示されること（ThemeSelector, ホーム, タイマー等）

## フェーズ 5: コミット & PR

- [ ] コミット: `feat: Pure Neutral Dark テーマ（ダークモード）を追加 #246`
- [ ] PR 作成 → 自動マージ

---

## 依存関係

なし（既存テーマシステムへの追加のみ）

## 注意事項

- `globals.css` の `@layer theme { }` ブロックの**内側**に追加すること（337行目の `}` の前）
- christmas テーマのように `--btn-primary` をブランド色に変えず、オレンジ `#d97706` を維持する
