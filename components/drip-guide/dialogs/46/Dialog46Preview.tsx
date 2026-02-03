'use client';

import React from 'react';
import { DripRecipe } from '@/lib/drip-guide/types';
import { RecipeSummary } from '../shared/RecipeSummary';
import { RecipeStepTable } from '../shared/RecipeStepTable';

interface Dialog46PreviewProps {
    recipe: DripRecipe;
}

export const Dialog46Preview: React.FC<Dialog46PreviewProps> = ({ recipe }) => {
    return (
        <div className="px-5 pt-0 pb-4">
            <div className="pt-4 border-t border-gray-200">
                <RecipeSummary
                    beanAmountGram={recipe.beanAmountGram}
                    totalWaterGram={recipe.totalWaterGram}
                    totalDurationSec={recipe.totalDurationSec}
                />

                <div className="mt-4">
                    <RecipeStepTable steps={recipe.steps} showPourAmount={true} />
                </div>
            </div>
        </div>
    );
};
