'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DripGuideRunner } from '@/components/drip-guide/DripGuideRunner';
import { useRecipes } from '@/lib/drip-guide/useRecipes';
import { calculateRecipeForServings } from '@/lib/drip-guide/recipeCalculator';
import Link from 'next/link';
import { ArrowLeft } from 'phosphor-react';

function RunRecipeContent() {
    const searchParams = useSearchParams();
    const recipeId = searchParams.get('id');
    const servingsParam = searchParams.get('servings');
    const { recipes, isLoaded } = useRecipes();

    if (!isLoaded) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    const recipe = recipes.find((r) => r.id === recipeId);

    if (!recipe) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">レシピが見つかりません</p>
                <Link href="/drip-guide" className="text-amber-600 hover:underline">
                    一覧に戻る
                </Link>
            </div>
        );
    }

    // 人前パラメータを取得（デフォルト: 1）
    const servings = servingsParam ? parseInt(servingsParam, 10) : 1;
    // 有効な人前範囲（1-4）に制限
    const validServings = servings >= 1 && servings <= 4 ? servings : 1;

    // 人前に応じてレシピを計算
    const calculatedRecipe = calculateRecipeForServings(recipe, validServings);

    return (
        <div className="min-h-screen bg-white">
            <DripGuideRunner recipe={calculatedRecipe} />
        </div>
    );
}

export default function RunRecipePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
            <RunRecipeContent />
        </Suspense>
    );
}
