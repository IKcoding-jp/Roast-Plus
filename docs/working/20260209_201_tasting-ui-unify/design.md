# 設計書

## 実装方針

### 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `components/TastingSessionList.tsx` | 空状態の `motion.div` → `<Card>` に置き換え、`overflow-y-hidden` 見直し |
| `components/TastingSessionCarousel.tsx` | `h-[calc(100vh-140px)]` のマジックナンバー修正 |
| `app/tasting/page.tsx` | `pb-20 sm:pb-0` の修正 |

### 新規作成ファイル

なし

## 空状態カードの置き換え

### Before（現在: `TastingSessionList.tsx` 行 151-184）
```tsx
<motion.div
  className="max-w-md w-full rounded-[3rem] p-10 border border-edge shadow-card text-center space-y-8 bg-surface"
>
  {/* 空状態コンテンツ */}
</motion.div>
```

### After（提案）
```tsx
<motion.div>
  <Card className="max-w-md w-full rounded-[3rem] p-10 text-center space-y-8">
    {/* 空状態コンテンツ */}
  </Card>
</motion.div>
```

**ポイント**: `Card` の `variant="default"` で `bg-surface rounded-2xl shadow-card border border-edge p-4` が自動適用。追加の `className` でオーバーライド。

## スクロール制御の修正

### `pb-20 sm:pb-0` の問題
- モバイルフッターナビがないため `pb-20` は不要
- 修正: `pb-4` 等の適切な値に変更

### `h-[calc(100vh-140px)]` の問題
- `140px` の内訳が不明確（ヘッダー + パディング + フッターの合算？）
- 修正方針: CSS変数またはヘッダー高さの動的取得で計算

## 影響範囲

- 試飲記録一覧画面のみ
- セッション詳細・記録入力には影響なし

## 禁止事項チェック

- ❌ 独自CSS生成しない
- ❌ Firestoreスキーマの変更不可
- ❌ 既存の機能ロジック変更不可（UIの見た目のみ変更）
