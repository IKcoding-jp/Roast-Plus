# 設計書: 担当表モーダルデザイン統一

## Issue
#291

## 基準モーダル（理想形）

コンテキストメニューモーダル（`TableModals.tsx` 98-284行目）の構造:

```tsx
{/* オーバーレイ */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <motion.div className="absolute inset-0 bg-black/40" onClick={onClose} />

  {/* モーダル本体 */}
  <motion.div className="rounded-xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden bg-overlay border border-edge">

    {/* ヘッダー */}
    <div className="px-4 py-3 flex items-center justify-between bg-ground border-b border-edge">
      <h3 className="font-bold text-ink">タイトル</h3>
      <IconButton variant="ghost" size="sm" onClick={onClose}>
        <MdClose size={20} />
      </IconButton>
    </div>

    {/* ボディ */}
    <div className="p-4">
      {/* コンテンツ */}
    </div>
  </motion.div>
</div>
```

## 各モーダルの差分と修正方針

### TableModals.tsx

| モーダル | 現状 | 修正 |
|---------|------|------|
| コンテキストメニュー | アクションボタン text-spot | `!text-ink` 追加 |
| メンバー選択 | ヘッダーなし、rounded-lg | 構造は現状維持（機能的に適切） |
| チーム編集 | キャンセル ghost | `variant="secondary"` |
| 幅設定 | キャンセル ghost | `variant="secondary"` |
| 高さ設定 | キャンセル secondary | 変更なし |

### ManagerDialog.tsx

| 項目 | 現状 | 修正後 |
|------|------|--------|
| ヘッダー | なし（h2のみ） | `bg-ground border-b` ヘッダー追加 |
| 閉じる | `Button ghost HiX` | `IconButton ghost MdClose` |
| 角丸 | `rounded-lg` | `rounded-xl` |

### PairExclusionSettingsModal.tsx

| 項目 | 現状 | 修正後 |
|------|------|--------|
| ヘッダー | 背景なし | `bg-ground border-b` 追加 |
| 閉じる | `Button ghost HiX` | `IconButton ghost MdClose` |
| 角丸 | `rounded-lg` | `rounded-xl` |
| オーバーレイ | `bg-black/30` | `bg-black/40` |

### MemberSettingsDialog.tsx

| 項目 | 現状 | 修正後 |
|------|------|--------|
| ヘッダー | `bg-primary text-white` | `bg-ground text-ink border-b` |
| 閉じる | `Button ghost × text-white` | `IconButton ghost MdClose` |
| フッター閉じる | `variant="secondary"` | そのまま |
| オーバーレイ | `bg-black bg-opacity-50` | `bg-black/40` |
