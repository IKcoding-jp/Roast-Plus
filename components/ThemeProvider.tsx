'use client';

import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { THEME_IDS } from '@/lib/theme';

const OLD_STORAGE_KEY = 'roastplus_christmas_mode';
const OLD_MIGRATION_FLAG = 'roastplus_christmas_mode_migrated';
const MIGRATION_V2_FLAG = 'roastplus_theme_migrated_v2';

/**
 * 旧localStorage (roastplus_christmas_mode) から next-themes への
 * 一回限りのマイグレーションを行うコンポーネント
 */
function ThemeMigration({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const migrated = localStorage.getItem(MIGRATION_V2_FLAG);
    if (migrated) return;

    // 旧キーの値を読み取り、next-themes に引き継ぐ
    const oldValue = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldValue === 'true') {
      setTheme('christmas');
    }

    // 旧キーをクリーンアップ
    localStorage.removeItem(OLD_STORAGE_KEY);
    localStorage.removeItem(OLD_MIGRATION_FLAG);
    localStorage.setItem(MIGRATION_V2_FLAG, 'true');
  }, [setTheme]);

  return <>{children}</>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="default"
      themes={THEME_IDS}
      storageKey="roastplus_theme"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemeMigration>{children}</ThemeMigration>
    </NextThemesProvider>
  );
}
