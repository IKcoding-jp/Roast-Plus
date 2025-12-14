'use client';

import { useState, useEffect, useCallback } from 'react';
import { DripRecipe } from './types';
import { MOCK_RECIPES } from './mockData';
import { useAppData } from '@/hooks/useAppData';

const STORAGE_KEY = 'roastplus_drip_recipes';
const MIGRATION_FLAG_KEY = 'roastplus_drip_recipes_migrated_to_firestore';

/**
 * 2人前基準のレシピを1人前基準に変換する
 */
function migrateRecipeTo1Serving(recipe: DripRecipe): DripRecipe {
    return {
        ...recipe,
        beanAmountGram: Math.round(recipe.beanAmountGram / 2),
        totalWaterGram: Math.round(recipe.totalWaterGram / 2),
        steps: recipe.steps.map((step) => ({
            ...step,
            targetTotalWater: step.targetTotalWater ? Math.round(step.targetTotalWater / 2) : undefined,
        })),
    };
}

export function useRecipes() {
    const { data, updateData, isLoading: appDataLoading } = useAppData();
    const [isLoaded, setIsLoaded] = useState(false);
    const [migrationChecked, setMigrationChecked] = useState(false);

    // 初回ロード時にlocalStorageからFirestoreへの移行を実行
    useEffect(() => {
        if (appDataLoading || migrationChecked) {
            return;
        }

        const migrationFlag = localStorage.getItem(MIGRATION_FLAG_KEY);
        if (migrationFlag === 'true') {
            // 既に移行済み
            queueMicrotask(() => {
                setMigrationChecked(true);
                setIsLoaded(true);
            });
            return;
        }

        // localStorageから既存データを読み込み
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // localStorageにデータがない場合は移行不要
            queueMicrotask(() => {
                setMigrationChecked(true);
                setIsLoaded(true);
            });
            return;
        }

        let loadedRecipes: DripRecipe[] = [];
        try {
            loadedRecipes = JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse recipes from localStorage', e);
            queueMicrotask(() => {
                setMigrationChecked(true);
                setIsLoaded(true);
            });
            return;
        }

        // 1人前基準への移行処理
        const migrationFlag1Serving = localStorage.getItem('roastplus_drip_recipes_migrated_to_1serving');
        if (loadedRecipes.length > 0 && migrationFlag1Serving !== 'true') {
            loadedRecipes = loadedRecipes.map(migrateRecipeTo1Serving);
        }

        // Firestoreに既存のdripRecipesがある場合は移行しない（既にFirestoreにデータがある）
        const firestoreRecipes = data.dripRecipes || [];
        if (firestoreRecipes.length > 0) {
            // Firestoreに既にデータがある場合は移行しない
            localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
            queueMicrotask(() => {
                setMigrationChecked(true);
                setIsLoaded(true);
            });
            return;
        }

        // Firestoreに移行
        if (loadedRecipes.length > 0) {
            updateData({
                ...data,
                dripRecipes: loadedRecipes,
            }).then(() => {
                // 移行完了後、localStorageをクリア
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem('roastplus_drip_recipes_migrated_to_1serving');
                localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
                setMigrationChecked(true);
                setIsLoaded(true);
            }).catch((error) => {
                console.error('Failed to migrate recipes to Firestore:', error);
                setMigrationChecked(true);
                setIsLoaded(true);
            });
        } else {
            queueMicrotask(() => {
                setMigrationChecked(true);
                setIsLoaded(true);
            });
        }
    }, [appDataLoading, migrationChecked, data, updateData]);

    // レシピリストを構築（デフォルトレシピ + Firestoreのレシピ）
    const recipes: DripRecipe[] = (() => {
        if (appDataLoading || !migrationChecked) {
            // ロード中はデフォルトレシピのみ表示
            return MOCK_RECIPES.filter((r) => r.isDefault);
        }

        const firestoreRecipes = data.dripRecipes || [];
        const defaultRecipes = MOCK_RECIPES.filter((r) => r.isDefault);
        
        // Firestoreに保存されているレシピIDのセット
        const firestoreRecipeIds = new Set(firestoreRecipes.map((r) => r.id));
        
        // デフォルトレシピのうち、Firestoreに存在しないもののみ追加
        const defaultRecipesToInclude = defaultRecipes.filter((r) => !firestoreRecipeIds.has(r.id));
        
        // Firestoreのレシピとデフォルトレシピをマージ
        // デフォルトレシピのIDと一致するFirestoreレシピがある場合は、Firestoreの方を優先
        const allRecipes = [...defaultRecipesToInclude, ...firestoreRecipes];
        
        // IDで重複を除去（Firestoreのレシピを優先）
        const uniqueRecipes = Array.from(
            new Map(allRecipes.map((r) => [r.id, r])).values()
        );
        
        return uniqueRecipes;
    })();

    const addRecipe = useCallback((recipe: DripRecipe) => {
        const currentRecipes = data.dripRecipes || [];
        const newRecipes = [...currentRecipes, recipe];
        updateData({
            ...data,
            dripRecipes: newRecipes,
        });
    }, [data, updateData]);

    const updateRecipe = useCallback((recipe: DripRecipe) => {
        const currentRecipes = data.dripRecipes || [];
        const defaultRecipeIds = new Set(MOCK_RECIPES.filter(r => r.isDefault).map(r => r.id));
        
        // デフォルトレシピのIDの場合は、isDefaultを保持する
        const updatedRecipe = defaultRecipeIds.has(recipe.id)
            ? { ...recipe, isDefault: true }
            : recipe;
        
        const newRecipes = currentRecipes.map((r) => (r.id === recipe.id ? updatedRecipe : r));
        
        // 既存のレシピがない場合は追加
        const existingIndex = newRecipes.findIndex((r) => r.id === recipe.id);
        if (existingIndex === -1) {
            newRecipes.push(updatedRecipe);
        }
        
        updateData({
            ...data,
            dripRecipes: newRecipes,
        });
    }, [data, updateData]);

    const deleteRecipe = useCallback((id: string) => {
        // デフォルトレシピは削除できない
        const recipeToDelete = recipes.find((r) => r.id === id);
        if (recipeToDelete?.isDefault) {
            console.warn('Cannot delete default recipe:', id);
            return;
        }
        
        const currentRecipes = data.dripRecipes || [];
        const newRecipes = currentRecipes.filter((r) => r.id !== id);
        updateData({
            ...data,
            dripRecipes: newRecipes,
        });
    }, [recipes, data, updateData]);

    const getRecipe = useCallback((id: string) => {
        return recipes.find((r) => r.id === id);
    }, [recipes]);

    return {
        recipes,
        isLoaded: isLoaded && migrationChecked && !appDataLoading,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipe,
    };
}
