'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DripRecipe } from '@/lib/drip-guide/types';
import { Timer, Coffee, Drop, Trash, Pencil, Play, CaretDown } from 'phosphor-react';
import { clsx } from 'clsx';
import { ConfirmDialog } from './ConfirmDialog';
import { StartHintDialog } from './StartHintDialog';
import { calculateRecipeForServings } from '@/lib/drip-guide/recipeCalculator';

interface RecipeListProps {
    recipes: DripRecipe[];
    onDelete: (id: string) => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, onDelete }) => {
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    // 各レシピごとの人前選択状態を管理（レシピID -> 人前数）
    const [servingsMap, setServingsMap] = useState<Record<string, number>>({});
    const [startTargetId, setStartTargetId] = useState<string | null>(null);
    const router = useRouter();

    const handleDeleteClick = (recipeId: string) => {
        console.log('Delete button clicked for recipe:', recipeId);
        setDeleteTargetId(recipeId);
    };

    const handleConfirmDelete = () => {
        if (deleteTargetId) {
            console.log('Deleting recipe:', deleteTargetId);
            onDelete(deleteTargetId);
            setDeleteTargetId(null);
        }
    };

    const handleCancelDelete = () => {
        console.log('Delete cancelled');
        setDeleteTargetId(null);
    };

    const handleServingsChange = (recipeId: string, servings: number) => {
        setServingsMap((prev) => ({
            ...prev,
            [recipeId]: servings,
        }));
    };

    const getServingsForRecipe = (recipeId: string): number => {
        return servingsMap[recipeId] || 1;
    };

    const startTargetRecipe = useMemo(
        () => recipes.find((recipe) => recipe.id === startTargetId) ?? null,
        [recipes, startTargetId]
    );

    const startTargetCalculated = startTargetRecipe
        ? calculateRecipeForServings(startTargetRecipe, getServingsForRecipe(startTargetRecipe.id))
        : null;

    const handleOpenStart = (recipeId: string) => {
        setStartTargetId(recipeId);
    };

    const handleStartGuide = () => {
        if (!startTargetRecipe) return;
        const servings = getServingsForRecipe(startTargetRecipe.id);
        router.push(`/drip-guide/run?id=${startTargetRecipe.id}&servings=${servings}`);
        setStartTargetId(null);
    };

    const handleCloseStart = () => {
        setStartTargetId(null);
    };

    if (recipes.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                <p>レシピがまだありません。</p>
                <p className="text-sm mt-2">新しいレシピを作成して、ドリップガイドを始めましょう。</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => {
                    const servings = getServingsForRecipe(recipe.id);
                    const calculatedRecipe = calculateRecipeForServings(recipe, servings);

                    return (
                        <div
                            key={recipe.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-gray-800 line-clamp-1" title={recipe.name}>
                                    {recipe.name}
                                </h3>
                                <div className="flex gap-1">
                                    <Link
                                        href={`/drip-guide/edit?id=${recipe.id}`}
                                        className="p-3 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="編集"
                                    >
                                        <Pencil size={18} />
                                    </Link>
                                    {!recipe.isDefault && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteClick(recipe.id);
                                            }}
                                            className="p-3 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="削除"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                                <div className="flex items-center gap-2">
                                    <Coffee size={16} className="text-amber-700" />
                                    <span className="font-medium">{calculatedRecipe.beanName}</span>
                                    <span className="text-gray-400">({calculatedRecipe.beanAmountGram}g)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Drop size={16} className="text-blue-500" />
                                    <span>{calculatedRecipe.totalWaterGram}g</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer size={16} className="text-gray-500" />
                                    <span>
                                        {Math.floor(calculatedRecipe.totalDurationSec / 60)}分
                                        {calculatedRecipe.totalDurationSec % 60}秒
                                    </span>
                                </div>
                                {recipe.purpose && (
                                    <div className="mt-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                                        {recipe.purpose}
                                    </div>
                                )}
                            </div>

                            {/* 人前選択UI */}
                            <div className="mb-4">
                                <label htmlFor={`servings-${recipe.id}`} className="sr-only">
                                    人前を選択
                                </label>
                                <div className="relative">
                                    <select
                                        id={`servings-${recipe.id}`}
                                        value={servings}
                                        onChange={(e) => handleServingsChange(recipe.id, parseInt(e.target.value, 10))}
                                        className="w-full py-2 px-3 pr-10 rounded-lg text-sm font-medium transition-colors min-h-[44px] bg-white border border-gray-300 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none cursor-pointer"
                                        aria-label="人前を選択"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((serving) => (
                                            <option key={serving} value={serving}>
                                                {serving}人前
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <CaretDown size={16} className="text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleOpenStart(recipe.id)}
                                className={clsx(
                                    "mt-auto flex items-center justify-center gap-2 w-full py-3 sm:py-2.5 rounded-lg font-bold transition-all",
                                    "bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98] touch-manipulation"
                                )}
                            >
                                <Play size={20} weight="fill" />
                                ガイド開始
                            </button>
                        </div>
                    );
                })}
            </div>

            <ConfirmDialog
                isOpen={deleteTargetId !== null}
                title="レシピを削除"
                message="本当にこのレシピを削除しますか？この操作は取り消せません。"
                confirmText="削除"
                cancelText="キャンセル"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <StartHintDialog
                isOpen={startTargetId !== null}
                onClose={handleCloseStart}
                onStart={handleStartGuide}
                totalWaterGram={startTargetCalculated?.totalWaterGram}
                servings={startTargetRecipe ? getServingsForRecipe(startTargetRecipe.id) : undefined}
                recipeName={startTargetRecipe?.name}
            />
        </>
    );
};
