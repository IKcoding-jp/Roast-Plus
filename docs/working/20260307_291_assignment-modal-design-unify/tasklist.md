# タスクリスト: 担当表モーダルデザイン統一

## Issue
#291

## タスク

### Phase 1: TableModals.tsx の修正

- [x] 1-1. コンテキストメニュー: 「メンバーを変更・追加」ボタンに `!text-ink` 追加
- [x] 1-2. コンテキストメニュー: 「除外ラベル設定」ボタンに `!text-ink` 追加
- [x] 1-3. チーム編集モーダル: キャンセルを `variant="ghost"` → `variant="secondary"` に変更
- [x] 1-4. 幅設定モーダル: キャンセルを `variant="ghost"` → `variant="secondary"` に変更
- [x] 1-5. 高さ設定モーダル: キャンセルは `secondary` のまま（変更不要）

### Phase 2: ManagerDialog.tsx の修正

- [x] 2-1. ヘッダー構造をコンテキストメニュー型に変更
  - `bg-ground border-b border-edge` ヘッダー追加
  - 閉じるボタンを `IconButton variant="ghost"` + `MdClose` に変更
- [x] 2-2. `rounded-lg` → `rounded-xl` に変更
- [x] 2-3. キャンセル/閉じるボタンの追加（現状なし → `variant="secondary"` で追加検討）

### Phase 3: PairExclusionSettingsModal.tsx の修正

- [x] 3-1. ヘッダー構造統一
  - ヘッダーに `bg-ground border-b border-edge` 背景追加
  - 閉じるボタンを `IconButton` に変更
- [x] 3-2. `rounded-lg` → `rounded-xl` に変更
- [x] 3-3. オーバーレイを `bg-black/30` → `bg-black/40` に統一

### Phase 4: MemberSettingsDialog.tsx の修正

- [x] 4-1. ヘッダーの `bg-primary text-white` → `bg-ground text-ink border-b border-edge` に変更
- [x] 4-2. 閉じるボタンを `Button variant="ghost" ×` → `IconButton variant="ghost"` + `MdClose` に変更
- [x] 4-3. フッター「閉じる」ボタンを `variant="secondary"` で統一
- [x] 4-4. オーバーレイの統一確認

### Phase 5: 検証

- [x] 5-1. `npm run lint` 通過
- [x] 5-2. `npm run build` 通過
- [x] 5-3. `npm run test:run` 通過

## 依存関係
なし（各ファイルは独立して修正可能）

## ステータス
**ステータス**: ✅ 完了
**完了日**: 2026-03-07

## 見積もり
小〜中規模（スタイル変更のみ、約15-20分）
