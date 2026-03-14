# 設計書

## 実装方針

### 変更対象ファイル
- `components/RoastTimer.tsx` — 1画面3ステートコンテナに全面再構成
- `components/roast-timer/TimerDisplay.tsx` — リング常時表示+ティックマーク+Fraunces
- `components/roast-timer/TimerControls.tsx` — running/completedの下部ボタン
- `components/roast-timer/SetupPanel.tsx` — 重量カード3択のみ
- `components/roast-timer/index.ts` — export更新
- `app/roast-timer/page.tsx` — FloatingNav + レイアウト調整
- `app/layout.tsx` — Fraunces フォント読み込み追加

### 削除ファイル
- `components/roast-timer/ModeSelectView.tsx`
- `components/roast-timer/RecommendedModeView.tsx`
- `components/roast-timer/TimerHeader.tsx`

## UI設計

### レイアウト構造

```
┌──────────────────────────────┐
│ [←]                  [⚙ 設定]│  header: 56px, flex-shrink:0
├──────────────────────────────┤
│                              │
│         ┌─────────┐          │
│         │ ●●●●●●● │          │  ring-section: flex:1
│         │  8:00   │          │  justify-content: center
│         │ 焙煎時間 │          │
│         └─────────┘          │
│                              │
├──────────────────────────────┤
│  [200g] [300g] [500g]        │  lower: flex-shrink:0
│  [    ▶ スタート      ]      │  height: 230px
└──────────────────────────────┘
```

### コンポーネント構成

```
RoastTimer (1画面コンテナ)
├── FloatingNav (既存、backHref="/")
├── 設定ボタン (pill型、header-right)
├── TimerDisplay (常時表示、リング+時間+ティック)
│   └── SVG: track + progress + ticks(60本) + center text
├── [下部パネル: ステート切替]
│   ├── idle: SetupPanel (重量カード3択 + スタートボタン)
│   ├── running: TimerControls + InfoBadge + ElapsedBar
│   └── completed: DoneStats + ResetButton
├── CompletionDialog (既存維持)
├── ContinuousRoastDialog (既存維持)
├── AfterPurgeDialog (既存維持)
└── Modal > RoastTimerSettings (既存維持)
```

### 使用する共通コンポーネント
- `FloatingNav` — ヘッダー戻るボタン
- `Button` — スタート/一時停止/スキップ/リセット
- `Modal` — 設定モーダル（既存維持）

### リングSVGの仕様
- viewBox: `0 0 290 290`, center: `(145, 145)`, r: `116`
- circumference: `2π × 116 ≈ 729`
- strokeWidth: `10`
- ティックマーク: 60本（6°間隔）
  - メジャー（5目盛りごと）: r_out=136→r_in=126, strokeWidth=1.5
  - マイナー: r_out=136→r_in=132, strokeWidth=0.8

### 重量カードの仕様
- 3カード横並び（`grid-template-columns: repeat(3, 1fr)`）
- 各カード: 重さ(Fraunces 26px) + セパレーター + 時間(Fraunces 14px)
- 選択状態: `border: 2px solid var(--spot)`, `background: var(--spot-surface)`
- タッチターゲット: min-height 96px

### パネル遷移アニメーション
- enter: `opacity: 0→1, translateY: 10px→0`, 250ms ease-out
- 全パネル `justify-content: flex-end` でボタンをボトム固定

## 色のマッピング（ハードコード排除）

| 用途 | CSS変数 |
|------|---------|
| ページ背景 | `var(--page)` |
| カード背景 | `var(--surface)` |
| セクション背景 | `var(--ground)` |
| メインテキスト | `var(--ink)` |
| サブテキスト | `var(--ink-sub)` |
| ミュートテキスト | `var(--ink-muted)` |
| ボーダー | `var(--edge)` |
| 強ボーダー | `var(--edge-strong)` |
| アクセント | `var(--spot)` |
| ボタン | `var(--btn-primary)` |
| リング(idle) | `var(--edge-strong)` |
| リング(running) | `var(--spot)` |
| リング(completed) | `var(--success)` |

## UI実装ルール確認
- [x] 共通コンポーネント使用（`@/components/ui`）
- [x] テーマ対応: セマンティックCSS変数使用
- [x] ハードコード色の禁止

## 禁止事項チェック
- [x] 独自CSSでボタン/カード/入力を作らない
- [x] 新しい状態管理ライブラリを導入しない

## ADR

### Decision-001: 1画面3ステート構造
- **理由**: 焙煎機(1F)→作業室(2F)の動線で、タイマー起動は「ワンタップ→放置」のユースケース。画面遷移は不要
- **影響**: ModeSelectView, RecommendedModeView削除、RoastTimer大幅再構成

### Decision-002: Fraunces セリフ体
- **理由**: 時計文字盤のような精密感を演出。光学サイズ対応で大きい数字が美しい
- **影響**: next/fontでの読み込み追加（バンドルサイズ微増）

### Decision-003: 重量プリセット3択のみ
- **理由**: 実運用で使うのは200g/300g/500gの3パターンのみ。手動入力は不要
- **影響**: SetupPanel大幅簡略化、おすすめタイマーフロー完全削除
