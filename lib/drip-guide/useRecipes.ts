'use client';

import { useState, useEffect } from 'react';
import { DripRecipe } from './types';
import { MOCK_RECIPES } from './mockData';

const STORAGE_KEY = 'roastplus_drip_recipes';

export function useRecipes() {
    const [recipes, setRecipes] = useState<DripRecipe[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        let loadedRecipes: DripRecipe[] = [];

        if (stored) {
            try {
                loadedRecipes = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse recipes', e);
                loadedRecipes = [];
            }
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
        // デフォルトレシピを除外し、ユーザーレシピのみを保存
        const userRecipesOnly = newRecipes.filter(r => !r.isDefault);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userRecipesOnly));
    };

    const addRecipe = (recipe: DripRecipe) => {
        const newRecipes = [...recipes, recipe];
        saveRecipes(newRecipes);
    };

    const updateRecipe = (recipe: DripRecipe) => {
        // デフォルトレシピが編集された場合、isDefaultを削除してユーザーレシピとして保存
        const updatedRecipe = recipe.isDefault ? { ...recipe, isDefault: false } : recipe;
        const newRecipes = recipes.map((r) => (r.id === recipe.id ? updatedRecipe : r));
        saveRecipes(newRecipes);
    };

    const deleteRecipe = (id: string) => {
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
