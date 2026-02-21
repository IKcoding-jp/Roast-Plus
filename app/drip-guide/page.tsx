'use client';

import React from 'react';
import Link from 'next/link';
import { RecipeList } from '@/components/drip-guide/RecipeList';
import { useRecipes } from '@/lib/drip-guide/useRecipes';
import { Plus } from 'phosphor-react';
import { FloatingNav } from '@/components/ui';

export default function DripGuidePage() {
    const { recipes, isLoaded, deleteRecipe } = useRecipes();

    if (!isLoaded) {
        return <div className="p-8 text-center text-ink-muted">Loading...</div>;
    }

    return (
        <div className="h-screen overflow-y-hidden flex flex-col px-3 sm:px-6 lg:px-8 pt-14 pb-2 sm:pb-3 lg:pb-4 bg-page transition-colors duration-1000">
            <FloatingNav
                backHref="/"
                right={
                    <Link
                        href="/drip-guide/new"
                        className="flex items-center gap-2 bg-btn-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-btn-primary-hover transition-colors shadow-sm min-h-[44px]"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">新規レシピ</span>
                    </Link>
                }
            />
            <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
                <main className="flex-1 min-h-0 overflow-y-auto pb-4">
                    <RecipeList recipes={recipes} onDelete={deleteRecipe} />
                </main>
            </div>
        </div>
    );
}
