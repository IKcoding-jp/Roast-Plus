# 修正内容の確認 (Walkthrough)

試飲記録の日付表示位置を移動しました。

## 変更内容

### [TastingSessionCarousel.tsx](file:///d:/Dev/roastplus/components/TastingSessionCarousel.tsx)

- **デスクトップ**:
  - ヘッダーから日付を削除。
  - フッター左下の「roastplusオリジナルブレンド記録」を日付表示（カレンダーアイコン付き）に置換。
- **モバイル**:
  - ヘッダーから日付を削除。
  - フッター左下に日付表示を追加。

## 確認方法

1.  ローカル環境（http://localhost:3000/tasting/）を開きます。
2.  各記録カードのヘッダーから日付が消え、カード左下の領域に日付が表示されていることを確認してください。
