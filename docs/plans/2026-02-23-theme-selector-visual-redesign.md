# テーマセレクター ビジュアルリデザイン 設計書

**日付**: 2026-02-23
**ステータス**: 承認済み

---

## 背景・目的

現在のテーマセレクターは抽象的な「斜め色帯」でテーマを表現しているが、
色だけでは各テーマの雰囲気や個性がパッと見で伝わりにくい。

テーマ名の大きなタイポグラフィ・テーマ専用アイコン・アンビエントアニメーション
を組み合わせることで、「選ぶ体験」をビジュアルに豊かにする。

---

## 決定デザイン: フルイマーシブカード

### カード構造

```
┌──────────────────────────┐
│  [アイコン]    [DARK]     │  ← pt-3 px-3
│                           │
│  ダーク                  │  ← text-2xl font-black（テーマごとに調整）
│  ロースト                │
│                           │
│  深煎りエスプレッソの    │  ← text-xs opacity-75
│  高級感                  │
│                           │
│  ● ● ●           [✓]  │  ← 色スウォッチ + 選択チェック
└──────────────────────────┘
```

**全体**: カード全体がテーマの `previewColors.bg` 色で塗られる
**文字・アイコン色**: `previewColors.text` を使用
**グリッド**: 2カラム維持

---

## タイポグラフィ戦略

各テーマカードのプレビュー内だけフォントウェイト・letter-spacingを変えて
テーマの「重さ・空気感」を演出する（アプリ全体のフォントは変更しない）。

| テーマ | スタイル | 印象 |
|--------|---------|------|
| デフォルト | font-bold tracking-normal | ベーシック |
| ダークロースト | font-black tracking-tight | ヘビー・タイト |
| ライトロースト | font-light tracking-wide | ライト・ゆったり |
| 抹茶ラテ | font-semibold tracking-widest | 和風・等間隔 |
| キャラメルマキアート | font-bold tracking-normal | 温かみ |
| クリスマス | font-extrabold tracking-tight | お祭り感 |
| ダークモード | font-black tracking-tight | モノ・シャープ |

---

## テーマ専用アイコン

react-icons から選定（実装時に在庫確認）。絵文字は使用しない。

| テーマ | アイコン候補 | 理由 |
|--------|------------|------|
| デフォルト | `TbCoffee` / `HiOutlineCup` | コーヒー定番 |
| ダークロースト | `HiOutlineFire` / `TbFlame` | 深煎り・炎 |
| ライトロースト | `HiOutlineSun` / `TbSun` | 朝・明るさ |
| 抹茶ラテ | `TbLeaf` / `PiLeafBold` | 葉・抹茶 |
| キャラメルマキアート | `TbDroplet` / `TbAutumn` | キャラメルドロップ |
| クリスマス | `TbSnowflake` / `HiOutlineSnowflake` | 雪の結晶 |
| ダークモード | `HiOutlineMoon` / `TbMoon` | 月・夜 |

---

## アンビエントアニメーション

**方針**: 常時ループ。Framer Motion `animate` + `repeat: Infinity`。
軽量なdivベース（canvasは使わない）。

| テーマ | アニメーション | 詳細 |
|--------|-------------|------|
| デフォルト | 湯気上昇 | 2〜3本のsvg曲線パスがゆっくり上方へフェードしながら流れる |
| ダークロースト | 炎の明滅 | アイコンが scale 1.0→1.05→1.0 + opacity 0.8→1.0 でゆらぐ |
| ライトロースト | 光の粒子浮上 | 小さな点（w-1 h-1 rounded-full）が下から上へゆっくり消えながら上昇 |
| 抹茶ラテ | 葉のそよぎ | アイコンが rotate -3→3→-3deg でゆっくり揺れる |
| キャラメルマキアート | 温かい光の波 | 背景に radial-gradient が pulse するオーバーレイ |
| クリスマス | 雪のパーティクル | 小さな白い点がランダムな速度で上から下へ降る（5〜8粒） |
| ダークモード | 星の瞬き | 複数の小点が staggered opacity 1→0.2→1 で点滅 |

---

## 実装スキル

- **UIコンポーネント実装**: `/frontend-design` スキル使用
- **アニメーション設計**: 必要に応じて `/find-skills` で専用スキルを探索

---

## 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `components/settings/ThemeSelector.tsx` | カード構造全面リデザイン |
| `lib/theme.ts` | `ThemePreset`に `icon`・`fontStyle`・`animationType` フィールド追加 |
| `components/settings/ThemeSelector.test.tsx` | テスト更新 |
| `lib/theme.test.ts` | 新フィールドのテスト追加 |

---

## 影響範囲

- `app/settings/theme/page.tsx`: ThemeSelector使用（変更不要）
- テーマプレビューのみ変更。実際のアプリ動作・テーマシステムへの影響なし
