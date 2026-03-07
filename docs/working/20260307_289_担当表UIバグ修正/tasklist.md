# tasklist.md — #289 担当表UIの微調整

## ブランチ

```
git checkout -b style/#289-assignment-ui-fix
```

## タスク

### Phase 1: Bug 3 修正（削除ボタンの赤色）

**対象**: `app/assignment/components/assignment-table/TableModals.tsx`

- [ ] L567付近: 高さ設定モーダルの削除ボタンから `!bg-ground hover:!bg-red-50` を削除
  ```tsx
  // Before
  className="flex-1 !flex !items-center !justify-center !gap-1 !bg-ground hover:!bg-red-50"
  // After
  className="flex-1 !flex !items-center !justify-center !gap-1"
  ```
- [ ] L438付近: チーム編集モーダルの削除ボタンから `!bg-ground hover:!bg-red-50` を削除
  ```tsx
  // Before
  className="!flex !items-center !justify-center !gap-2 !bg-ground hover:!bg-red-50"
  // After
  className="!flex !items-center !justify-center !gap-2"
  ```

### Phase 2: Bug 2 修正（キャンセル2行折り返し）

**対象**: `app/assignment/components/assignment-table/TableModals.tsx` (高さ設定モーダル L516-592)

- [ ] 3ボタン行のレイアウトを変更
  - 削除ボタンを独立した行に移動（上部）
  - 下段: キャンセル + 保存の2ボタン（幅が確保されて折り返しなし）
  ```tsx
  {/* 削除（独立行） */}
  <Button variant="danger" size="sm" fullWidth className="!flex !items-center !justify-center !gap-1" ...>
    <MdDelete size={18} />削除
  </Button>
  {/* キャンセル + 保存 */}
  <div className="flex gap-2">
    <Button variant="ghost" size="sm" className="flex-1" ...>キャンセル</Button>
    <Button variant="primary" size="sm" className="flex-1" ...>保存</Button>
  </div>
  ```

### Phase 3: Bug 1 修正（左右ラベル幅差）

**対象**: `app/assignment/components/assignment-table/DesktopTableView.tsx`

- [ ] 左ラベルセル (L266): 右ラベルセルと同じパディング設定に揃える
  - 左: `p-3 md:p-4 py-2 border-r` → borderを考慮してpaddingを統一
  - または左の `border-r` を維持しつつ右にも同等のスタイルを追加
- [ ] 新規追加行の左input (L350-358): 右inputとの幅の視覚差を確認・調整

### Phase 4: 検証

- [ ] `npm run lint` — エラー0
- [ ] `npm run build` — エラー0
- [ ] ブラウザで担当表を開き、3バグが修正されていることを目視確認
  - 高さ設定モーダルを開いて削除ボタンが赤いか確認
  - 高さ設定モーダルでキャンセルが1行か確認
  - 同じpx幅を設定して左右が揃っているか確認

### Phase 5: PR作成

- [ ] コミット・PR作成
  ```
  git add app/assignment/components/assignment-table/TableModals.tsx
  git add app/assignment/components/assignment-table/DesktopTableView.tsx
  git commit -m "style(#289): 担当表UIバグ修正（削除ボタン赤色・キャンセル折り返し・幅差）"
  gh pr create --title "style(#289): 担当表UIの微調整" --body-file ...
  ```
