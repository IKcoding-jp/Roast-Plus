# 設計書

## 実装方針

### 変更対象ファイル
- `app/tasting/page.tsx` - セッション編集セクションのコンテナを縦中央配置に変更
- `components/TastingSessionForm.tsx` - ボタン配置を再設計（削除→アイコン化、ボトムを2ボタン1行に）

### 新規作成ファイル
なし

## UI設計

### コンポーネント構成
- `TastingSessionForm` (既存) → ボタン配置変更
- `app/tasting/page.tsx` (既存) → コンテナクラス変更

### 変更詳細

#### app/tasting/page.tsx（縦中央配置）

```diff
- <div className="min-h-screen pt-14 pb-6 sm:pb-8 px-4 sm:px-6 bg-page">
+ <div className="min-h-screen flex flex-col items-center justify-center pt-14 pb-6 sm:pb-8 px-4 sm:px-6 bg-page">
    <FloatingNav backHref="/tasting" />
-   <div className="max-w-lg mx-auto space-y-6">
+   <div className="max-w-lg mx-auto w-full">
```

`flex flex-col items-center justify-center` で縦中央配置を実現。`pt-14` は FloatingNav との重なり防止のため維持。

#### components/TastingSessionForm.tsx（ボタン再配置）

**ゴミ箱アイコンボタン（フォーム最上部に追加）**:
```tsx
{!isNew && onDelete && (
  <div className="flex justify-end mb-4">
    <IconButton
      icon={<Trash size={18} weight="bold" />}
      variant="ghost"
      aria-label="セッションを削除"
      onClick={handleDelete}
      className="text-danger hover:bg-danger/10"
    />
  </div>
)}
```

**ボトムボタン行（削除を除いた2ボタン、常に横並び）**:
```tsx
<div className="flex gap-3 mt-6">
  <Button
    type="button"
    variant="secondary"
    onClick={onCancel}
    className="flex-1"
  >
    <X size={20} weight="bold" />
    キャンセル
  </Button>
  <Button
    type="submit"
    variant="primary"
    className="flex-[1.5]"
  >
    <Check size={20} weight="bold" />
    {isNew ? 'セッションを作成' : '更新する'}
  </Button>
</div>
```

### 使用する共通コンポーネント
- `IconButton` — `@/components/ui` から使用（ゴミ箱アイコンボタン）
- `Button` — 既存使用継続

## 影響範囲
- 試飲セッション編集画面のみ（新規作成時はゴミ箱非表示で影響なし）
- `TastingSessionForm` は他箇所でも使用されている可能性があるため確認推奨

## UI実装ルール確認
- [x] 共通コンポーネント使用（`@/components/ui`）
- [x] テーマ対応: セマンティックCSS変数使用（`bg-page` 等）
- [x] ハードコード色の禁止

## ADR

### Decision-001: 削除ボタンをフォーム内アイコンボタンとして配置
- **理由**: FloatingNav変更はスコープ超過。フォーム内右上配置が最もシンプルで影響範囲が小さい
- **影響**: `TastingSessionForm` に `IconButton` の追加インポートが必要
