# 設計書

## 実装方針

### 変更対象ファイル
- `components/Snowfall.tsx` - コンポーネント全体の書き換え

### 新規作成ファイル
- なし

### 削除対象
- `SimpleSnowflake`, `MediumSnowflake`, `ComplexSnowflake` SVGコンポーネント
- `SnowflakeShape` コンポーネント
- `getRandomShape` 関数
- `SnowflakeShape` 型

## 現状の問題点

| 項目 | 現状 | 問題 |
|------|------|------|
| 雪片数 | 60個 | DOM要素過多 |
| 雪片実装 | SVG（4〜16要素/個） | 描画コスト高 |
| フィルタ | `blur() + drop-shadow() × 2` | GPU負荷大 |
| 合計DOM要素 | 60 + SVG内部要素（推定500+） | レイアウト計算過多 |

## 最適化設計

### 軽量実装案
```tsx
// CSS-onlyの雪片（divの丸い要素）
<div
  className="snowflake"
  style={{
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, opacity)',
  }}
/>
```

### パフォーマンス目標
| 項目 | 現状 | 目標 |
|------|------|------|
| 雪片数 | 60個 | 20〜30個 |
| DOM要素数 | 500+ | 25〜35 |
| フィルタ | blur + drop-shadow × 2 | なし（opacity のみ） |
| アニメーション | transform + rotate | transform のみ（translateY） |

### 奥行き表現
- 3層構造は維持（opacity + sizeで表現）
- blurは除去（GPUコスト高）

## 影響範囲
- `components/Snowfall.tsx` のみ
- `app/page.tsx` - 変更不要（dynamic importのインターフェース維持）
- エクスポート名 `Snowfall` を維持

## 禁止事項チェック
- ❌ 独自CSS生成しない（styled-jsx継続使用OK）
- ❌ 設計方針を変更しない
- ❌ インターフェース変更しない（named export `Snowfall` を維持）
