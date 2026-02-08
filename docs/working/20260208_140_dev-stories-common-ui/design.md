# 設計書: 開発秘話ページの共通UI化とテーマシステム対応

## 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `app/dev-stories/page.tsx` | BackLink導入、CSS変数化、テーマ対応 |
| `app/dev-stories/[id]/EpisodeDetailClient.tsx` | BackLink導入、CSS変数化、ナビボタン置換 |
| `components/dev-stories/EpisodeCard.tsx` | Card導入、Badge導入、CSS変数化 |
| `components/dev-stories/DetailSection.tsx` | Card導入、Badge導入、CSS変数化 |
| `components/dev-stories/DialogueSection.tsx` | CSS変数化（グラデーション、カード背景） |

## 変更しないファイル

| ファイル | 理由 |
|---------|------|
| `components/dev-stories/DialogueBubble.tsx` | キャラ固有色はデザイン意図どおり |
| `components/dev-stories/CharacterAvatar.tsx` | 画像表示のみ、テーマ非依存 |
| `app/dev-stories/[id]/page.tsx` | サーバーコンポーネント、UI変更なし |
| `data/dev-stories/` | データ層、UI変更なし |

## 色マッピング（ハードコード → CSS変数）

| ハードコード | CSS変数 | 用途 |
|------------|---------|------|
| `#F7F7F5` / `style={{ backgroundColor }}` | `bg-page` | ページ背景 |
| `bg-white` | `bg-surface` | カード・セクション背景 |
| `bg-white/50` | `bg-surface/50` | ヘッダー背景 |
| `bg-white/60` | `bg-surface/60` | キャラ紹介カード |
| `bg-white/40` | `bg-surface/40` | 関係性説明 |
| `border-gray-100` / `border-gray-200` | `border-edge` | ボーダー |
| `text-gray-800` | `text-ink` | メインテキスト |
| `text-gray-600` | `text-ink-sub` | サブテキスト |
| `text-gray-500` | `text-ink-sub` | サブテキスト |
| `text-gray-400` | `text-ink-muted` | 淡いテキスト |
| `bg-gray-100` | `bg-ground` | タグ背景、空状態背景 |
| `bg-amber-100` / `from-amber-50` | テーマ対応グラデーション | サムネイル・対話背景 |

## 共通UIコンポーネント使用計画

### BackLink
```tsx
// Before
<Link href="/" className="px-3 py-2 text-gray-600 hover:text-gray-800 ...">
  <HiArrowLeft className="h-6 w-6" />
</Link>

// After
<BackLink href="/" variant="icon-only" aria-label="戻る" />
```

### Card（EpisodeCard, DetailSection）
```tsx
// Before
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 ...">

// After（CSS変数直接使用、Cardが合わない場合）
<div className="bg-surface rounded-xl shadow-sm border border-edge p-4 ...">
```

### Badge（タグ表示）
```tsx
// Before
<span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">

// After
<Badge variant="outline" size="sm">{tag}</Badge>
```

## 特殊対応: 対話セクションのグラデーション

DialogueSectionの `bg-gradient-to-b from-amber-50 to-orange-50/50` は、テーマ対応が必要。

**方針**: CSS変数 `bg-surface` ベースに変更し、テーマごとに自動切替。
```tsx
// クリスマスモードでも違和感のない、テーマ対応の背景
<div className="bg-ground rounded-2xl p-4 sm:p-6">
```

## 禁止事項チェック

- [x] 生のTailwindでボタン/カード/入力を作成していないか → 共通UIに置換
- [x] `isChristmasMode` propを渡していないか → CSS変数で自動対応
- [x] `bg-surface` をモーダル背景に使っていないか → モーダルなし
- [x] ハードコード色が残っていないか → 全置換
