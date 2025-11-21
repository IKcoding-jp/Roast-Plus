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
        const userRecipes = loadedRecipes.filter(r => !r.isDefault);

        // デフォルトレシピとユーザーレシピを結合
        const allRecipes = [...defaultRecipes, ...userRecipes];

        setRecipes(allRecipes);
        setIsLoaded(true);
    }, []);

    const saveRecipes = (newRecipes: DripRecipe[]) => {
        setRecipes(newRecipes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecipes));
    };

    const addRecipe = (recipe: DripRecipe) => {
        const newRecipes = [...recipes, recipe];
        saveRecipes(newRecipes);
    };

    const updateRecipe = (recipe: DripRecipe) => {
        const newRecipes = recipes.map((r) => (r.id === recipe.id ? recipe : r));
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
