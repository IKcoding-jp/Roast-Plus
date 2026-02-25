# design.md — #276 ドリップパックレシピ追加

## アーキテクチャ判断

### アプローチ: mockData.ts への直接追加

4:6メソッドのような動的生成や Hoffmann のような Content ファイル分離は**採用しない**。

理由:
- ドリップパックは固定パラメータ（粉量・湯量を実行時に変えない）
- ステップ文言がシンプルで分離のメリットが薄い
- `recipe-001`（BYSN Standard）と同じパターンで既に成立実績あり
- YAGNI: 将来の10g/12g対応は「別エントリを追加するだけ」で対応可能

### isManualMode: true の採用理由

ドリップパックは「表面が沈んできたら注ぐ」という視覚サインに依存するため、タイマー自動進行より手動モードが適切。既存の BYSN Standard Drip と同じ判断。

---

## 変更詳細

### 1. `lib/drip-guide/mockData.ts`

```typescript
// MOCK_RECIPES 配列末尾に追加
{
    id: 'recipe-drip-bag',
    name: 'ドリップパック（7〜10g）',
    beanName: 'BYSNドリップパック',
    beanAmountGram: 7,
    totalWaterGram: 155,
    totalDurationSec: 150,
    purpose: '市販ドリップパック用。3投で丁寧に、雑味なくクリアに抽出',
    description: 'ドリップパック（7〜10g）向けレシピ。仕上がり140ml、総湯量155ml。...',
    createdAt: '2026-02-24T00:00:00Z',
    updatedAt: '2026-02-24T00:00:00Z',
    isDefault: true,
    isManualMode: true,
    steps: [/* 6ステップ */],
}
```

### 2. `components/drip-guide/RecipeList.tsx`

```typescript
// 変更前（line 79）
const defaultOrder = ['recipe-001', 'recipe-003', 'recipe-046', 'recipe-hoffmann'];

// 変更後
const defaultOrder = ['recipe-001', 'recipe-003', 'recipe-046', 'recipe-hoffmann', 'recipe-drip-bag'];
```

`StartHintDialog` への `isManualMode` 渡し（line 234〜242 付近）:

```tsx
// 変更前
<StartHintDialog
    isOpen={startTargetId !== null}
    onClose={handleCloseStart}
    onStart={handleStartGuide}
    totalWaterGram={startTargetCalculated?.totalWaterGram}
    servings={startTargetRecipe ? getServingsForRecipe(startTargetRecipe.id) : undefined}
    recipeName={startTargetRecipe?.name}
/>

// 変更後（isManualMode を追加）
<StartHintDialog
    isOpen={startTargetId !== null}
    onClose={handleCloseStart}
    onStart={handleStartGuide}
    totalWaterGram={startTargetCalculated?.totalWaterGram}
    servings={startTargetRecipe ? getServingsForRecipe(startTargetRecipe.id) : undefined}
    recipeName={startTargetRecipe?.name}
    isManualMode={startTargetRecipe?.isManualMode}
/>
```

### 3. `components/drip-guide/StartHintDialog.tsx`

```typescript
// Props に isManualMode 追加
interface StartHintDialogProps {
    // ...既存props...
    isManualMode?: boolean;  // 追加
}

// isManualMode: true の場合のみ手動説明セクションを表示（JSX 内）
{isManualMode && (
    <div className="flex gap-3">
        {/* HandTap アイコンまたは既存アイコン流用 */}
        <div className="flex-1">
            <p className="font-semibold text-ink">手順はタップで進みます</p>
            <p className="text-ink-sub">
                各手順は画面下の「次へ」ボタンをタップして手動で進めます。
                タイマーは経過時間の目安として動きます。
            </p>
        </div>
    </div>
)}
```

---

## 影響範囲

| コンポーネント | 影響 | 内容 |
|--------------|:----:|------|
| `useRecipes.ts` | なし | mockData から自動的に読み込まれる |
| `run/page.tsx` | なし | 既存の「recipe-046以外」分岐で処理される |
| `recipeCalculator.ts` | なし | 既存のスケーリングロジックがそのまま動く |
| BYSN Standard / 井崎流 | 軽微 | StartHintDialog に手動モード説明が追加される（意図的改善） |

---

## 採用しなかったアプローチ

| アプローチ | 不採用理由 |
|-----------|-----------|
| Content ファイル分離 | 文言がシンプルで分離のメリットなし |
| 動的生成関数 | パック重量でお湯量を変えない方針のため不要 |
| カテゴリ/タグ追加 | 既存型に存在しないフィールド。YAGNI |
