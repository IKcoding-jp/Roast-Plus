# testing.md — #276 ドリップパックレシピ追加

## テスト方針

今回の変更はデータ追加とUIの軽微な修正が中心。新規ロジックなし。

**単体テスト対象**:
- `mockData.ts` の新レシピデータの整合性（手動確認 + `recipeCalculator` テスト流用）
- `StartHintDialog` の `isManualMode` prop 分岐（既存テストに追加）

**既存テストへの影響**:
- `recipeCalculator.test.ts` — `recipe-drip-bag` は固定レシピなのでテスト不要
- `recipe46.test.ts` — 影響なし

---

## テストケース

### 1. recipeCalculator.test.ts（既存）

```typescript
// ドリップパックレシピのスケーリング確認
import { MOCK_RECIPES } from '../mockData';

it('ドリップパックレシピが存在すること', () => {
    const recipe = MOCK_RECIPES.find(r => r.id === 'recipe-drip-bag');
    expect(recipe).toBeDefined();
    expect(recipe?.isManualMode).toBe(true);
    expect(recipe?.isDefault).toBe(true);
    expect(recipe?.totalWaterGram).toBe(155);
    expect(recipe?.steps).toHaveLength(6);
});

it('ドリップパックレシピを2人前でスケールできること', () => {
    const recipe = MOCK_RECIPES.find(r => r.id === 'recipe-drip-bag')!;
    const scaled = calculateRecipeForServings(recipe, 2);
    expect(scaled.beanAmountGram).toBe(14);
    expect(scaled.totalWaterGram).toBe(310);
});
```

---

## カバレッジ目標

| 対象 | 目標 |
|------|------|
| 全体 | 既存 76%+ を維持 |
| lib/ | 既存 89%+ を維持 |

新規ロジックがないため、カバレッジ低下は発生しない見込み。

---

## 手動確認チェックリスト

- [ ] レシピ一覧にドリップパックが表示される（5番目）
- [ ] 「ガイド開始」タップで StartHintDialog が開く
- [ ] StartHintDialog に「手順はタップで進みます」が表示される
- [ ] ガイド開始後、6ステップが順番に表示される
- [ ] 「次へ」ボタンで手動進行できる
- [ ] step-2,3,4 で targetTotalWater（30, 93, 155g）が表示される
- [ ] step-5（引き上げ）でガイド完了が押せる
- [ ] BYSN Standard にも手動モード説明が表示される（既存レシピへの影響確認）
