'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DripGuideRunner } from '@/components/drip-guide/DripGuideRunner';
import { useRecipes } from '@/lib/drip-guide/useRecipes';
import Link from 'next/link';
import { ArrowLeft } from 'phosphor-react';

function RunRecipeContent() {
    const searchParams = useSearchParams();
    const recipeId = searchParams.get('id');
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

    return (
        <div className="min-h-screen bg-white">
            <div className="p-4">
                <Link href="/drip-guide" className="inline-flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowLeft size={20} className="mr-1" />
                    戻る
                </Link>
            </div>
            <DripGuideRunner recipe={recipe} />
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
