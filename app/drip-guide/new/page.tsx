'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RecipeForm } from '@/components/drip-guide/RecipeForm';
import { useRecipes } from '@/lib/drip-guide/useRecipes';
import { DripRecipe } from '@/lib/drip-guide/types';

export default function NewRecipePage() {
    const router = useRouter();
    const { addRecipe } = useRecipes();

    const handleSubmit = (recipe: DripRecipe) => {
        addRecipe(recipe);
        router.push('/drip-guide');
    };

    return (
        <div className="min-h-screen text-gray-900" style={{ backgroundColor: '#F7F7F5' }}>
            <div className="max-w-5xl mx-auto p-4 sm:p-6">
                <RecipeForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
