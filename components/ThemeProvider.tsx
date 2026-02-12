'use client';

import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { THEME_IDS, THEME_PRESETS } from '@/lib/theme';

const OLD_STORAGE_KEY = 'roastplus_christmas_mode';
const OLD_MIGRATION_FLAG = 'roastplus_christmas_mode_migrated';
const MIGRATION_V2_FLAG = 'roastplus_theme_migrated_v2';

/** テーマIDに対応するPWA用themeColorを取得 */
function getThemeColor(themeId: string | undefined): string {
  const preset = THEME_PRESETS.find((t) => t.id === themeId);
  return preset?.themeColor ?? THEME_PRESETS[0].themeColor;
}

/**
 * 旧localStorage (roastplus_christmas_mode) から next-themes への
 * 一回限りのマイグレーション + PWA theme-color 動的更新
 */
function ThemeMigration({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  // 旧テーマからのマイグレーション
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

  // テーマ変更時に meta[name="theme-color"] を動的更新
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (meta) {
      meta.content = getThemeColor(theme);
    }
  }, [theme]);

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
