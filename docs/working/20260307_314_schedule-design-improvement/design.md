# 設計書

## 実装方針

「洗練された進化」アプローチ: 現在のレイアウト構造を維持しつつ、各要素のスタイリングを底上げする。

### 変更対象ファイル
- `app/schedule/page.tsx` - 日付ナビ、タブナビのCSS class変更 + Framer Motion追加
- `components/TodaySchedule.tsx` - カード・行・空状態のCSS class変更
- `components/RoastSchedulerTab.tsx` - カード・空状態のCSS class変更
- `components/roast-scheduler/ScheduleCard.tsx` - カードデザインのCSS class変更

### 新規作成ファイル
- なし

## UI設計

### コンポーネント構成
- `SchedulePage` (既存) → 日付ナビ・タブナビのスタイリング変更、Framer Motion追加
- `TodaySchedule` (既存) → カードスタイリング・空状態改善
- `RoastSchedulerTab` (既存) → カードスタイリング・空状態改善
- `ScheduleCard` (既存) → カードデザイン改善

### 使用する共通コンポーネント
- `Card` (variant="guide") — 空状態ガイドカード
- `Button`, `IconButton` — 既存使用を維持
- `FloatingNav` — 既存使用を維持

### スタイリング変更の詳細

#### 日付ナビゲーション
```
現在: rounded-2xl shadow-xl bg-surface border-2 border-edge-strong
変更: rounded-2xl shadow-lg bg-surface border border-edge
```

#### 下部タブナビ（モバイル）
```
現在: ボタン3つ横並び（rounded-t-xl shadow-lg border-2 border-edge-strong）
変更: セグメントコントロール風（rounded-2xl shadow-xl border border-edge）
      + Framer Motion layoutId インジケーター
      + OCRボタン分離（FAB風）
```

#### コンテンツカード
```
現在: rounded-2xl p-4 shadow-xl backdrop-blur-sm bg-surface border-2 border-edge-strong
変更: rounded-2xl p-4 shadow-lg bg-surface border border-edge
```

#### ScheduleCard
```
現在: rounded-md border p-3 border-edge bg-ground hover:bg-amber-50 hover:border-amber-300
変更: rounded-lg border p-3 border-edge bg-ground hover:bg-ground hover:border-spot
      + border-l-2（タイプ別カラー: 予熱=orange, ロースト=amber, パージ=blue, 掃除=gray）
```

#### 空状態
```
現在: アイコン + テキスト2行
変更: Card variant="guide" + ステップガイド + アイコン丸背景
```

## 影響範囲
- スケジュールページのビジュアルのみ
- 他ページ・データ構造・ロジックへの影響なし

## UI実装ルール確認
- [x] 共通コンポーネント使用（`@/components/ui`）
- [x] テーマ対応: セマンティックCSS変数使用（`bg-page`, `text-ink` 等）
- [x] ハードコード色の禁止（既存の `hover:bg-amber-50` 等をCSS変数に置換）

## 禁止事項チェック
- [x] 独自CSSでボタン/カード/入力を作らない
- [x] 新しい状態管理ライブラリを導入しない
- [x] 設計方針を変更しない

## ADR

### Decision-001: Framer Motion layoutIdでタブインジケーター
- **理由**: タブ切替のアクティブインジケーターにスムーズなスライドアニメーションを実現。既にプロジェクトでFramer Motionを使用しているため追加依存なし
- **影響**: `app/schedule/page.tsx` に `motion.div` の import追加
