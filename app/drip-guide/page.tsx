'use client';

import React from 'react';
import Link from 'next/link';
import { RecipeList } from '@/components/drip-guide/RecipeList';
import { useRecipes } from '@/lib/drip-guide/useRecipes';
import { Plus } from 'phosphor-react';
import { BackLink } from '@/components/ui';

export default function DripGuidePage() {
    const { recipes, isLoaded, deleteRecipe } = useRecipes();

    if (!isLoaded) {
        return <div className="p-8 text-center text-ink-muted">Loading...</div>;
    }

    return (
        <div className="h-screen overflow-y-hidden flex flex-col px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 lg:pt-8 pb-2 sm:pb-3 lg:pb-4 bg-page transition-colors duration-1000">
            <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
                <header className="mb-4 sm:mb-6 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <BackLink href="/" variant="icon-only" aria-label="戻る" />
                            <div>
                                <h1 className="text-2xl font-bold text-ink">ドリップガイド</h1>
                                <p className="text-ink-sub text-sm mt-1 hidden sm:block">
                                    レシピを選んで、一貫性のあるドリップを。
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/drip-guide/new"
                            className="flex items-center gap-2 bg-btn-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-btn-primary-hover transition-colors shadow-sm min-h-[44px]"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">新規レシピ</span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 min-h-0 overflow-y-auto pb-20 sm:pb-0">
                    <RecipeList recipes={recipes} onDelete={deleteRecipe} />
                </main>
            </div>
        </div>
    );
}
