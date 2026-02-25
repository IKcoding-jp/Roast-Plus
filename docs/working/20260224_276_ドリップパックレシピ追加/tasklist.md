# tasklist.md — #276 ドリップパックレシピ追加

## タスク概要

全3ファイル変更、新規ファイルなし。依存関係なし（並列実行可能）。

## フェーズ 1: 実装

### T1. mockData.ts にドリップパックレシピを追加

**ファイル**: `lib/drip-guide/mockData.ts`

- `MOCK_RECIPES` 配列の末尾に `recipe-drip-bag` エントリを追加
- 仕様: requirement.md の「ステップ定義」表を参照
- `isDefault: true`, `isManualMode: true`
- `description` に「7〜10g対応」「155ml」「手動モード」の説明を含める

**依存**: なし

---

### T2. RecipeList.tsx の表示順序を更新

**ファイル**: `components/drip-guide/RecipeList.tsx:79`

- `defaultOrder` 配列に `'recipe-drip-bag'` を末尾に追加
  ```ts
  const defaultOrder = ['recipe-001', 'recipe-003', 'recipe-046', 'recipe-hoffmann', 'recipe-drip-bag'];
  ```

**依存**: T1（IDが確定していること）

---

### T3. StartHintDialog.tsx に手動モード説明を追加

**ファイル**: `components/drip-guide/StartHintDialog.tsx`

- `StartHintDialogProps` インターフェースに `isManualMode?: boolean` を追加
- `isManualMode: true` の場合、既存の説明2件の下に「手順はタップで進みます」セクションを表示
- アイコン: `HandTap`（phosphor-react）または既存の `Timer` アイコンを流用
- `RecipeList.tsx` の `StartHintDialog` 呼び出し箇所に `isManualMode={recipe.isManualMode}` を渡す

**依存**: なし

---

## フェーズ 2: 検証

### T4. lint / build / test を実行

```bash
npm run lint && npm run build && npm run test:run
```

- lint エラー・warning ゼロを確認
- build 成功を確認
- 既存テストが全通過することを確認

**依存**: T1, T2, T3

---

## 完了条件

- [x] T1: mockData.ts にレシピ追加
- [x] T2: RecipeList.tsx の表示順更新
- [x] T3: StartHintDialog.tsx に手動モード説明追加
- [x] T4: lint / build / test パス

---

**ステータス**: ✅ 完了
**完了日**: 2026-02-26
