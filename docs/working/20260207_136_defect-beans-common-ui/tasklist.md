# タスクリスト: コーヒー豆図鑑ページの共通UI化とテーマ対応

## ステータス: ✅ 完了
**開始日**: 2026-02-07
**完了日**: 2026-02-07

---

## Phase 1: ページレベルの共通UI化

### 1.1 page.tsx のボタン・リンク置換
- [ ] 戻るリンク → `<BackLink>` に置換
- [ ] 比較モード切替ボタン → `<Button>` に置換
- [ ] 比較表示ボタン → `<Button>` に置換
- [ ] 追加ボタン → `<Button>` に置換
- [ ] `useChristmasMode` を導入し props を伝播

### 1.2 EmptyState の共通UI化
- [ ] 追加ボタン → `<Button>` に置換
- [ ] `isChristmasMode` prop を追加

## Phase 2: カード・詳細コンポーネントの共通UI化

### 2.1 DefectBeanCard のボタン置換
- [ ] 省く/省かないボタン → `<Button>` に置換
- [ ] 画像モーダル閉じるボタン → `<IconButton>` に置換
- [ ] `isChristmasMode` prop を追加

## Phase 3: モーダルの共通UI化

### 3.1 DefectBeanForm のモーダル置換
- [ ] 外側モーダルラッパー → `<Modal>` に置換
- [ ] 閉じるボタン削除（Modal内蔵）
- [ ] `isChristmasMode` prop を追加

### 3.2 DefectBeanFormFields のボタン置換
- [ ] カメラ撮影ボタン → `<Button>` に置換
- [ ] 画像クリアボタン → `<IconButton>` に置換
- [ ] `isChristmasMode` の伝播

### 3.3 DefectBeanCompare のモーダル置換
- [ ] 外側モーダルラッパー → `<Modal>` に置換
- [ ] 閉じるボタン削除（Modal内蔵）
- [ ] `isChristmasMode` prop を追加

## Phase 4: ソートメニューの共通UI化

### 4.1 SortMenu のボタン置換
- [ ] ソートトグルボタン → `<Button>` に置換
- [ ] `isChristmasMode` prop を追加

## Phase 5: クリスマスモード対応

### 5.1 SearchFilterSection への伝播
- [ ] `isChristmasMode` prop を追加し共通UIに渡す

## Phase 6: 検証

### 6.1 品質確認
- [ ] `npm run lint` 通過
- [ ] `npm run build` 通過
- [ ] `npm run test` 通過
- [ ] 既存機能の動作確認

---

## 見積もり
- 合計: 約20分（AIエージェント実行）
- 主な作業: 7ファイルの修正
