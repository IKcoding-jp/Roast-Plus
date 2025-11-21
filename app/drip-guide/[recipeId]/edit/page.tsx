'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeForm } from '@/components/drip-guide/RecipeForm';
import { useRecipes } from '@/lib/drip-guide/useRecipes';
import { DripRecipe } from '@/lib/drip-guide/types';

export default function EditRecipePage({ params }: { params: Promise<{ recipeId: string }> }) {
    const { recipeId } = use(params);
    const router = useRouter();
    const { recipes, updateRecipe, isLoaded } = useRecipes();

    if (!isLoaded) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    const recipe = recipes.find((r) => r.id === recipeId);

    if (!recipe) {
        return <div className="p-8 text-center text-gray-500">レシピが見つかりません</div>;
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
