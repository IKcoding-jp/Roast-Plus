'use client';

import React from 'react';
import { DripRecipe } from '@/lib/drip-guide/types';
import { RecipeSummary } from '../shared/RecipeSummary';
import { RecipeStepTable } from '../shared/RecipeStepTable';
import { RECIPE_HOFFMANN_STEP_DETAILS } from '@/lib/drip-guide/recipeHoffmannContent';

type StepDetailKey = keyof typeof RECIPE_HOFFMANN_STEP_DETAILS;

interface HoffmannPreviewProps {
    recipe: DripRecipe;
    onStepDetailClick: (detailKey: StepDetailKey) => void;
}

const stepToDetailKey = (stepTitle: string): StepDetailKey | null => {
    if (stepTitle.includes('蒸らし')) return 'bloom';
    if (stepTitle.includes('第1注湯')) return 'pour1';
    if (stepTitle.includes('第2注湯')) return 'pour2';
    if (stepTitle.includes('かき混ぜ')) return 'stir';
    if (stepTitle.includes('落ち切り')) return 'drawdown';
    return null;
};

export const HoffmannPreview: React.FC<HoffmannPreviewProps> = ({ recipe, onStepDetailClick }) => {
    const handleStepClick = (_stepId: string, stepTitle: string) => {
        const detailKey = stepToDetailKey(stepTitle);
        if (detailKey) {
            onStepDetailClick(detailKey);
        }
    };

    return (
        <div className="px-5 pt-0 pb-4">
            <div className="pt-4 border-t border-edge">
                <RecipeSummary
                    beanAmountGram={recipe.beanAmountGram}
                    totalWaterGram={recipe.totalWaterGram}
                    totalDurationSec={recipe.totalDurationSec}
                />

                <div className="mt-4">
                    <RecipeStepTable steps={recipe.steps} onStepDetailClick={handleStepClick} />
                </div>
            </div>
        </div>
    );
};
