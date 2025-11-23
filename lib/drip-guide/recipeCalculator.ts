import { DripRecipe, DripStep } from './types';

/**
 * 人前に応じてレシピを計算する
 * 重要: この関数は1人前基準のレシピを受け取り、指定された人前数に応じて計算します。
 * 例: 1人前基準のレシピ（蒸らし10g）を2人前にすると、蒸らし20gになります。
 * 
 * @param recipe 元のレシピ（1人前基準）
 * @param servings 人前数（1-4）
 * @returns 計算済みのレシピ
 */
export function calculateRecipeForServings(recipe: DripRecipe, servings: number): DripRecipe {
    // 人前が1の場合は元のレシピ（1人前基準）をそのまま返す
    if (servings === 1) {
        return recipe;
    }

    // 1人前基準のレシピに対して、人前倍率を適用
    const multiplier = servings;

    // 豆の量を計算（整数に丸める）
    const calculatedBeanAmountGram = Math.round(recipe.beanAmountGram * multiplier);

    // 総湯量を計算（整数に丸める）
    const calculatedTotalWaterGram = Math.round(recipe.totalWaterGram * multiplier);

    // 各ステップの目標湯量を計算
    const calculatedSteps: DripStep[] = recipe.steps.map((step) => ({
        ...step,
        targetTotalWater: step.targetTotalWater
            ? Math.round(step.targetTotalWater * multiplier)
            : undefined,
    }));

    return {
        ...recipe,
        beanAmountGram: calculatedBeanAmountGram,
        totalWaterGram: calculatedTotalWaterGram,
        steps: calculatedSteps,
    };
}

