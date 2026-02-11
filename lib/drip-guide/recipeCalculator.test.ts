import { describe, it, expect } from 'vitest';
import { calculateRecipeForServings } from './recipeCalculator';
import type { DripRecipe } from './types';

const baseRecipe: DripRecipe = {
  id: 'recipe-1',
  name: 'テストレシピ',
  beanName: 'エチオピア',
  beanAmountGram: 15,
  totalWaterGram: 250,
  totalDurationSec: 180,
  steps: [
    { id: 'step-1', startTimeSec: 0, title: '蒸らし', description: '蒸らし30秒', targetTotalWater: 30 },
    { id: 'step-2', startTimeSec: 30, title: '1投目', description: '1投目', targetTotalWater: 120 },
    { id: 'step-3', startTimeSec: 90, title: '2投目', description: '2投目', targetTotalWater: 250 },
  ],
};

describe('calculateRecipeForServings', () => {
  it('1人前 → 元のレシピそのまま', () => {
    const result = calculateRecipeForServings(baseRecipe, 1);
    expect(result).toBe(baseRecipe); // 同一オブジェクト参照
  });

  it('2人前 → 豆・湯量2倍', () => {
    const result = calculateRecipeForServings(baseRecipe, 2);
    expect(result.beanAmountGram).toBe(30);
    expect(result.totalWaterGram).toBe(500);
  });

  it('2人前 → 各ステップの目標湯量2倍', () => {
    const result = calculateRecipeForServings(baseRecipe, 2);
    expect(result.steps[0].targetTotalWater).toBe(60);
    expect(result.steps[1].targetTotalWater).toBe(240);
    expect(result.steps[2].targetTotalWater).toBe(500);
  });

  it('3人前', () => {
    const result = calculateRecipeForServings(baseRecipe, 3);
    expect(result.beanAmountGram).toBe(45);
    expect(result.totalWaterGram).toBe(750);
    expect(result.steps[0].targetTotalWater).toBe(90);
  });

  it('targetTotalWaterがundefinedのステップ → undefinedのまま', () => {
    const recipeWithUndefined: DripRecipe = {
      ...baseRecipe,
      steps: [
        { id: 'step-1', startTimeSec: 0, title: '蒸らし', description: '蒸らし' },
      ],
    };
    const result = calculateRecipeForServings(recipeWithUndefined, 2);
    expect(result.steps[0].targetTotalWater).toBeUndefined();
  });

  it('元のレシピは変更されない', () => {
    calculateRecipeForServings(baseRecipe, 2);
    expect(baseRecipe.beanAmountGram).toBe(15);
    expect(baseRecipe.totalWaterGram).toBe(250);
    expect(baseRecipe.steps[0].targetTotalWater).toBe(30);
  });
});
