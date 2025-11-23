'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DripRecipe } from '@/lib/drip-guide/types';
import { Timer, Coffee, Drop, Trash, Pencil, Play } from 'phosphor-react';
import { clsx } from 'clsx';
import { ConfirmDialog } from './ConfirmDialog';
import { calculateRecipeForServings } from '@/lib/drip-guide/recipeCalculator';

interface RecipeListProps {
    recipes: DripRecipe[];
    onDelete: (id: string) => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, onDelete }) => {
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    // 各レシピごとの人前選択状態を管理（レシピID -> 人前数）
    const [servingsMap, setServingsMap] = useState<Record<string, number>>({});

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
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((serving) => (
                                        <button
                                            key={serving}
                                            type="button"
                                            onClick={() => handleServingsChange(recipe.id, serving)}
                                            className={clsx(
                                                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                                                servings === serving
                                                    ? "bg-amber-600 text-white shadow-sm"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            )}
                                        >
                                            {serving}人前
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href={`/drip-guide/run?id=${recipe.id}&servings=${servings}`}
                                className={clsx(
                                    "mt-auto flex items-center justify-center gap-2 w-full py-3 sm:py-2.5 rounded-lg font-bold transition-all",
                                    "bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98] touch-manipulation"
                                )}
                            >
                                <Play size={20} weight="fill" />
                                ガイド開始
                            </Link>
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
        </>
    );
};
