# 設計書 — Issue #274 テーマプレビューカード個性強化 v2

設計の詳細は `docs/plans/2026-02-23-theme-selector-redesign-v2.md` を参照。
以下は実装者向けの差分サマリー。

## 変更ファイル

### 1. `lib/theme.ts`

#### 型変更
```typescript
export interface ThemePreset {
  // ...既存フィールド...
  /** プレビューカード背景グラデーション (CSS background プロパティ値) */
  bgGradient: string;
}
```

#### 各テーマへの追加値
```typescript
// default
bgGradient: 'linear-gradient(135deg, #261a14 0%, #3d2008 100%)',

// dark-roast
bgGradient: 'linear-gradient(135deg, #0d0b09 0%, #200a04 100%)',

// light-roast
bgGradient: 'linear-gradient(135deg, #faf6ef 0%, #ede0c8 100%)',

// matcha
bgGradient: 'linear-gradient(135deg, #0f1f15 0%, #041a09 100%)',

// caramel
bgGradient: 'linear-gradient(135deg, #1a120d 0%, #2e1200 100%)',

// christmas
bgGradient: 'linear-gradient(135deg, #051a0e 0%, #100520 100%)',

// dark
bgGradient: 'linear-gradient(135deg, #0f0f0f 0%, #0f1020 100%)',
```

---

### 2. `components/settings/ThemeSelector.tsx`

#### アニメーション強化（数値変更のみ）

| コンポーネント | 変更箇所 | 変更前 | 変更後 |
|----------------|---------|--------|--------|
| `SteamAnimation` | opacity | `[0, 0.35, 0]` | `[0, 0.65, 0]` |
| `FlameAnimation` | opacity | `[0.08, 0.2, 0.08]` | `[0.3, 0.65, 0.3]` |
| `FlameAnimation` | scale | `[1, 1.1, 1]` | `[1, 1.35, 1]` |
| `LeafAnimation` | opacity | 固定`0.12` → props化 | `animate={{ opacity: [0.15, 0.35, 0.15] }}` |
| `LeafAnimation` | rotate | `[-4, 4, -4]` | `[-10, 10, -10]` |
| `GlowAnimation` | bg色強度 | `${color}22` | `${color}55` |
| `SnowAnimation` | opacity | `0.65` | `0.9` |
| `StarsAnimation` | opacity | `[0.8, 0.1, 0.8]` | `[1, 0.05, 1]` |

#### `ThemePreviewCard` レイアウト変更

```tsx
// 背景: bgGradient を使用
<button style={{ background: preset.bgGradient }}>

  {/* 背景層: 大型装飾アイコン（右下） */}
  <div className="absolute bottom-0 right-1 pointer-events-none">
    <Icon size={90} style={{ color: accent, opacity: 0.10 }} aria-hidden />
  </div>

  {/* アンビエントアニメーション層 */}
  <ThemeAnimation ... />

  {/* コンテンツ層 */}
  <div className="relative z-10 p-4 flex flex-col gap-2 min-h-[152px]">

    {/* 上部: アイコン単独（バッジを削除） */}
    <div>
      <Icon size={22} style={{ color: text }} aria-hidden />
    </div>

    {/* 中部: テーマ名 + 説明 */}
    <div className="flex-1">
      <span ...>{preset.name}</span>
      <p ...>{preset.description}</p>
    </div>

    {/* 下部: バッジ + スウォッチ + チェック */}
    <div className="flex items-center gap-2">
      <span data-testid={`badge-${preset.id}`} ...>
        {preset.type === 'light' ? 'LIGHT' : 'DARK'}
      </span>
      <div className="flex gap-1.5">
        {[bg, surface, accent].map(...)}
      </div>
      <div className="ml-auto">
        {isSelected && <HiCheck />}
      </div>
    </div>

  </div>
</button>
```

## テスト影響

### `lib/theme.test.ts`
- `bgGradient` フィールドが全プリセットに存在することを確認するテストを追加

### `components/settings/ThemeSelector.test.tsx`
- `data-testid="badge-*"` は下部バーに移動後も `data-testid` を維持するため、テスト自体は変更不要
- レイアウト変更によるスナップショットテストがある場合は更新が必要（現状なし）
