'use client';

import { useState, useEffect } from 'react';
import { DripRecipe } from './types';
import { MOCK_RECIPES } from './mockData';

const STORAGE_KEY = 'roastplus_drip_recipes';
const MIGRATION_FLAG_KEY = 'roastplus_drip_recipes_migrated_to_1serving';

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
    const [recipes, setRecipes] = useState<DripRecipe[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const migrationFlag = localStorage.getItem(MIGRATION_FLAG_KEY);
        let loadedRecipes: DripRecipe[] = [];

        if (stored) {
            try {
                loadedRecipes = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse recipes', e);
                loadedRecipes = [];
            }
        }

        // マイグレーション: 2人前基準から1人前基準への変換（1回だけ実行）
        if (loadedRecipes.length > 0 && migrationFlag !== 'true') {
            console.log('Migrating recipes from 2 servings to 1 serving...');
            loadedRecipes = loadedRecipes.map(migrateRecipeTo1Serving);
            // 変換後のレシピを保存
            localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedRecipes));
            // マイグレーションフラグを設定
            localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        }

        // デフォルトレシピを常に含める
        const defaultRecipes = MOCK_RECIPES.filter(r => r.isDefault);

        // ユーザーレシピのIDセットを作成
        const userRecipeIds = new Set(loadedRecipes.map(r => r.id));

        // デフォルトレシピから、ユーザーレシピと重複するIDを除外
        // （ユーザーが編集したデフォルトレシピは、localStorageのバージョンを優先）
        const defaultRecipesToInclude = defaultRecipes.filter(r => !userRecipeIds.has(r.id));

        // デフォルトレシピとユーザーレシピを結合
        const allRecipes = [...defaultRecipesToInclude, ...loadedRecipes];

        setRecipes(allRecipes);
        setIsLoaded(true);
    }, []);

    const saveRecipes = (newRecipes: DripRecipe[]) => {
        setRecipes(newRecipes);
        // デフォルトレシピのIDリストを取得
        const defaultRecipeIds = new Set(MOCK_RECIPES.filter(r => r.isDefault).map(r => r.id));
        
        // デフォルトレシピ（編集済み）とユーザーレシピを保存
        // デフォルトレシピのIDの場合は、isDefault: trueのまま保存
        // 通常のユーザーレシピはそのまま保存
        const recipesToSave = newRecipes.filter(r => {
            // デフォルトレシピのIDの場合は保存（編集済みデフォルトレシピ）
            if (defaultRecipeIds.has(r.id)) {
                return true;
            }
            // 通常のユーザーレシピも保存
            return !r.isDefault;
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recipesToSave));
    };

    const addRecipe = (recipe: DripRecipe) => {
        const newRecipes = [...recipes, recipe];
        saveRecipes(newRecipes);
    };

    const updateRecipe = (recipe: DripRecipe) => {
        // デフォルトレシピのIDリストを取得
        const defaultRecipeIds = new Set(MOCK_RECIPES.filter(r => r.isDefault).map(r => r.id));
        
        // デフォルトレシピのIDの場合は、isDefaultを保持する
        const updatedRecipe = defaultRecipeIds.has(recipe.id)
            ? { ...recipe, isDefault: true }
            : recipe;
        
        const newRecipes = recipes.map((r) => (r.id === recipe.id ? updatedRecipe : r));
        saveRecipes(newRecipes);
    };

    const deleteRecipe = (id: string) => {
        // デフォルトレシピは削除できない
        const recipeToDelete = recipes.find((r) => r.id === id);
        if (recipeToDelete?.isDefault) {
            console.warn('Cannot delete default recipe:', id);
            return;
        }
        const newRecipes = recipes.filter((r) => r.id !== id);
        saveRecipes(newRecipes);
    };

    const getRecipe = (id: string) => {
        return recipes.find((r) => r.id === id);
    };

    return {
        recipes,
        isLoaded,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipe,
    };
}
