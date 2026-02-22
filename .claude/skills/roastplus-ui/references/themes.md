# テーマシステムガイド

テーマ固有のカスタマイズが必要な場合のガイド。通常のUI実装ではセマンティックトークン（`bg-surface`, `text-ink` 等）だけで全テーマ自動対応するため、本ファイルの参照は不要。

---

## 7テーマ一覧

| data-theme値 | テーマ名 | 特徴 |
|-------------|---------|------|
| (なし/default) | デフォルト | クリーム白ベース、オレンジアクセント |
| `christmas` | クリスマス | 深緑ベース、ゴールドアクセント |
| `dark-roast` | ダークロースト | 漆黒ベース、渋ゴールドアクセント |
| `light-roast` | ライトロースト | ベージュベース、マスタードアクセント |
| `matcha` | 抹茶 | 深緑ベース、グリーンアクセント |
| `caramel` | キャラメル | ダークブラウンベース、キャラメルアクセント |
| `dark` | ダーク | 黒ベース、低コントラスト・目の疲れ防止 |

設定画面（`/settings/theme`）で手動切替。`html` 要素に `data-theme` 属性が設定される。

## テーマ固有の装飾が必要な場合

CSS変数だけでは対応できない場合（テーマ固有の装飾要素等）に限り、以下の方法を使用。

### 方法1: CSS `[data-theme]` セレクタ（推奨）

```css
/* globals.css の @layer utilities に追加 */
.my-decoration { display: none; }
[data-theme="christmas"] .my-decoration { display: block; }
```

### 方法2: useAppTheme フック（JSX内条件レンダリング）

```tsx
const { isChristmasTheme } = useAppTheme();

// OK: テーマ固有の装飾要素の出し分け
{isChristmasTheme && <SnowflakeEffect />}

// NG: 配色の条件分岐（CSS変数で自動対応すべき）
<div className={isChristmasTheme ? 'bg-[#051a0e]' : 'bg-white'}>
```

## チェックリスト

新規UI作成時の確認:

- [ ] セマンティックトークン使用（`text-ink`, `bg-surface`, `border-edge` 等）
- [ ] 直接hex値のハードコードなし
- [ ] テーマ判定の条件分岐で配色を変えていない
- [ ] `@/components/ui` の共通コンポーネント使用
- [ ] モーダル背景は `bg-overlay`（不透明必須）
- [ ] テキストのコントラスト比が全テーマで WCAG AA（4.5:1）以上
