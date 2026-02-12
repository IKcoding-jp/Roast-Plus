'use client';

import { useTheme } from 'next-themes';
import { THEME_PRESETS, isDarkTheme } from '@/lib/theme';

/**
 * 汎用テーマhook
 * テーマの取得・設定・判定を提供
 */
export function useAppTheme() {
  const { resolvedTheme, setTheme, themes } = useTheme();

  return {
    currentTheme: resolvedTheme,
    setTheme,
    themes,
    presets: THEME_PRESETS,
    isDarkTheme: isDarkTheme(resolvedTheme),
    isChristmasTheme: resolvedTheme === 'christmas',
  };
}
