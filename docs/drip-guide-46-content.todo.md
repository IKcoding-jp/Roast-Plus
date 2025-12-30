# ドリップガイド: 4:6メソッド（粕谷）文言改善 TODO

参照:

- 要件: `docs/drip-guide-46-content-requirements.md`
- 既存仕様/導線: `docs/drip-guide-46.md`
- 既存実装TODO（機能側）: `docs/drip-guide-46.todo.md`

---

## ゴール（何を良くするか）

- **「タイマー通りにやらなきゃ…」の焦りを減らす**（= 失敗率を下げる）
- Start前と抽出中の両方で、PHILOCOFFEA由来の要点（特に **「ほとんど落ち切ってから次を注ぐ」**）を自然に提示する
- 文言を `recipe46.ts` から切り出して、**安全に差し替え/レビューできる状態**にする

## 非ゴール（今回やらない）

- 4:6の配分アルゴリズム変更（味/濃度ロジック、時間配列など）
- 既存レシピ（4:6以外）の文言/挙動変更
- i18n対応（ただし将来移行しやすい形にはしておく）

---

## 受け入れ条件（Definition of Done）

- [x] **開始前**: `Start46Dialog` に「落ち切り優先／時刻は目安」が明確に表示される（折りたたみ可）
- [x] **抽出中**: Runnerの **全ステップ** のヒント枠（`currentStep.note`）に「落ち切り優先（時刻は目安）」が表示される
- [x] 文言は `lib/drip-guide/recipe46Content.ts` に集約され、`recipe46.ts` の直書きが減っている
- [ ] 4:6レシピは引き続き **Firestoreに保存されない**（`AppData.dripRecipes` が増えない）
- [ ] 既存レシピの導線（StartHintDialog → Run）を壊していない

---

## TODO（実装順）

### 0) 現状確認（短時間でOK）

- [x] Runnerで `currentStep.description` / `currentStep.note` の表示箇所を再確認（UI/レイアウト崩れが起きないこと）
- [x] 4:6の `recipe46.ts` 内の直書き文言（description/note/title）を棚卸し（どれを集約するか線引き）

### 1) 文言定義の新規ファイル作成（集約）

- [x] `lib/drip-guide/recipe46Content.ts` を新規作成
  - [x] `RECIPE46_TITLE`
  - [x] `RECIPE46_DESCRIPTION`（開始前に読む長文。改行保持前提）
  - [x] `RECIPE46_COMMON_NOTE`（全ステップ共通の短文ヒント）
  - [x] `RECIPE46_STEP_TEXT`（蒸らし/味/濃度の説明テンプレ。`as const`）
- [x] **コピーの安全性**: 公式文の"コピペ"になっていないか最終チェック（言い換えを維持）

### 2) `lib/drip-guide/recipe46.ts` の差し替え

- [x] `recipe46Content.ts` を import し、`DripRecipe` の `name/description` を差し替え
- [x] 生成する全ステップに `note: RECIPE46_COMMON_NOTE` を付与（必要なら1投目のみ補足noteを上書き）
- [x] ステップの `description` を `RECIPE46_STEP_TEXT` 参照へ置換
- [x] 直書き文字列を削減し、文言修正が `recipe46Content.ts` だけで完結する状態に寄せる

### 3) `components/drip-guide/Start46Dialog.tsx` の開始前解説を追加

- [x] 味/濃度選択UIの近くに「4:6メソッドのポイント（必読）」ブロックを追加
  - [x] `<details>/<summary>` の折りたたみ（要件の"自然に出す"を満たすUI）
  - [x] `RECIPE46_DESCRIPTION` を表示（`<pre className="whitespace-pre-wrap">` 等で改行維持）
  - [x] **最重要**: 「落ち切り優先／時刻は目安」が一目で分かる

### 4) （任意/おすすめ）抽出中の"再確認"導線

- [x] `components/drip-guide/DripGuideRunner.tsx` に「ポイント」ボタン or インラインの短い補助を追加するか検討
  - [x] 最小実装は「全ステップnote」で十分。追加はUIの邪魔にならない場合のみ（スキップ：全ステップnoteで対応済み）

### 5) QA/テスト観点の整備

- [x] `docs/drip-guide-46-content-test-plan.md` を作成
- [x] `docs/drip-guide-46-content-copy.md` を作成（実装用コピードラフト）
- [ ] `docs/drip-guide-46-content-test-plan.md` の観点で手動確認
- [ ] リグレッション: 既存レシピのStart/Runが従来通り動くことを確認

### 6) 静的検査

- [x] `npm run lint`（今回触った範囲でエラーなし）
  - 新規作成した `recipe46Content.ts` と変更した `recipe46.ts` にはエラーなし
  - `Start46Dialog.tsx` の既存エラーは今回の変更とは無関係

---

## 変更対象ファイル（見込み）

- `lib/drip-guide/recipe46Content.ts`（新規）
- `lib/drip-guide/recipe46.ts`
- `components/drip-guide/Start46Dialog.tsx`
- （任意）`components/drip-guide/DripGuideRunner.tsx`
