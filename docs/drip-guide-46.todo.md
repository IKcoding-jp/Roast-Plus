# ドリップガイド: 4:6メソッド（粕谷）実装TODO

参照: `docs/drip-guide-46.md`

## スコープ（MVP）

- `/drip-guide` 一覧に **「4:6メソッド（粕谷）」** をデフォルトカードとして表示（削除不可）
- 「ガイド開始」→ **4:6開始ダイアログ**（人前/味わい/濃度 + プレビュー）→ `/drip-guide/run` でRunner実行
- **4:6の生成レシピはFirestoreに保存しない**

## 非スコープ（今回やらない）

- 4:6レシピの編集UI（編集できる/できないの最終判断は後述タスクで決める）
- 4:6以外の既存ドリップレシピ仕様変更

## 前提/命名（実装時に固定する値）

- **レシピID**: `recipe-046`
- **表示名**: `4:6メソッド（粕谷）`
- **クエリ**（推奨）: `/drip-guide/run?id=recipe-046&servings=2&taste=basic&strength=strong3`
- **taste**: `basic | sweet | bright`
- **strength**: `light | strong2 | strong3`

---

## TODO（実装順）

### 0) 既存実装の確認（短時間でOK）

- [x] **現行の導線確認**: `/drip-guide` → StartHintDialog → `/drip-guide/run?id=...&servings=...` が成立していることを手元で確認
- [x] **Runner仕様確認**: `DripStep.targetTotalWater` が「累積目標」で表示されること、3秒前カウントダウン音が鳴ることを確認

### 1) 4:6生成ロジック（保存しない）

- [x] **型定義追加**: `taste/strength` のunion型（+ ラベル変換）を追加（置き場所は `lib/drip-guide` 配下で統一）
- [x] **4:6生成関数を実装**（入力: `servings(1-8), taste, strength` / 出力: `DripRecipe`）
  - [x] 1人前=豆10g/湯150g のスケール（`beanAmountGram=10*servings`, `totalWaterGram=150*servings`）
  - [x] `front=round(total*0.4)`, `back=total-front`
  - [x] frontを2投に配分（basic:1/2, sweet:5/12+7/12, bright:7/12+5/12）
  - [x] backを1/2/3投に配分（light/strong2/strong3）
  - [x] `startTimeSec` は固定配列から採用（3/4/5投）
  - [x] `targetTotalWater` は累積値で格納
  - [x] `totalDurationSec = lastStart + 45`
  - [x] `isManualMode:false`（または未指定でfalse扱い）
- [x] **検算**: 生成結果の合計が常に `totalWaterGram` に一致すること、最終累積が `totalWaterGram` になることをチェック（ログ or 目視OK）

### 2) 一覧に「4:6」カードを追加

- [x] **デフォルトレシピ追加**: `lib/drip-guide/mockData.ts` に `recipe-046` を追加
  - [x] `isDefault:true`（削除不可）
  - [x] 一覧カードで最低限の表示が崩れない `beanName/beanAmountGram/totalWaterGram/totalDurationSec/steps` を用意
  - [x] ⚠️ `steps` は「生成結果を保存しない」ため *固定値でOK*（実際のRunではクエリから再生成する）

### 3) 4:6開始ダイアログ（選択 + プレビュー）

- [x] **新規UI作成**: `components/drip-guide/Start46Dialog.tsx`（仮）
  - [x] 入力: 人前（1〜8）/ 味わい（basic/sweet/bright）/ 濃度（light/strong2/strong3）
  - [x] 表示: 豆量(g) / 総湯量(g)
  - [x] プレビュー: 各投の「開始時刻」「その投の注湯量(g)」「累積目標(g)」をテーブル表示
  - [x] 操作: 「ガイド開始」→ `/drip-guide/run` へ遷移（stepsはURLに詰めない）
  - [x] アクセシビリティ: `role="dialog"`, Escで閉じる、フォーカストラップ（可能なら）
- [x] **一覧からの起動**: `components/drip-guide/RecipeList.tsx`
  - [x] `recipe-046` の場合のみ Start46Dialog を開く
  - [x] 既存レシピは従来どおり StartHintDialog
  - [x] 人前の状態（`servingsMap`）を Start46Dialog と共有（ダイアログ内でも変更できるようにする）

### 4) /run（Runner）側で4:6を再生成

- [x] **Runページ拡張**: `app/drip-guide/run/page.tsx`
  - [x] `id===recipe-046` のとき: `servings/taste/strength` をクエリから取り、生成関数で `DripRecipe` を作ってRunnerへ渡す
  - [x] それ以外: 現状の `useRecipes` + `calculateRecipeForServings` を維持
  - [x] パラメータ不正時: エラー表示 + `/drip-guide` へ戻る導線

### 5) 任意: 前回の味/濃度をローカル保存

- [x] **localStorage保存**（任意）: `last46Taste/last46Strength` を保存し、Start46Dialogの初期値に使う
  - [x] Firestoreには保存しない
  - [x] SSRガード（`typeof window === 'undefined'`）を徹底

### 6) 受け入れ条件に沿った確認（手動）

- [ ] 一覧に「4:6メソッド（粕谷）」が表示され、削除できない
- [ ] 人前を変えると、豆量/総湯量が `10g/150g` 基準で変化する（プレビューで確認）
- [ ] 味×濃度で、各投g・累積gが一貫している（プレビューで確認）
- [ ] Runnerが時間に応じて自動で進む／3秒前音が鳴る／完了演出が出る
- [ ] 実行しても `AppData.dripRecipes` にレシピが増えない（Firestoreを確認）

### 7) 静的検査

- [x] `npm run lint` が通る（今回触ったファイルのみでもOK）

---

## 仕様のあいまい点（実装中に決める）

- [x] **4:6カードの編集ボタン**: 表示しない（推奨） or 押したら説明ページに飛ばす or 既存編集画面を開く（ただし保存しない）
  - ✅ 実装: `recipe-046` の場合は編集ボタンを非表示にした
- [x] **開始ダイアログに「既存のヒント（StartHintDialog）」も統合するか**: 4:6専用UIに含める/含めない
  - ✅ 実装: 4:6専用UIとして独立させた（プレビュー機能を含む）

