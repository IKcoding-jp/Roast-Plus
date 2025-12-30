# drip-guide-46 実装メモ（開発者向け）

参照: `docs/drip-guide-46.md`

## 目的（何を作るか）

- `/drip-guide` に **「4:6メソッド（粕谷）」** のデフォルトカードを追加
- 「ガイド開始」→ **4:6開始ダイアログ**で条件（人前/味/濃度）を選択し、プレビューを見てからRunnerを起動
- `/drip-guide/run` 側は **URLクエリから4:6レシピを都度生成**し、Runnerに渡す（stepsをURLに詰めない / Firestoreに保存しない）

## 固定値（本実装で採用する前提）

- `recipeId = "recipe-046"`
- `name = "4:6メソッド（粕谷）"`
- `servings: 1..8`
- `taste: "basic" | "sweet" | "bright"`
- `strength: "light" | "strong2" | "strong3"`

## 既存コードへの差し込みポイント（目安）

- 一覧:
  - `app/drip-guide/page.tsx` は `RecipeList` に recipes を渡すだけ（変更は最小）
  - `components/drip-guide/RecipeList.tsx` で「ガイド開始」の挙動を **recipe-046だけ差し替え**（Start46Dialog）
- デフォルトカード:
  - `lib/drip-guide/mockData.ts` に `recipe-046` を追加（`isDefault:true`）
- 実行:
  - `app/drip-guide/run/page.tsx` で `id===recipe-046` のとき、**useRecipesを経由せず生成してRunnerへ**
  - Runnerは `components/drip-guide/DripGuideRunner.tsx` を流用（自動モード / 3秒前音 / 完了演出）
- ローカル保存（任意）:
  - `lib/localStorage.ts` に `last46Taste/last46Strength` getter/setter を追加、Start46Dialogの初期値に使う

---

## 4:6生成の仕様（コードに落とす用）

### スケーリング

- 1人前: 豆10g / 湯150g
- `beanAmountGram = 10 * servings`
- `totalWaterGram = 150 * servings`

### 40/60の分割

- `front = round(totalWaterGram * 0.4)`（味調整）
- `back = totalWaterGram - front`（濃度調整、差分で誤差吸収）

※今回のスケールだと `totalWaterGram=150*servings` のため
`front=60*servings`, `back=90*servings` になり **すべて整数で割り切れる**（端数処理の事故が起きにくい）。

### 味（frontを2投に配分）

- basic: `front/2`, `front/2`
- sweet: `front*(5/12)`, `front*(7/12)`
- bright: `front*(7/12)`, `front*(5/12)`

### 濃度（backを1/2/3投に配分）

- light: `back`
- strong2: `back/2`, `back/2`
- strong3: `back/3`, `back/3`, `back/3`

### ステップ数と開始時刻

- 総投数: `2 + strengthCount`（=3/4/5投）
- `startTimeSec` は固定配列の先頭N個を採用
  - 5投: `[0, 45, 90, 135, 165]`
  - 4投: `[0, 45, 90, 135]`
  - 3投: `[0, 45, 90]`
- `totalDurationSec = lastStart + 45`

### `DripStep.targetTotalWater`

- Runner表示仕様に合わせ **累積値**で格納する
- 各投の注湯量（差分）はUIプレビュー側で `currentTarget - prevTarget` で算出できる

### ステップ文言（最低限）

- 1投目: `蒸らし（味：40%）`
- 2投目: `2投目（味：40%）`
- 3投目以降: `濃度調整（60%）`（必要なら `1/2` などの補助表記を付与）

---

## 期待値サンプル（手計算で検証しやすい用）

### servings=1（豆10g / 湯150g）

- `front=60`, `back=90`
- taste=sweet, strength=strong3 の各投（g）/累積（g）
  - 0:00  25 /  25
  - 0:45  35 /  60
  - 1:30  30 /  90
  - 2:15  30 / 120
  - 2:45  30 / 150

### servings=2（豆20g / 湯300g）

- `front=120`, `back=180`
- taste=bright, strength=light の各投（g）/累積（g）
  - 0:00  70 /  70
  - 0:45  50 / 120
  - 1:30 180 / 300

---

## 実装時の注意（落とし穴）

- **stepsをURLに詰めない**（要件の推奨どおり）
- `Run` 側は `id===recipe-046` なら **recipes検索に依存しない**（ロード待ちやFirestore未同期でも起動できる）
- 一覧カード表示用の `mockData` は **“見た目のための最低限”** でよい（実際のRunは必ず再生成）
- 4:6は保存しないため、編集画面に入れると「保存」導線が紛らわしい
  - 推奨: `recipe-046` は編集ボタンを非表示（または押下で説明ページへ）

