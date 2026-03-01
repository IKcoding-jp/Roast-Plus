# design.md — Issue #280

## 変更対象ファイル

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `components/defect-beans/SortMenu.tsx` | 削除 → `FilterMenu.tsx` に統合 |
| `components/defect-beans/FilterMenu.tsx` | 新規作成 | 検索・絞り込み・ソートを統合したモーダル |
| `components/defect-beans/SearchFilterSection.tsx` | 削除 | ページから除去 |
| `app/defect-beans/page.tsx` | 修正 | import・JSX更新 |

## FilterMenu コンポーネント設計

### Props

```typescript
interface FilterMenuProps {
  // 検索
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // 絞り込み
  filterOption: FilterOption;        // 'all' | 'shouldRemove' | 'shouldNotRemove'
  onFilterChange: (option: FilterOption) => void;
  // ソート
  sortOption: SortOption;            // 既存の SortOption 型を維持
  onSortChange: (option: SortOption) => void;
}
```

### UI構成

```
[フィルター ▼] ボタン（FloatingNav 内）
  ↓ クリックで Modal を開く

Modal:
┌─────────────────────────────┐
│ フィルター             [×]  │
│ ─────────────────────────── │
│ 🔍 検索                     │
│ [名称や特徴で検索.........]  │
│ ─────────────────────────── │
│ 🗂 絞り込み                 │
│ [全て]  [省く]  [省かない]  │
│ ─────────────────────────── │
│ ↕ ソート                    │
│ [デフォルト] [新しい順] ... │
└─────────────────────────────┘
```

### モーダル実装方針

- `@/components/ui` の `Modal` コンポーネントを使用
- モーダルサイズ: `sm` 〜 `md`（コンテンツに合わせる）
- モーダルを閉じても選択状態（filterOption, sortOption, searchQuery）は page.tsx の state で保持

## 実装上の注意

### SortOption の型定義

現在 `SortMenu.tsx` と `page.tsx` それぞれで `type SortOption` を定義している。
`FilterMenu.tsx` でも同様に定義するか、`types/` に共通型として切り出すかを検討。
→ **今回は `FilterMenu.tsx` 内に定義する（最小変更方針）**

### FilterOption の型定義

`SearchFilterSection.tsx` と `page.tsx` それぞれで `type FilterOption` を定義している。
→ **今回は `FilterMenu.tsx` 内に定義する（最小変更方針）**

### showSortMenu 状態の扱い

現在 `page.tsx` に `showSortMenu` state がある。`FilterMenu` では Modal の開閉を内部 state で管理するため、この state は `page.tsx` から削除可能。

## page.tsx の変更ポイント

### 削除するもの
- `SearchFilterSection` の import
- `SearchFilterSection` の JSX（`{allDefectBeans.length > 0 && (<SearchFilterSection .../>)}`）
- `SortMenu` の import
- `showSortMenu` state と `setShowSortMenu`

### 追加・変更するもの
- `FilterMenu` の import
- FloatingNav の `right` 内の `SortMenu` を `FilterMenu` に置き換え
- `FilterMenu` に `searchQuery`, `onSearchChange`, `filterOption`, `onFilterChange` props を追加
