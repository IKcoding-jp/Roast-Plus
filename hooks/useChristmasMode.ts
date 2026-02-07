'use client';

import { useCallback } from 'react';
import { useTheme } from 'next-themes';

/**
 * クリスマスモードの切り替えフック（後方互換性ラッパー）
 *
 * 内部で next-themes の useTheme を使用し、
 * data-theme 属性の切り替え + CSS変数によるテーマ適用を行う。
 *
 * 既存の isChristmasMode API はそのまま維持するため、
 * 既存コードを修正せずにテーマシステムに移行可能。
 */
export function useChristmasMode() {
    const { resolvedTheme, setTheme } = useTheme();

    const isChristmasMode = resolvedTheme === 'christmas';

    const setChristmasMode = useCallback((enabled: boolean) => {
        setTheme(enabled ? 'christmas' : 'default');
    }, [setTheme]);

    const toggleChristmasMode = useCallback(() => {
        setTheme(isChristmasMode ? 'default' : 'christmas');
    }, [isChristmasMode, setTheme]);

    return {
        isChristmasMode,
        setChristmasMode,
        toggleChristmasMode,
    };
}
