# 試飲記録の日付表示位置の変更

試飲記録（焙煎・乾燥記録）のカードにおいて、日付の表示位置をヘッダーからフッターの左下（「roastplusオリジナルブレンド記録」と記載されている箇所）へ移動します。

## Proposed Changes

### [Tasting]

#### [MODIFY] [TastingSessionCarousel.tsx](file:///d:/Dev/roastplus/components/TastingSessionCarousel.tsx)

- **デスクトップ表示 (isDesktop)**:
  - ヘッダー部分（196-199行目付近）の `CalendarBlank` と日付表示を削除します。
  - フッター部分（322行目付近）の「ローストプラス オリジナルブレンド記録」というテキストを、日付表示（`CalendarBlank` アイコン付き）に置き換えます。
- **モバイル表示**:
  - ヘッダー部分（393-396行目付近）の日付表示を削除します。
  - フッター部分（494行目付近）に、デスクトップと同様の日付表示を追加します。

## Verification Plan

### Manual Verification
- ローカル環境（http://localhost:3000/tasting/）で以下の点を確認します：
  - デスクトップ表示で、日付が左下の「roastplusオリジナルブレンド記録」の場所に出ていること。
  - モバイル表示で、日付がフッター内に表示されていること。
  - ヘッダーから日付が消えてスッキリしていること。
