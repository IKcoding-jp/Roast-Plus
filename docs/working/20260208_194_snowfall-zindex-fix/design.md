# 設計書

## 実装方針

### 変更対象ファイル
- `components/Snowfall.tsx:133` - コンテナのz-index変更（`z-[1]` → `z-0` or 削除）
- `components/Snowfall.tsx:171` - 各雪片のzIndex style

### 新規作成ファイル
- なし

## 現状分析
- コンテナ: `z-[1]`（Tailwind）
- 各雪片: `zIndex: flake.depth`（0, 1, 2のインラインスタイル）
- ホーム画面のカード等はz-index指定なし（auto = 0）

## 修正方針
- コンテナのz-indexを`z-0`にするか、必要に応じて負の値（`-z-10`等）に設定
- 各雪片のdepthは相対的な奥行き表現のためそのまま維持可能（コンテナ内での相対値）

## 影響範囲
- `components/Snowfall.tsx` のみ
- カード側の変更は不要

## 禁止事項チェック
- ❌ 独自CSS生成しない（既存Tailwindクラスを使用）
- ❌ 設計方針を変更しない
