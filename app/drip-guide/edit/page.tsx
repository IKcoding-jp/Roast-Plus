'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RecipeForm } from '@/components/drip-guide/RecipeForm';
import { useRecipes } from '@/lib/drip-guide/useRecipes';
import { DripRecipe } from '@/lib/drip-guide/types';

function EditRecipeContent() {
    const searchParams = useSearchParams();
    const recipeId = searchParams.get('id');
    const router = useRouter();
    const { recipes, updateRecipe, isLoaded } = useRecipes();

    if (!isLoaded) {
        return <div className="p-8 text-center text-ink-muted">Loading...</div>;
    }

    const recipe = recipes.find((r) => r.id === recipeId);

    if (!recipe) {
        return <div className="p-8 text-center text-ink-muted">レシピが見つかりません</div>;
    }

    const handleSubmit = (updatedRecipe: DripRecipe) => {
        updateRecipe(updatedRecipe);
        router.push('/drip-guide');
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
            <RecipeForm initialRecipe={recipe} onSubmit={handleSubmit} />
        </div>
    );
}

export default function EditRecipePage() {
    return (
        <div className="min-h-screen text-ink bg-page transition-colors duration-1000">
            <Suspense fallback={<div className="p-8 text-center text-ink-muted">Loading...</div>}>
                <EditRecipeContent />
            </Suspense>
        </div>
    );
}
