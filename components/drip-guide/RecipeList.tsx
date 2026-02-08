'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DripRecipe } from '@/lib/drip-guide/types';
import { Timer, Coffee, Drop, Trash, Pencil, Play, CaretDown } from 'phosphor-react';
import { clsx } from 'clsx';
import { Dialog, Card, Button, IconButton } from '@/components/ui';
import { StartHintDialog } from './StartHintDialog';
import { Start46Dialog } from './Start46Dialog';
import { StartHoffmannDialog } from './StartHoffmannDialog';
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
        setDeleteTargetId(recipeId);
    };

    const handleConfirmDelete = () => {
        if (deleteTargetId) {
            onDelete(deleteTargetId);
            setDeleteTargetId(null);
        }
    };

    const handleCancelDelete = () => {
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

    // デフォルトレシピの表示順序を明示的に指定（BYSN → 井崎 → 粕谷 → Hoffmann）
    const sortedRecipes = useMemo(() => {
        const defaultOrder = ['recipe-001', 'recipe-003', 'recipe-046', 'recipe-hoffmann'];
        return [...recipes].sort((a, b) => {
            const indexA = defaultOrder.indexOf(a.id);
            const indexB = defaultOrder.indexOf(b.id);
            // デフォルトレシピは指定順序で、カスタムレシピはその後に
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [recipes]);

    if (recipes.length === 0) {
        return (
            <div className="text-center py-10 text-ink-muted">
                <p>レシピがまだありません。</p>
                <p className="text-sm mt-2">新しいレシピを作成して、ドリップガイドを始めましょう。</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedRecipes.map((recipe) => {
                    const servings = getServingsForRecipe(recipe.id);
                    const calculatedRecipe = calculateRecipeForServings(recipe, servings);

                    return (
                        <Card
                            key={recipe.id}
                            variant="hoverable"
                            className="p-4 sm:p-5 flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-ink line-clamp-1" title={recipe.name}>
                                    {recipe.name}
                                </h3>
                                <div className="flex gap-1">
                                    {recipe.id !== 'recipe-046' && recipe.id !== 'recipe-hoffmann' && (
                                        <Link
                                            href={`/drip-guide/edit?id=${recipe.id}`}
                                            className="p-3 sm:p-2 text-ink-muted hover:text-info hover:bg-info/10 rounded-full transition-colors"
                                            title="編集"
                                        >
                                            <Pencil size={18} />
                                        </Link>
                                    )}
                                    {!recipe.isDefault && (
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteClick(recipe.id);
                                            }}
                                            className="text-ink-muted hover:text-danger hover:bg-danger-subtle"
                                            title="削除"
                                        >
                                            <Trash size={18} />
                                        </IconButton>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-ink-sub mb-4 flex-grow">
                                <div className="flex items-center gap-2">
                                    <Coffee size={16} className="text-spot" />
                                    <span className="font-medium">{calculatedRecipe.beanName}</span>
                                    <span className="text-ink-muted">({calculatedRecipe.beanAmountGram}g)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Drop size={16} className="text-info" />
                                    <span>{calculatedRecipe.totalWaterGram}g</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer size={16} className="text-ink-muted" />
                                    <span>
                                        {Math.floor(calculatedRecipe.totalDurationSec / 60)}分
                                        {calculatedRecipe.totalDurationSec % 60}秒
                                    </span>
                                </div>
                                {recipe.purpose && (
                                    <div className="mt-2 inline-block px-2 py-0.5 bg-ground text-ink-sub text-xs rounded-md">
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
                                        className="w-full py-2 px-3 pr-10 rounded-lg text-sm font-medium transition-colors min-h-[44px] bg-field border border-edge text-ink hover:border-edge-strong focus:outline-none focus:ring-2 focus:ring-spot focus:border-spot appearance-none cursor-pointer"
                                        aria-label="人前を選択"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((serving) => (
                                            <option key={serving} value={serving}>
                                                {serving}人前
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <CaretDown size={16} className="text-ink-muted" />
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => handleOpenStart(recipe.id)}
                                className={clsx(
                                    "mt-auto gap-2 !rounded-lg active:scale-[0.98] touch-manipulation"
                                )}
                            >
                                <Play size={20} weight="fill" />
                                ガイド開始
                            </Button>
                        </Card>
                    );
                })}
            </div>

            <Dialog
                isOpen={deleteTargetId !== null}
                title="レシピを削除"
                description="本当にこのレシピを削除しますか？この操作は取り消せません。"
                confirmText="削除"
                cancelText="キャンセル"
                onConfirm={handleConfirmDelete}
                onClose={handleCancelDelete}
                variant="danger"
            />

            {startTargetRecipe?.id === 'recipe-046' ? (
                <Start46Dialog
                    isOpen={startTargetId !== null}
                    onClose={handleCloseStart}
                    initialServings={startTargetRecipe ? getServingsForRecipe(startTargetRecipe.id) : 1}
                />
            ) : startTargetRecipe?.id === 'recipe-hoffmann' ? (
                <StartHoffmannDialog
                    isOpen={startTargetId !== null}
                    onClose={handleCloseStart}
                    initialServings={startTargetRecipe ? getServingsForRecipe(startTargetRecipe.id) : 1}
                />
            ) : (
                <StartHintDialog
                    isOpen={startTargetId !== null}
                    onClose={handleCloseStart}
                    onStart={handleStartGuide}
                    totalWaterGram={startTargetCalculated?.totalWaterGram}
                    servings={startTargetRecipe ? getServingsForRecipe(startTargetRecipe.id) : undefined}
                    recipeName={startTargetRecipe?.name}
                />
            )}
        </>
    );
};
