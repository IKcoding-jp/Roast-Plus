# 要件定義: コーヒー豆図鑑ページの共通UI化とテーマ対応

## Issue
- **Issue番号**: #136
- **タイトル**: refactor(defect-beans): コーヒー豆図鑑ページの共通UI化とテーマ対応
- **タイプ**: リファクタリング

## 背景
コーヒー豆図鑑ページ（`app/defect-beans/`）では、多くのUI要素が独自の生HTMLで実装されている。
プロジェクト全体の共通UIコンポーネント化の一環として、これらを `@/components/ui` の共通コンポーネントに置換し、クリスマスモード対応を追加する。

## ユーザーストーリー
- ユーザーとして、コーヒー豆図鑑ページでもクリスマスモードが適用されることを期待する
- 開発者として、コーヒー豆図鑑ページのUI要素が共通コンポーネントで統一されていることで保守性が向上する

## 受け入れ基準

### 必須
1. ページ内のすべての独自`<button>`が `<Button>` または `<IconButton>` に置換されている
2. 戻るリンクが `<BackLink>` に置換されている
3. モーダル（DefectBeanForm, DefectBeanCompare）が `<Modal>` に置換されている
4. `useChristmasMode` フックが導入され、`isChristmasMode` が各共通コンポーネントに渡されている
5. 既存の機能（検索、フィルタ、ソート、比較、追加、編集、削除）がすべて正常に動作する
6. lint / build / test がすべて通過する

### 対象外
- DefectBeanCardのカードコンテナ自体の `<Card>` 化（画像フレーム等の独自デザインが強い）
- SortMenuのドロップダウン内の選択肢（独自挙動のため）

## 現状分析

### 共通UI使用済み（変更不要）
- `SearchFilterSection`: `Input`, `Button` 使用済み
- `DefectBeanFormFields`: `Input`, `Textarea`, `Button` 使用済み

### 独自実装（要置換）
- `page.tsx`: 生`<button>` × 4、`<Link>`（戻る）
- `DefectBeanCard.tsx`: 生`<button>` × 3（省く/省かない、モーダル閉じる）
- `DefectBeanCompare.tsx`: 生`<button>` × 1（閉じる）、生`<div>`モーダル
- `DefectBeanForm.tsx`: 生`<button>` × 1（閉じる）、生`<div>`モーダル
- `DefectBeanFormFields.tsx`: 生`<button>` × 2（カメラ撮影、画像クリア）
- `SortMenu.tsx`: 生`<button>` × 2（ソートトグル）
- `EmptyState.tsx`: 生`<button>` × 1（追加）
