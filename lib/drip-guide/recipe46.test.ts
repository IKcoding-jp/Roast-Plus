import { describe, it, expect } from 'vitest';
import { generateRecipe46, type Taste46, type Strength46 } from './recipe46';

describe('generateRecipe46', () => {
  describe('基本構造', () => {
    it('1人前の豆量と湯量', () => {
      const recipe = generateRecipe46(1, 'basic', 'light');
      expect(recipe.beanAmountGram).toBe(10);
      expect(recipe.totalWaterGram).toBe(150);
    });

    it('2人前の豆量と湯量', () => {
      const recipe = generateRecipe46(2, 'basic', 'light');
      expect(recipe.beanAmountGram).toBe(20);
      expect(recipe.totalWaterGram).toBe(300);
    });

    it('3人前の豆量と湯量', () => {
      const recipe = generateRecipe46(3, 'basic', 'light');
      expect(recipe.beanAmountGram).toBe(30);
      expect(recipe.totalWaterGram).toBe(450);
    });

    it('レシピID・名前・デフォルトフラグ', () => {
      const recipe = generateRecipe46(1, 'basic', 'light');
      expect(recipe.id).toBe('recipe-046');
      expect(recipe.isDefault).toBe(true);
      expect(recipe.isManualMode).toBe(false);
    });
  });

  describe('湯量バランス（40:60）', () => {
    const tastes: Taste46[] = ['basic', 'sweet', 'bright'];
    const strengths: Strength46[] = ['light', 'strong2', 'strong3'];

    for (const taste of tastes) {
      for (const strength of strengths) {
        it(`${taste} × ${strength}: 総湯量 = beanAmount * 15`, () => {
          const recipe = generateRecipe46(2, taste, strength);
          expect(recipe.totalWaterGram).toBe(recipe.beanAmountGram * 15);
        });

        it(`${taste} × ${strength}: ステップ合計が総湯量に一致`, () => {
          const recipe = generateRecipe46(2, taste, strength);
          const lastStep = recipe.steps[recipe.steps.length - 1];
          expect(lastStep.targetTotalWater).toBe(recipe.totalWaterGram);
        });

        it(`${taste} × ${strength}: 味調整40% / 濃度調整60%`, () => {
          const recipe = generateRecipe46(2, taste, strength);
          const totalWater = recipe.totalWaterGram;
          const front = Math.round(totalWater * 0.4);
          const back = totalWater - front;

          // 2投目（味調整最後）のtargetTotalWaterが40%
          expect(recipe.steps[1].targetTotalWater).toBe(front);

          // 濃度調整パートの合計が60%
          // 最後のステップのtargetTotalWater - 2投目のtargetTotalWater = back
          const lastStepWater = recipe.steps[recipe.steps.length - 1].targetTotalWater!;
          expect(lastStepWater - front).toBe(back);
        });
      }
    }
  });

  describe('ステップ数', () => {
    it('light: 3ステップ（味2 + 濃度1）', () => {
      const recipe = generateRecipe46(1, 'basic', 'light');
      expect(recipe.steps).toHaveLength(3);
    });

    it('strong2: 4ステップ（味2 + 濃度2）', () => {
      const recipe = generateRecipe46(1, 'basic', 'strong2');
      expect(recipe.steps).toHaveLength(4);
    });

    it('strong3: 5ステップ（味2 + 濃度3）', () => {
      const recipe = generateRecipe46(1, 'basic', 'strong3');
      expect(recipe.steps).toHaveLength(5);
    });
  });

  describe('味調整パートの配分', () => {
    it('basic: 均等配分', () => {
      const recipe = generateRecipe46(2, 'basic', 'light');
      const step1Water = recipe.steps[0].targetTotalWater!;
      const step2Water = recipe.steps[1].targetTotalWater! - step1Water;
      // 120 * 0.4 = 120 → front / 2 = 60 each
      expect(Math.abs(step1Water - step2Water)).toBeLessThanOrEqual(1);
    });

    it('sweet: 1投目が少なめ（5/12）', () => {
      const recipe = generateRecipe46(2, 'sweet', 'light');
      const step1Water = recipe.steps[0].targetTotalWater!;
      const step2Water = recipe.steps[1].targetTotalWater! - step1Water;
      expect(step1Water).toBeLessThan(step2Water);
    });

    it('bright: 1投目が多め（7/12）', () => {
      const recipe = generateRecipe46(2, 'bright', 'light');
      const step1Water = recipe.steps[0].targetTotalWater!;
      const step2Water = recipe.steps[1].targetTotalWater! - step1Water;
      expect(step1Water).toBeGreaterThan(step2Water);
    });
  });

  describe('開始時刻', () => {
    it('3ステップ: [0, 45, 90]', () => {
      const recipe = generateRecipe46(1, 'basic', 'light');
      expect(recipe.steps[0].startTimeSec).toBe(0);
      expect(recipe.steps[1].startTimeSec).toBe(45);
      expect(recipe.steps[2].startTimeSec).toBe(90);
    });

    it('4ステップ: [0, 45, 90, 135]', () => {
      const recipe = generateRecipe46(1, 'basic', 'strong2');
      expect(recipe.steps[0].startTimeSec).toBe(0);
      expect(recipe.steps[1].startTimeSec).toBe(45);
      expect(recipe.steps[2].startTimeSec).toBe(90);
      expect(recipe.steps[3].startTimeSec).toBe(135);
    });

    it('5ステップ: [0, 45, 90, 135, 165]', () => {
      const recipe = generateRecipe46(1, 'basic', 'strong3');
      expect(recipe.steps[0].startTimeSec).toBe(0);
      expect(recipe.steps[1].startTimeSec).toBe(45);
      expect(recipe.steps[2].startTimeSec).toBe(90);
      expect(recipe.steps[3].startTimeSec).toBe(135);
      expect(recipe.steps[4].startTimeSec).toBe(165);
    });
  });

  describe('総時間', () => {
    it('3ステップ: 90 + 45 = 135秒', () => {
      const recipe = generateRecipe46(1, 'basic', 'light');
      expect(recipe.totalDurationSec).toBe(135);
    });

    it('4ステップ: 135 + 45 = 180秒', () => {
      const recipe = generateRecipe46(1, 'basic', 'strong2');
      expect(recipe.totalDurationSec).toBe(180);
    });

    it('5ステップ: 165 + 45 = 210秒', () => {
      const recipe = generateRecipe46(1, 'basic', 'strong3');
      expect(recipe.totalDurationSec).toBe(210);
    });
  });
});
