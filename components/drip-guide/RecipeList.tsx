'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DripRecipe } from '@/lib/drip-guide/types';
import { Timer, Coffee, Drop, Trash, Pencil, Play } from 'phosphor-react';
import { clsx } from 'clsx';
import { ConfirmDialog } from './ConfirmDialog';

interface RecipeListProps {
    recipes: DripRecipe[];
    onDelete: (id: string) => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, onDelete }) => {
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-gray-800 line-clamp-1" title={recipe.name}>
                                {recipe.name}
                            </h3>
                            <div className="flex gap-1">
                                <Link
                                    href={`/drip-guide/${recipe.id}/edit`}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="編集"
                                >
                                    <Pencil size={18} />
                                </Link>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteClick(recipe.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="削除"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                            <div className="flex items-center gap-2">
                                <Coffee size={16} className="text-amber-700" />
                                <span className="font-medium">{recipe.beanName}</span>
                                <span className="text-gray-400">({recipe.beanAmountGram}g)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Drop size={16} className="text-blue-500" />
                                <span>{recipe.totalWaterGram}g</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Timer size={16} className="text-gray-500" />
                                <span>
                                    {Math.floor(recipe.totalDurationSec / 60)}分
                                    {recipe.totalDurationSec % 60}秒
                                </span>
                            </div>
                            {recipe.purpose && (
                                <div className="mt-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                                    {recipe.purpose}
                                </div>
                            )}
                        </div>

                        <Link
                            href={`/drip-guide/${recipe.id}/run`}
                            className={clsx(
                                "mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-bold transition-all",
                                "bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98]"
                            )}
                        >
                            <Play size={20} weight="fill" />
                            ガイド開始
                        </Link>
                    </div>
                ))}
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
